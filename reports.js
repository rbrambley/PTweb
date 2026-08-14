function openReportModal() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    document.getElementById('report-start-date').value = formatDateInput(thirtyDaysAgo);
    document.getElementById('report-end-date').value = formatDateInput(today);
    document.getElementById('report-modal').style.display = 'block';
}

function openWeeklyReport() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    document.getElementById('report-start-date').value = formatDateInput(sevenDaysAgo);
    document.getElementById('report-end-date').value = formatDateInput(today);
    document.getElementById('report-modal').style.display = 'block';

    const reportForm = document.getElementById('report-form');
    if (reportForm.requestSubmit) {
        reportForm.requestSubmit();
    } else {
        reportForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
}

function getExerciseName(log, exerciseId) {
    if (log.exerciseSnapshot && log.exerciseSnapshot.name) {
        return log.exerciseSnapshot.name;
    }
    const exercise = exercises.find(ex => String(ex.id) === String(exerciseId));
    return exercise ? exercise.name : `Exercise ${exerciseId}`;
}

function generateReport() {
    const startInput = document.getElementById('report-start-date').value;
    const endInput = document.getElementById('report-end-date').value;
    const sessionFilter = document.getElementById('report-session-filter').value;
    const includeSummary = document.getElementById('report-include-summary').checked;
    const includeNotes = document.getElementById('report-include-notes').checked;
    const includePain = document.getElementById('report-include-pain').checked;
    const includeDifficulty = document.getElementById('report-include-difficulty').checked;
    const includeSwelling = document.getElementById('report-include-swelling').checked;
    const includeTimestamps = document.getElementById('report-include-timestamps').checked;

    const startDate = startInput ? new Date(`${startInput}T00:00:00`) : null;
    const endDate = endInput ? new Date(`${endInput}T23:59:59`) : null;

    const allLoggedDates = Array.from(new Set([...Object.keys(dailyLogs), ...Object.keys(swellingLogs)]));
    const filteredDates = allLoggedDates.filter(dateStr => {
        const date = new Date(`${dateStr}T00:00:00`);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
    }).sort();

    let totalSessions = 0;
    let totalExercises = 0;
    let completedExercises = 0;
    let painSum = 0;
    let painCount = 0;
    let difficultySum = 0;
    let difficultyCount = 0;
    let swellingSum = 0;
    let swellingCount = 0;

    const daysHtml = [];
    const textLines = [];

    filteredDates.forEach(dateStr => {
        const dayLog = dailyLogs[dateStr] || { sessions: {} };
        const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        textLines.push(`\n${formattedDate}`);
        textLines.push('-'.repeat(formattedDate.length));

        const sessionEntries = dayLog.sessions
            ? Object.entries(dayLog.sessions)
            : [['Default Session', dayLog]];

        const dayHtml = [];
        let hasVisibleSession = false;

        sessionEntries.forEach(([sessionName, sessionData]) => {
            if (sessionFilter !== 'all') {
                const knownSessions = ['morning', 'afternoon', 'evening'];
                if (sessionFilter === 'custom') {
                    if (knownSessions.includes(sessionName)) return;
                } else if (sessionName !== sessionFilter) {
                    return;
                }
            }

            const exerciseEntries = Object.entries(sessionData).filter(([key, log]) => {
                return log && typeof log === 'object' && (log.completed !== undefined || log.reps !== undefined);
            });

            if (exerciseEntries.length === 0) return;

            hasVisibleSession = true;
            totalSessions++;

            const sessionHtml = [];
            let sessionCompleted = 0;

            textLines.push(`  ${sessionName}`);

            exerciseEntries.forEach(([exerciseId, log]) => {
                if (log.excluded) return;
                totalExercises++;
                if (log.completed) {
                    completedExercises++;
                    sessionCompleted++;
                }

                if (log.pain != null) {
                    painSum += log.pain;
                    painCount++;
                }
                if (log.difficulty != null) {
                    difficultySum += log.difficulty;
                    difficultyCount++;
                }

                const name = getExerciseName(log, exerciseId);
                const statusText = log.completed ? 'Done' : 'Pending';
                const status = log.completed ? '<span class="status-complete">Done</span>' : '<span class="status-pending">Pending</span>';
                const details = [];
                if (log.reps != null) details.push(`${log.reps} reps`);
                if (log.weight != null) details.push(`${log.weight} lbs`);
                if (includePain && log.pain != null) details.push(`pain ${log.pain}/10`);
                if (includeDifficulty && log.difficulty != null) details.push(`difficulty ${log.difficulty}/10`);
                if (includeNotes && log.notes) details.push(`notes: ${log.notes}`);

                const time = includeTimestamps && log.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                const detailString = details.length ? ` — ${escapeHtml(details.join(', '))}` : '';
                const timeString = time ? ` <span class="report-time">@ ${time}</span>` : '';

                sessionHtml.push(`<li class="report-exercise">${status} <strong>${escapeHtml(name)}</strong>${detailString}${timeString}</li>`);

                const textDetail = details.length ? ` (${details.join(', ')})` : '';
                textLines.push(`    ${statusText} ${name}${textDetail}${time ? ` @ ${time}` : ''}`);
            });

            const sessionTotal = exerciseEntries.filter(([_, log]) => !log.excluded).length;
            const sessionRate = sessionTotal > 0 ? Math.round((sessionCompleted / sessionTotal) * 100) : 0;

            dayHtml.push(`
                <div class="report-session">
                    <div class="session-title">${escapeHtml(sessionName)} <span class="session-rate">${sessionCompleted}/${sessionTotal} (${sessionRate}%)</span></div>
                    <ul class="report-exercises">${sessionHtml.join('')}</ul>
                </div>
            `);
        });

        const daySwelling = swellingLogs[dateStr];
        if (includeSwelling && daySwelling) {
            const visibleEntries = Object.entries(daySwelling).filter(([time, swelling]) => {
                return swelling && (swelling.level != null || swelling.location || swelling.circumference != null || swelling.notes);
            });

            if (visibleEntries.length > 0) {
                const swellingHtmlEntries = [];
                visibleEntries.forEach(([time, swelling]) => {
                    if (swelling.level != null) {
                        swellingSum += swelling.level;
                        swellingCount++;
                    }

                    const swellingDetails = [];
                    if (swelling.level != null) swellingDetails.push(`level ${swelling.level}/10`);
                    if (swelling.location) swellingDetails.push(swelling.location);
                    if (swelling.circumference != null) swellingDetails.push(`${swelling.circumference} in`);
                    if (swelling.notes) swellingDetails.push(`notes: ${swelling.notes}`);

                    const detailString = swellingDetails.length ? ` — ${escapeHtml(swellingDetails.join(', '))}` : '';
                    swellingHtmlEntries.push(`<li class="report-exercise"><strong>${escapeHtml(time)}</strong>${detailString}</li>`);

                    textLines.push(`  Swelling (${time}): ${swellingDetails.join(', ')}`);
                });

                dayHtml.push(`
                    <div class="report-session">
                        <div class="session-title">Swelling</div>
                        <ul class="report-exercises">${swellingHtmlEntries.join('')}</ul>
                    </div>
                `);
                hasVisibleSession = true;
            }
        }

        if (hasVisibleSession) {
            daysHtml.push(`
                <div class="day-section">
                    <div class="day-title">${formattedDate}</div>
                    ${dayHtml.join('')}
                </div>
            `);
        } else {
            textLines.pop(); // remove empty date header
            textLines.pop();
        }
    });

    const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    const avgPain = painCount > 0 ? (painSum / painCount).toFixed(1) : '—';
    const avgDifficulty = difficultyCount > 0 ? (difficultySum / difficultyCount).toFixed(1) : '—';
    const avgSwelling = swellingCount > 0 ? (swellingSum / swellingCount).toFixed(1) : '—';

    const dateRangeText = startInput && endInput
        ? `${new Date(`${startInput}T00:00:00`).toLocaleDateString('en-US')} – ${new Date(`${endInput}T00:00:00`).toLocaleDateString('en-US')}`
        : 'All available dates';

    const summaryHtml = includeSummary && (totalExercises > 0 || swellingCount > 0) ? `
        <div class="summary">
            <div class="summary-card"><div class="value">${filteredDates.length}</div><div class="label">Days</div></div>
            <div class="summary-card"><div class="value">${totalSessions}</div><div class="label">Sessions</div></div>
            <div class="summary-card"><div class="value">${completedExercises}/${totalExercises}</div><div class="label">Completed</div></div>
            <div class="summary-card"><div class="value">${completionRate}%</div><div class="label">Completion Rate</div></div>
            <div class="summary-card"><div class="value">${avgPain}</div><div class="label">Avg Pain</div></div>
            <div class="summary-card"><div class="value">${avgDifficulty}</div><div class="label">Avg Difficulty</div></div>
            ${includeSwelling ? `<div class="summary-card"><div class="value">${avgSwelling}</div><div class="label">Avg Swelling</div></div>` : ''}
        </div>
    ` : '';

    const summaryText = includeSummary && (totalExercises > 0 || swellingCount > 0)
        ? `Summary: ${filteredDates.length} days, ${totalSessions} sessions, ${completedExercises}/${totalExercises} completed (${completionRate}%). Average pain: ${avgPain}, average difficulty: ${avgDifficulty}${includeSwelling ? `, average swelling: ${avgSwelling}` : ''}.`
        : '';

    const plainTextReport = [
        'PT Exercise Report',
        `Date range: ${dateRangeText}`,
        summaryText,
        ...textLines
    ].join('\n');

    const emailBody = `PT Exercise Report\nDate range: ${dateRangeText}\n${summaryText}\n(See attached or copy the full report from the app.)`;
    const smsBody = `PT Exercise Report: ${completedExercises}/${totalExercises} exercises completed (${completionRate}%) from ${dateRangeText}.`;

    const reportHtml = buildReportHtml({
        dateRangeText,
        summaryHtml,
        daysHtml: daysHtml.join(''),
        plainTextReport,
        emailBody,
        smsBody,
        hasData: totalExercises > 0 || swellingCount > 0
    });

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');

    closeModal();
}

