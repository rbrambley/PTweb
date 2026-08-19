// Calendar functions
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    const tooltip = document.getElementById('calendar-tooltip');
    if (tooltip) tooltip.classList.remove('visible');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month label
    monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    const today = new Date();
    const todayStr = formatDateInput(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLog = dailyLogs[dateStr];
        
        let dayClass = 'calendar-day';
        let indicator = '';
        let status = 'no data';
        const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        if (dateStr === todayStr) {
            dayClass += ' today';
        }

        if (dayLog) {
            let totalExercises = 0;
            let completedExercises = 0;

            if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
                // New session-based structure
                Object.values(dayLog.sessions).forEach(session => {
                    Object.values(session).forEach(exerciseData => {
                        if (exerciseData.excluded) return;
                        totalExercises++;
                        if (exerciseData.completed) completedExercises++;
                    });
                });
            } else {
                // Old data structure for backward compatibility
                const exerciseEntries = Object.entries(dayLog).filter(([key, log]) => key !== 'sessions' && log && typeof log === 'object' && !log.excluded);
                totalExercises = exerciseEntries.length;
                completedExercises = exerciseEntries.filter(([key, log]) => log.completed).length;
            }

            if (completedExercises === totalExercises && totalExercises > 0) {
                dayClass += ' has-data';
                indicator = '✓';
                status = 'all exercises completed';
            } else if (completedExercises > 0) {
                dayClass += ' partial';
                indicator = `${completedExercises}/${totalExercises}`;
                status = `${completedExercises} of ${totalExercises} exercises completed`;
            } else if (totalExercises > 0) {
                status = 'exercises logged, none completed';
            }
        }

        if (dateStr === todayStr) {
            status = `today, ${status}`;
        }

        html += `
            <div class="${dayClass}" data-date="${dateStr}" aria-label="${formattedDate}: ${status}" tabindex="0" role="button">
                <span class="calendar-day-number">${day}</span>
                ${indicator ? `<span class="calendar-day-indicator">${indicator}</span>` : ''}
            </div>
        `;
    }
    
    grid.innerHTML = html;
    updateCalendarMonthStats(year, month);
    
    // Add click and hover handlers to calendar days
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', function() {
            const date = this.dataset.date;
            openCalendarDayModal(date);
        });

        day.addEventListener('mouseenter', function() {
            const date = this.dataset.date;
            tooltip.innerHTML = getCalendarDayTooltip(date);
            tooltip.classList.add('visible');
            tooltip.setAttribute('aria-hidden', 'false');
            positionCalendarTooltip(this, tooltip);
        });

        day.addEventListener('mouseleave', function() {
            tooltip.classList.remove('visible');
            tooltip.setAttribute('aria-hidden', 'true');
        });
    });
}

function getCalendarDayTooltip(dateStr) {
    const dayLog = dailyLogs[dateStr];
    const dateLabel = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    let totalExercises = 0;
    let completedExercises = 0;
    let sessionsHtml = '';

    if (dayLog) {
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            sessionsHtml = Object.entries(dayLog.sessions).map(([sessionName, sessionData]) => {
                const exerciseEntries = Object.entries(sessionData);
                if (exerciseEntries.length === 0) return '';
                const exerciseList = exerciseEntries.map(([exerciseId, exerciseData]) => {
                    if (exerciseData.excluded) return '';
                    totalExercises++;
                    if (exerciseData.completed) completedExercises++;
                    const exerciseName = getExerciseName(exerciseData, exerciseId);
                    const statusIcon = exerciseData.completed ? '✓' : '○';
                    return `<div class="tooltip-exercise"><span class="tooltip-status ${exerciseData.completed ? 'complete' : 'incomplete'}">${statusIcon}</span> ${escapeHtml(exerciseName)}</div>`;
                }).join('');
                return `<div class="tooltip-session"><div class="tooltip-session-name">${escapeHtml(sessionName)}</div>${exerciseList}</div>`;
            }).join('');
        } else {
            // Old data structure for backward compatibility
            const exerciseEntries = Object.entries(dayLog).filter(([key, log]) => key !== 'sessions' && log && typeof log === 'object');
            sessionsHtml = exerciseEntries.map(([exerciseId, log]) => {
                if (log.excluded) return '';
                totalExercises++;
                if (log.completed) completedExercises++;
                const exerciseName = getExerciseName(log, exerciseId);
                const statusIcon = log.completed ? '✓' : '○';
                return `<div class="tooltip-exercise"><span class="tooltip-status ${log.completed ? 'complete' : 'incomplete'}">${statusIcon}</span> ${escapeHtml(exerciseName)}</div>`;
            }).join('');
        }
    }

    let swellingHtml = '';
    const daySwelling = swellingLogs[dateStr];
    if (daySwelling) {
        const entries = Object.entries(daySwelling).filter(([time, swelling]) => {
            return swelling && (swelling.level != null || swelling.location || swelling.circumference != null || swelling.notes);
        });
        if (entries.length > 0) {
            const swellingList = entries.map(([time, swelling]) => {
                const details = [];
                if (swelling.level != null) details.push(`level ${swelling.level}/10`);
                if (swelling.location) details.push(swelling.location);
                if (swelling.circumference != null) details.push(`${swelling.circumference} in`);
                if (swelling.notes) details.push(swelling.notes);
                const detailString = details.length ? ` — ${escapeHtml(details.join(', '))}` : '';
                return `<div class="tooltip-exercise">${escapeHtml(time)}${detailString}</div>`;
            }).join('');
            swellingHtml = `<div class="tooltip-session"><div class="tooltip-session-name">Swelling</div>${swellingList}</div>`;
        }
    }

    if (totalExercises === 0 && !swellingHtml) {
        return `<div class="tooltip-title">${dateLabel}</div><div class="tooltip-empty">No exercises or swelling logged.</div>`;
    }

    const summary = totalExercises > 0 ? `<div class="tooltip-summary">${completedExercises}/${totalExercises} completed</div>` : '';
    return `
        <div class="tooltip-title">${dateLabel}</div>
        ${summary}
        ${sessionsHtml}
        ${swellingHtml}
    `;
}

