// Daily log UI and save functions

function renderDailyExercises() {
    const container = document.getElementById('daily-exercises');
    updateSessionOptions();
    const selectedDate = document.getElementById('log-date').value;
    const sessionType = document.getElementById('session-type').value;
    let sessionName = sessionType;

    if (sessionType === 'custom') {
        const customName = document.getElementById('custom-session-name').value.trim();
        sessionName = customName || 'custom';
    }

    // Filter out inactive exercises for daily view, but keep them if they
    // were already logged in this session on a previous date so they can be edited.
    const activeExercises = exercises.filter(ex => {
        if (ex.metadata?.isActive !== false) return true;
        return !!dailyLogs[selectedDate]?.sessions?.[sessionName]?.[ex.id];
    });

    if (activeExercises.length === 0) {
        container.innerHTML = '<p>No active exercises. Go to "Manage Exercises" to add or activate exercises.</p>';
        return;
    }

    container.innerHTML = activeExercises.map(exercise => {
        const existingLog = dailyLogs[selectedDate]?.sessions?.[sessionName]?.[exercise.id] || {};
        const lastValues = getLastExerciseValues(exercise.id);
        const logData = { ...lastValues, ...existingLog };

        return `
            <div class="exercise-card collapsed ${logData.excluded ? 'excluded' : ''}" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <h3 class="exercise-title">${exercise.name}</h3>
                    <button class="collapse-btn" type="button" aria-label="Toggle exercise details" title="Collapse/expand" aria-expanded="false">▼</button>
                </div>
                <p class="exercise-description">${exercise.description}</p>

                <div class="exercise-details">
                    ${exercise.reps ? `<span class="detail-item"><span class="detail-label">Reps:</span> ${exercise.reps}</span>` : ''}
                    ${exercise.hold ? `<span class="detail-item"><span class="detail-label">Hold:</span> ${exercise.hold}</span>` : ''}
                    ${exercise.frequency ? `<span class="detail-item"><span class="detail-label">Frequency:</span> ${exercise.frequency}</span>` : ''}
                    ${exercise.weight ? `<span class="detail-item"><span class="detail-label">Weight:</span> ${exercise.weight}</span>` : ''}
                </div>

                ${dailyLogs[selectedDate]?.sessions ? `
                <div class="session-history">
                    <h4>Today's Sessions:</h4>
                    ${Object.entries(dailyLogs[selectedDate].sessions).map(([sessionName, sessionData]) => {
                        const exerciseData = sessionData[exercise.id];
                        if (!exerciseData) return '';
                        return `
                        <div class="session-item">
                            <span class="session-name">${sessionName}</span>
                            <span class="session-status">${exerciseData.excluded ? '<span class="status-skipped">Skipped</span>' : (exerciseData.completed ? '<span class="status-complete">Done</span>' : '<span class="status-pending">Pending</span>')}</span>
                            ${exerciseData.reps ? `<span class="session-reps">${exerciseData.reps} reps</span>` : ''}
                            ${exerciseData.timestamp ? `<span class="session-time">${new Date(exerciseData.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>` : ''}
                        </div>
                        `;
                    }).join('')}
                </div>
                ` : ''}

                <div class="tracking-section">
                    ${exercise.hold ? `
                    <div class="exercise-timer">
                        <button class="btn btn-secondary timer-btn" data-exercise-id="${exercise.id}">
                            <span class="timer-icon">⏱️</span>
                            <span class="timer-text">Start Timer</span>
                        </button>
                        <span class="timer-display" id="timer-display-${exercise.id}" aria-live="polite">0:00</span>
                    </div>
                    ` : ''}

                    <div class="completion-checkbox">
                        <input type="checkbox" id="completed-${exercise.id}" ${logData.completed ? 'checked' : ''} ${logData.excluded ? 'disabled' : ''}>
                        <label for="completed-${exercise.id}">Completed</label>
                    </div>

                    <div class="skip-checkbox" title="Skip this exercise in this session">
                        <input type="checkbox" id="excluded-${exercise.id}" ${logData.excluded ? 'checked' : ''}>
                        <label for="excluded-${exercise.id}">Skip this session</label>
                    </div>

                    <div class="tracking-row">
                        <div class="tracking-group">
                            <label>Reps Completed:</label>
                            <input type="number" id="reps-${exercise.id}" value="${logData.reps || ''}" placeholder="Actual reps done" ${logData.excluded ? 'disabled' : ''}>
                        </div>
                        <div class="tracking-group">
                            <label>Weight Used (lbs):</label>
                            <input type="number" id="weight-${exercise.id}" value="${logData.weight || ''}" placeholder="Weight if applicable" ${logData.excluded ? 'disabled' : ''}>
                        </div>
                        <div class="tracking-group">
                            <label>Pain Level (1-10):</label>
                            <input type="number" id="pain-${exercise.id}" value="${logData.pain || ''}" min="1" max="10" placeholder="1-10" ${logData.excluded ? 'disabled' : ''}>
                        </div>
                        <div class="tracking-group">
                            <label>Difficulty (1-10):</label>
                            <input type="number" id="difficulty-${exercise.id}" value="${logData.difficulty || ''}" min="1" max="10" placeholder="1-10" ${logData.excluded ? 'disabled' : ''}>
                        </div>
                    </div>

                    <div class="tracking-group">
                        <label>Notes:</label>
                        <textarea id="notes-${exercise.id}" rows="2" placeholder="How did it feel? Any modifications?" ${logData.excluded ? 'disabled' : ''}>${logData.notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Set up timer buttons after rendering
    setupTimerButtons();
}

function getLastExerciseValues(exerciseId) {
    const dates = Object.keys(dailyLogs).sort().reverse();
    for (const date of dates) {
        const dayLog = dailyLogs[date];
        if (!dayLog) continue;
        const sessions = dayLog.sessions || { 'Default Session': dayLog };
        for (const sessionName of Object.keys(sessions)) {
            const exerciseData = sessions[sessionName]?.[exerciseId];
            if (!exerciseData) continue;
            if (exerciseData.excluded) continue;
            const hasValues = exerciseData.reps != null ||
                exerciseData.weight != null ||
                exerciseData.pain != null ||
                exerciseData.difficulty != null ||
                exerciseData.notes;
            if (hasValues) {
                return {
                    reps: exerciseData.reps ?? '',
                    weight: exerciseData.weight ?? '',
                    pain: exerciseData.pain ?? '',
                    difficulty: exerciseData.difficulty ?? '',
                    notes: exerciseData.notes || ''
                };
            }
        }
    }
    return {};
}

function renderSwellingLog() {
    const selectedDate = document.getElementById('log-date').value;
    const time = document.getElementById('swelling-time').value;
    const dayLogs = swellingLogs[selectedDate] || {};
    const swelling = dayLogs[time] || {};

    document.getElementById('swelling-level').value = swelling.level ?? '';
    document.getElementById('swelling-location').value = swelling.location || '';
    document.getElementById('swelling-circumference').value = swelling.circumference ?? '';
    document.getElementById('swelling-notes').value = swelling.notes || '';
}

function saveSwellingLog() {
    const selectedDate = document.getElementById('log-date').value;
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }

    const level = document.getElementById('swelling-level').value;
    const location = document.getElementById('swelling-location').value.trim();
    const circumference = document.getElementById('swelling-circumference').value;
    const time = document.getElementById('swelling-time').value;
    const notes = document.getElementById('swelling-notes').value;

    if (!swellingLogs[selectedDate]) {
        swellingLogs[selectedDate] = {};
    }
    swellingLogs[selectedDate][time] = {
        level: level !== '' ? parseInt(level) : null,
        location,
        circumference: circumference !== '' ? parseFloat(circumference) : null,
        time,
        notes,
        timestamp: new Date().toISOString()
    };

    saveSwellingLogs();
    alert('Swelling log saved!');
}

function saveDayProgress() {
    const selectedDate = document.getElementById('log-date').value;
    const sessionType = document.getElementById('session-type').value;
    let sessionName = sessionType;

    if (sessionType === 'custom') {
        const customName = document.getElementById('custom-session-name').value.trim();
        if (!customName) {
            alert('Please enter a custom session name');
            return;
        }
        sessionName = customName;
    }

    if (!selectedDate) {
        alert('Please select a date');
        return;
    }

    if (!dailyLogs[selectedDate]) {
        dailyLogs[selectedDate] = {
            sessions: {}
        };
    }

    if (!dailyLogs[selectedDate].sessions) {
        dailyLogs[selectedDate].sessions = {};
    }

    if (!dailyLogs[selectedDate].sessions[sessionName]) {
        dailyLogs[selectedDate].sessions[sessionName] = {};
    }

    const timestamp = new Date().toISOString();

    exercises.forEach(exercise => {
        const excludedEl = document.getElementById(`excluded-${exercise.id}`);
        if (excludedEl && excludedEl.checked) {
            const existingLog = dailyLogs[selectedDate]?.sessions?.[sessionName]?.[exercise.id] || {};
            dailyLogs[selectedDate].sessions[sessionName][exercise.id] = {
                ...existingLog,
                excluded: true,
                completed: false,
                timestamp,
                exerciseSnapshot: existingLog.exerciseSnapshot || {
                    id: exercise.id,
                    name: exercise.name,
                    description: exercise.description,
                    reps: exercise.reps,
                    hold: exercise.hold,
                    frequency: exercise.frequency,
                    weight: exercise.weight,
                    version: exercise.metadata?.version || 1
                }
            };
            return;
        }
        if (!document.getElementById(`completed-${exercise.id}`)) return;
        const completed = document.getElementById(`completed-${exercise.id}`).checked;
        const reps = document.getElementById(`reps-${exercise.id}`).value;
        const weight = document.getElementById(`weight-${exercise.id}`).value;
        const pain = document.getElementById(`pain-${exercise.id}`).value;
        const difficulty = document.getElementById(`difficulty-${exercise.id}`).value;
        const notes = document.getElementById(`notes-${exercise.id}`).value;

        dailyLogs[selectedDate].sessions[sessionName][exercise.id] = {
            completed,
            excluded: false,
            reps: reps ? parseInt(reps) : null,
            weight: weight ? parseFloat(weight) : null,
            pain: pain ? parseInt(pain) : null,
            difficulty: difficulty ? parseInt(difficulty) : null,
            notes,
            timestamp,
            exerciseSnapshot: {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description,
                reps: exercise.reps,
                hold: exercise.hold,
                frequency: exercise.frequency,
                weight: exercise.weight,
                version: exercise.metadata?.version || 1
            }
        };
    });

    saveDailyLogs();
    alert(`Progress saved for ${sessionName} session!`);
    updateProgress();
}

function updateSessionOptions() {
    const select = document.getElementById('session-type');
    if (!select) return;
    const selectedDate = document.getElementById('log-date')?.value;
    const existingSessions = dailyLogs[selectedDate]?.sessions ? Object.keys(dailyLogs[selectedDate].sessions) : [];
    const defaultOptions = new Set(['morning', 'afternoon', 'evening', 'custom']);

    // Remove session options that belong to other dates
    Array.from(select.options).forEach(option => {
        if (!defaultOptions.has(option.value)) {
            select.removeChild(option);
        }
    });

    const existingOptions = new Set(Array.from(select.options).map(o => o.value));
    existingSessions.forEach(sessionName => {
        if (defaultOptions.has(sessionName) || existingOptions.has(sessionName)) return;
        const option = document.createElement('option');
        option.value = sessionName;
        option.textContent = sessionName;
        const customOption = select.querySelector('option[value="custom"]');
        if (customOption) {
            select.insertBefore(option, customOption);
        } else {
            select.appendChild(option);
        }
        existingOptions.add(sessionName);
    });

    if (select.value && !existingOptions.has(select.value)) {
        select.value = 'morning';
    }
}

function setupCollapseListeners() {
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.collapse-btn');
        if (!btn) return;
        const card = btn.closest('.exercise-card, .swelling-panel');
        if (card) {
            card.classList.toggle('collapsed');
            const isCollapsed = card.classList.contains('collapsed');
            btn.setAttribute('aria-expanded', String(!isCollapsed));
        }
    });
}

// Timer functions
function setupTimerButtons() {
    document.querySelectorAll('.timer-btn').forEach(btn => {
        if (btn.dataset.timerBound) return;
        btn.dataset.timerBound = 'true';
        btn.addEventListener('click', function() {
            const exerciseId = this.dataset.exerciseId;
            toggleTimer(exerciseId, this);
        });
    });
}

function toggleTimer(exerciseId, btn) {
    if (timers[exerciseId]) {
        // Stop timer
        clearInterval(timers[exerciseId].interval);
        delete timers[exerciseId];
        btn.classList.remove('running');
        btn.querySelector('.timer-text').textContent = 'Start Timer';
        return;
    }

    const exercise = exercises.find(ex => String(ex.id) === String(exerciseId));
    const totalSeconds = exercise ? parseHoldSeconds(exercise.hold) : 0;
    if (!totalSeconds) return;

    const display = document.getElementById(`timer-display-${exerciseId}`);
    if (display) display.classList.remove('timer-done');

    let remaining = totalSeconds;
    if (display) display.textContent = formatTime(remaining);

    timers[exerciseId] = {
        interval: setInterval(() => {
            remaining--;
            if (display) display.textContent = formatTime(remaining);
            if (remaining <= 0) {
                clearInterval(timers[exerciseId].interval);
                delete timers[exerciseId];
                btn.classList.remove('running');
                btn.querySelector('.timer-text').textContent = 'Start Timer';
                if (display) {
                    display.textContent = 'Done!';
                    display.classList.add('timer-done');
                    setTimeout(() => display.classList.remove('timer-done'), 2000);
                }
            }
        }, 1000),
        startTime: Date.now()
    };

    btn.classList.add('running');
    btn.querySelector('.timer-text').textContent = 'Stop Timer';
}

// Today shortcut for the Daily tab
document.getElementById('go-today').addEventListener('click', function() {
    document.getElementById('log-date').value = formatDateInput(new Date());
    renderDailyExercises();
    renderSwellingLog();
});