function buildReportHtml({ dateRangeText, summaryHtml, daysHtml, plainTextReport, emailBody, smsBody, hasData }) {
    const noDataMessage = hasData ? '' : '<p class="no-data">No exercise data found for the selected filters.</p>';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PT Exercise Report</title>
    <style>
        body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; color: #212529; background: #ffffff; line-height: 1.6; }
        .actions { position: sticky; top: 0; background: #ffffff; padding: 12px 20px; margin: -20px -20px 20px; border-bottom: 1px solid #dee2e6; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; z-index: 10; }
        button { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9em; }
        .btn-primary { background: #667eea; color: #ffffff; }
        .btn-secondary { background: #e9ecef; color: #212529; }
        .report-header { text-align: center; margin-bottom: 24px; }
        .report-header h1 { margin-bottom: 4px; color: #764ba2; }
        .report-meta { color: #6c757d; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .summary-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 10px; padding: 14px; text-align: center; }
        .summary-card .value { font-size: 1.6em; font-weight: 700; color: #667eea; }
        .summary-card .label { font-size: 0.85em; color: #6c757d; }
        .day-section { margin-bottom: 20px; border: 1px solid #dee2e6; border-radius: 12px; padding: 16px; background: #ffffff; page-break-inside: avoid; }
        .day-title { font-size: 1.15em; font-weight: 700; margin-bottom: 12px; color: #764ba2; border-bottom: 1px solid #e9ecef; padding-bottom: 6px; }
        .report-session { margin-bottom: 14px; }
        .report-session:last-child { margin-bottom: 0; }
        .session-title { font-weight: 600; margin-bottom: 6px; color: #495057; }
        .session-rate { font-weight: 500; color: #6c757d; font-size: 0.9em; margin-left: 6px; }
        .report-exercises { list-style: none; padding: 0; margin: 0; }
        .report-exercise { padding: 6px 0; border-bottom: 1px solid #f1f3f5; }
        .report-exercise:last-child { border-bottom: none; }
        .report-time { font-size: 0.85em; color: #6c757d; margin-left: 6px; }
        .no-data { text-align: center; color: #6c757d; font-style: italic; padding: 40px 0; }
        @media print { .actions { display: none !important; } body { padding: 0; } }
        @media (max-width: 600px) { body { padding: 12px; } .actions { margin: -12px -12px 12px; } .summary { grid-template-columns: repeat(2, 1fr); } }
    </style>
</head>
<body>
    <div class="actions">
        <button class="btn-primary" onclick="window.print()">Save to PDF / Print</button>
        <button class="btn-secondary" id="copy-report">Copy Report Text</button>
        <button class="btn-secondary" id="email-report">Email Summary</button>
        <button class="btn-secondary" id="text-report">Text Summary</button>
        <button class="btn-secondary" onclick="window.close()">Close</button>
    </div>
    <div class="report-header">
        <h1>PT Exercise Report</h1>
        <div class="report-meta">${escapeHtml(dateRangeText)}</div>
    </div>
    ${summaryHtml}
    ${noDataMessage}
    ${daysHtml}
    <script>
        const reportText = ${JSON.stringify(plainTextReport).replace(/</g, '\\u003c')};
        const emailBody = ${JSON.stringify(emailBody).replace(/</g, '\\u003c')};
        const smsBody = ${JSON.stringify(smsBody).replace(/</g, '\\u003c')};

        document.getElementById('copy-report').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(reportText);
                alert('Report copied to clipboard');
            } catch (err) {
                alert('Could not copy report. Please select and copy manually.');
            }
        });

        document.getElementById('email-report').addEventListener('click', () => {
            window.location.href = 'mailto:?subject=' + encodeURIComponent('PT Exercise Report') + '&body=' + encodeURIComponent(emailBody);
        });

        document.getElementById('text-report').addEventListener('click', () => {
            window.location.href = 'sms:?body=' + encodeURIComponent(smsBody);
        });
    <\/script>
</body>
</html>`;
}