function positionCalendarTooltip(dayEl, tooltip) {
    const dayRect = dayEl.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 8;
    let left = dayRect.left + dayRect.width / 2 - tooltipRect.width / 2;
    let top = dayRect.bottom + padding;

    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top + tooltipRect.height > window.innerHeight - padding) {
        top = dayRect.top - tooltipRect.height - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function updateCalendarMonthStats(year, month) {
    const daysLoggedEl = document.getElementById('month-stat-days');
    const exercisesDoneEl = document.getElementById('month-stat-exercises');
    const completionRateEl = document.getElementById('month-stat-rate');
    const streakEl = document.getElementById('month-stat-streak');
    if (!daysLoggedEl || !exercisesDoneEl || !completionRateEl || !streakEl) return;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let daysLogged = 0;
    let totalExercises = 0;
    let completedExercises = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLog = dailyLogs[dateStr];
        if (!dayLog) continue;

        let dayTotal = 0;
        let dayCompleted = 0;

        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(exerciseData => {
                    if (exerciseData.excluded) return;
                    dayTotal++;
                    if (exerciseData.completed) dayCompleted++;
                });
            });
        } else {
            const exerciseEntries = Object.entries(dayLog).filter(([key, log]) => key !== 'sessions' && log && typeof log === 'object' && !log.excluded);
            dayTotal = exerciseEntries.length;
            dayCompleted = exerciseEntries.filter(([key, log]) => log.completed).length;
        }

        if (dayTotal > 0) daysLogged++;
        totalExercises += dayTotal;
        completedExercises += dayCompleted;
    }

    const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    const streak = computeCurrentStreak();

    daysLoggedEl.textContent = daysLogged;
    exercisesDoneEl.textContent = completedExercises;
    completionRateEl.textContent = `${completionRate}%`;
    streakEl.textContent = streak;
}

function computeCurrentStreak() {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // Check today first; if no data, start checking yesterday
    const todayStr = formatDateInput(checkDate);
    if (hasLoggedData(todayStr)) {
        streak++;
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateStr = formatDateInput(checkDate);
        if (!hasLoggedData(dateStr)) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
}

function hasLoggedData(dateStr) {
    const dayLog = dailyLogs[dateStr];
    if (!dayLog) return false;
    if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
        return Object.values(dayLog.sessions).some(session => Object.keys(session).length > 0);
    }
    return Object.keys(dayLog).length > 0;
}

function openCalendarDayModal(dateStr) {
    const modal = document.getElementById('day-detail-modal');
    const title = document.getElementById('day-detail-title');
    const body = document.getElementById('day-detail-body');
    const editBtn = document.getElementById('day-detail-edit');

    const dateLabel = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    title.textContent = dateLabel;

    const dayLog = dailyLogs[dateStr];
    let totalExercises = 0;
    let completedExercises = 0;
    let sessionsHtml = '';

    if (dayLog) {
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            sessionsHtml = Object.entries(dayLog.sessions).map(([sessionName, sessionData]) => {
                const exerciseEntries = Object.entries(sessionData);
                if (exerciseEntries.length === 0) return '';
                const exerciseList = exerciseEntries.map(([exerciseId, exerciseData]) => {
                    const exerciseName = getExerciseName(exerciseData, exerciseId);
                    const statusIcon = exerciseData.excluded ? '<span class="status-skipped">Skipped</span>' : (exerciseData.completed ? '<span class="status-complete">Done</span>' : '<span class="status-pending">Pending</span>');
                    const metaParts = [];
                    if (!exerciseData.excluded) {
                        totalExercises++;
                        if (exerciseData.completed) completedExercises++;
                        if (exerciseData.reps) metaParts.push(`${exerciseData.reps} reps`);
                        if (exerciseData.weight) metaParts.push(`${exerciseData.weight}`);
                        if (exerciseData.timestamp) {
                            metaParts.push(new Date(exerciseData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        }
                    }
                    const meta = metaParts.length > 0 ? `<span class="day-detail-exercise-meta">${escapeHtml(metaParts.join(' • '))}</span>` : '';
                    return `
                        <div class="day-detail-exercise">
                            <span class="day-detail-exercise-status">${statusIcon}</span>
                            <span class="day-detail-exercise-name">${escapeHtml(exerciseName)}</span>
                            ${meta}
                        </div>
                    `;
                }).join('');
                return `
                    <div class="day-detail-session">
                        <div class="day-detail-session-title">${escapeHtml(sessionName)}</div>
                        ${exerciseList}
                    </div>
                `;
            }).join('');
        } else {
            const exerciseEntries = Object.entries(dayLog).filter(([key, log]) => key !== 'sessions' && log && typeof log === 'object');
            sessionsHtml = exerciseEntries.map(([exerciseId, log]) => {
                const exerciseName = getExerciseName(log, exerciseId);
                const statusIcon = log.excluded ? '<span class="status-skipped">Skipped</span>' : (log.completed ? '<span class="status-complete">Done</span>' : '<span class="status-pending">Pending</span>');
                if (!log.excluded) {
                    totalExercises++;
                    if (log.completed) completedExercises++;
                }
                return `
                    <div class="day-detail-exercise">
                        <span class="day-detail-exercise-status">${statusIcon}</span>
                        <span class="day-detail-exercise-name">${escapeHtml(exerciseName)}</span>
                    </div>
                `;
            }).join('');
        }
    }

    let swellingHtml = '';
    const daySwelling = swellingLogs[dateStr];
    if (daySwelling) {
        const entries = Object.entries(daySwelling).filter(([time, swelling]) => {
            return swelling && (swelling.level != null || swelling.location || swelling.circumference != null || swelling.notes);
        });
        if (entries.length > 0) {
            const swellingList = entries.map(([time, swelling]) => {
                const details = [];
                if (swelling.level != null) details.push(`level ${swelling.level}/10`);
                if (swelling.location) details.push(swelling.location);
                if (swelling.circumference != null) details.push(`${swelling.circumference} in`);
                if (swelling.notes) details.push(swelling.notes);
                const detailString = details.length ? `<span class="day-detail-exercise-meta">${escapeHtml(details.join(' • '))}</span>` : '';
                return `
                    <div class="day-detail-exercise">
                        <span class="day-detail-exercise-name">${escapeHtml(time)}</span>
                        ${detailString}
                    </div>
                `;
            }).join('');
            swellingHtml = `
                <div class="day-detail-session">
                    <div class="day-detail-session-title">Swelling</div>
                    ${swellingList}
                </div>
            `;
        }
    }

    if (totalExercises === 0 && !swellingHtml) {
        body.innerHTML = '<div class="day-detail-empty">No exercises or swelling logged for this day.</div>';
    } else {
        let summaryHtml = '';
        if (totalExercises > 0) {
            const completionRate = Math.round((completedExercises / totalExercises) * 100);
            summaryHtml = `
                <div class="day-detail-summary">
                    <div class="day-detail-summary-item">
                        <span class="day-detail-summary-label">Exercises</span>
                        <span class="day-detail-summary-value">${totalExercises}</span>
                    </div>
                    <div class="day-detail-summary-item">
                        <span class="day-detail-summary-label">Completed</span>
                        <span class="day-detail-summary-value">${completedExercises}</span>
                    </div>
                    <div class="day-detail-summary-item">
                        <span class="day-detail-summary-label">Completion</span>
                        <span class="day-detail-summary-value">${completionRate}%</span>
                    </div>
                </div>
            `;
        }
        body.innerHTML = `${summaryHtml}${sessionsHtml}${swellingHtml}`;
    }

    editBtn.onclick = () => {
        document.getElementById('log-date').value = dateStr;
        modal.style.display = 'none';
        switchTab('daily');
    };

    modal.style.display = 'block';
}
