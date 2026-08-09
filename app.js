// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Default exercises are defined in config.js
let exercises = [];
let dailyLogs = {};
let swellingLogs = {};
let editingExerciseId = null;
let currentCalendarDate = new Date();
let timers = {};

// Test mode flag - set to true to use mock data and separate storage
let testMode = false;

// Return-to-play milestones
let milestones = [];

// Groups milestones into recovery phases for the Return to Play timeline.
// Defined by milestone id ranges so it stays in sync even for milestones
// saved to localStorage before this grouping existed.
const milestonePhases = [
    { name: 'Weeks 1-2: Foundation', icon: '🌱', minId: 1, maxId: 4 },
    { name: 'Weeks 3-4: Building Strength', icon: '💪', minId: 5, maxId: 8 },
    { name: 'Weeks 5-6: Advanced Training', icon: '🚀', minId: 9, maxId: 12 },
    { name: 'Return to Competition', icon: '🏆', minId: 13, maxId: 13 }
];

let unlockedBadges = [];
let pendingExerciseUpdates = null;

// Mock data for testing
function createMockData() {
    const today = new Date();
    const mockDailyLogs = {};

    // Create 7 days of mock data (consecutive days ending today)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDateInput(date);

        mockDailyLogs[dateStr] = {
            sessions: {
                morning: {}
            }
        };

        // Add exercise data for each exercise
        PT_CONFIG.defaultExercises.forEach(exercise => {
            const completed = Math.random() > 0.2; // 80% completion rate
            mockDailyLogs[dateStr].sessions.morning[exercise.id] = {
                completed: completed,
                reps: exercise.reps ? parseInt(exercise.reps) : 10,
                weight: exercise.weight ? parseFloat(exercise.weight) : null,
                pain: Math.floor(Math.random() * 3), // Random pain 0-2 (lower for better demo)
                difficulty: Math.floor(Math.random() * 5) + 1, // Random difficulty 1-5
                notes: completed ? "Test data entry" : "Skipped this exercise",
                timestamp: new Date().toISOString(),
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
    }

    return mockDailyLogs;
}

// Get storage key based on test mode
// Exercise update detection system








async function initializeApp() {
    // Check for test mode in URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    testMode = urlParams.get('test') === 'true';

    // Load data from localStorage (or IndexedDB if localStorage is empty)
    await loadData();

    // Prompt for a backup if it has been more than a week
    checkBackupReminder();

    // Set default date to today
    document.getElementById('log-date').value = formatDateInput(new Date());

    // Set up event listeners
    setupEventListeners();

    // Initialize theme
    initializeTheme();

    // Render initial content
    renderDailyExercises();
    renderSwellingLog();
    renderManageExercises();
    updateProgress();
    updateCountdown();
    renderMilestones();
    renderBadges();

    // Show test mode indicator if active
    if (testMode) {
        showTestModeIndicator();
        updateTestModeButtons(true);
    } else {
        updateTestModeButtons(false);
    }
}

function updateTestModeButtons(isTestMode) {
    const toggleButton = document.getElementById('toggle-test-mode');
    const clearButton = document.getElementById('clear-test-data');

    if (isTestMode) {
        toggleButton.textContent = 'Disable Test Mode';
        toggleButton.classList.remove('btn-secondary');
        toggleButton.classList.add('btn-danger');
        clearButton.classList.remove('hidden');
    } else {
        toggleButton.textContent = 'Enable Test Mode';
        toggleButton.classList.remove('btn-danger');
        toggleButton.classList.add('btn-secondary');
        clearButton.classList.add('hidden');
    }
}

function showTestModeIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    indicator.textContent = '🧪 TEST MODE';
    document.body.appendChild(indicator);
}

async function loadData() {
    const exercisesKey = getStorageKey(PT_CONFIG.storage.exercises);
    const logsKey = getStorageKey(PT_CONFIG.storage.dailyLogs);
    const swellingKey = getStorageKey(PT_CONFIG.storage.swellingLogs);
    const milestonesKey = getStorageKey(PT_CONFIG.storage.milestones);
    const badgesKey = getStorageKey(PT_CONFIG.storage.badges);

    // Restore from IndexedDB if localStorage is empty (e.g. browser reset)
    const anyStored = localStorage.getItem(exercisesKey) ||
                      localStorage.getItem(logsKey) ||
                      localStorage.getItem(swellingKey) ||
                      localStorage.getItem(milestonesKey) ||
                      localStorage.getItem(badgesKey);
    if (!anyStored) {
        const idbData = await loadFromIndexedDB();
        if (idbData) {
            localStorage.setItem(exercisesKey, JSON.stringify(idbData.exercises || []));
            localStorage.setItem(logsKey, JSON.stringify(idbData.dailyLogs || {}));
            localStorage.setItem(swellingKey, JSON.stringify(idbData.swellingLogs || {}));
            localStorage.setItem(milestonesKey, JSON.stringify(idbData.milestones || []));
            localStorage.setItem(badgesKey, JSON.stringify(idbData.unlockedBadges || []));
        }
    }

    const storedExercises = localStorage.getItem(exercisesKey);
    const storedLogs = localStorage.getItem(logsKey);
    const storedSwellingLogs = localStorage.getItem(swellingKey);
    const storedMilestones = localStorage.getItem(milestonesKey);
    const storedBadges = localStorage.getItem(badgesKey);

    if (storedExercises) {
        exercises = JSON.parse(storedExercises);
        // Check for exercise updates from default
        checkForExerciseUpdates();
    } else {
        exercises = [...PT_CONFIG.defaultExercises];
        saveExercises();
    }

    if (storedLogs) {
        dailyLogs = JSON.parse(storedLogs);
    } else if (testMode) {
        // Use mock data in test mode if no data exists
        dailyLogs = createMockData();
        saveDailyLogs();
    }

    if (storedSwellingLogs) {
        swellingLogs = JSON.parse(storedSwellingLogs);
        normalizeSwellingLogs();
    }

    if (storedMilestones) {
        milestones = JSON.parse(storedMilestones);
    } else {
        milestones = [...PT_CONFIG.defaultMilestones];
        // In test mode, pre-complete some milestones for demo
        if (testMode) {
            milestones[0].completed = true; // Complete 1 week
            milestones[2].completed = true; // Complete 2 weeks
        }
        saveMilestones();
    }

    if (storedBadges) {
        unlockedBadges = JSON.parse(storedBadges);
    } else if (testMode) {
        // Pre-unlock some badges for demo
        unlockedBadges = ['first_day', 'three_day_streak', 'one_week'];
        saveBadges();
    }
}

function saveExercises() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.exercises), JSON.stringify(exercises));
    persistToIndexedDB();
}

function saveDailyLogs() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.dailyLogs), JSON.stringify(dailyLogs));
    persistToIndexedDB();
}

function saveSwellingLogs() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.swellingLogs), JSON.stringify(swellingLogs));
    persistToIndexedDB();
}

function normalizeSwellingLogs() {
    const knownTimes = ['morning', 'afternoon', 'evening'];
    Object.keys(swellingLogs).forEach(date => {
        const entry = swellingLogs[date];
        if (!entry || typeof entry !== 'object') {
            return;
        }
        const hasKnownTime = knownTimes.some(t => entry[t] && typeof entry[t] === 'object');
        if (hasKnownTime) {
            return;
        }
        const time = (typeof entry.time === 'string' ? entry.time : 'morning');
        const migrated = { ...entry, time };
        swellingLogs[date] = { [time]: migrated };
    });
}

function saveMilestones() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.milestones), JSON.stringify(milestones));
    persistToIndexedDB();
}

function saveBadges() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.badges), JSON.stringify(unlockedBadges));
    persistToIndexedDB();
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.dataset.tab === 'more') {
                toggleMoreMenu();
            } else {
                switchTab(this.dataset.tab);
                closeMoreMenu();
            }
        });
    });

    // More menu item clicks
    document.querySelectorAll('.more-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            switchTab(this.dataset.tab);
            closeMoreMenu();
        });
    });
    
    // Date change
    document.getElementById('log-date').addEventListener('change', renderDailyExercises);
    document.getElementById('log-date').addEventListener('change', renderSwellingLog);

    // Swelling time change
    document.getElementById('swelling-time').addEventListener('change', renderSwellingLog);

    // Save swelling log
    document.getElementById('save-swelling').addEventListener('click', saveSwellingLog);

    // Session type change
    document.getElementById('session-type').addEventListener('change', function() {
        const customInput = document.getElementById('custom-session-name');
        customInput.classList.toggle('hidden', this.value !== 'custom');
    });

    // Save day's progress
    document.getElementById('save-day').addEventListener('click', saveDayProgress);
    
    // Add exercise button
    document.getElementById('add-exercise').addEventListener('click', openAddExerciseModal);
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('today-month').addEventListener('click', () => {
        currentCalendarDate = new Date();
        renderCalendar();
    });
    
    // Settings functionality
    document.getElementById('enable-reminders').addEventListener('click', enableReminders);
    document.getElementById('disable-reminders').addEventListener('click', disableReminders);
    document.getElementById('save-target-date').addEventListener('click', saveTargetDate);
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-all-data').addEventListener('click', clearAllData);
    document.getElementById('toggle-test-mode').addEventListener('click', toggleTestMode);
    document.getElementById('clear-test-data').addEventListener('click', clearTestData);
    
    // Load reminder and target settings
    loadReminderSettings();
    loadTargetDateSettings();
    
    // Exercise form submission
    document.getElementById('exercise-form').addEventListener('submit', handleExerciseFormSubmit);
    
    // Modal close
    document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', closeModal));
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Report generation
    document.getElementById('generate-report').addEventListener('click', openReportModal);
    document.getElementById('weekly-report').addEventListener('click', openWeeklyReport);
    document.getElementById('report-form').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });

    // Collapse/expand daily log cards and swelling panel
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

function toggleMoreMenu() {
    const menu = document.getElementById('more-menu');
    const moreTab = document.querySelector('.tab[data-tab="more"]');
    if (!menu || !moreTab) return;

    const isOpen = !menu.classList.contains('open');
    if (isOpen) {
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        moreTab.setAttribute('aria-expanded', 'true');
        moreTab.classList.add('active');
    } else {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        moreTab.setAttribute('aria-expanded', 'false');
        moreTab.classList.remove('active');
    }
}

function closeMoreMenu() {
    const menu = document.getElementById('more-menu');
    const moreTab = document.querySelector('.tab[data-tab="more"]');
    if (!menu) return;

    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    if (moreTab) {
        moreTab.setAttribute('aria-expanded', 'false');
        moreTab.classList.remove('active');
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        const isActive = tab.dataset.tab === tabName;
        if (isActive) {
            tab.classList.add('active');
        }
        tab.setAttribute('aria-selected', String(isActive));
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Refresh content if needed
    if (tabName === 'progress') {
        updateProgress();
    }
    
    if (tabName === 'calendar') {
        renderCalendar();
    }
    
    // Set up timer buttons
    setupTimerButtons();
    
    // Load reminder and target settings when switching to settings tab
    if (tabName === 'settings') {
        loadReminderSettings();
        loadTargetDateSettings();
    }

    if (tabName === 'milestones') {
        renderMilestones();
    }
}

function renderDailyExercises() {
    const container = document.getElementById('daily-exercises');
    const selectedDate = document.getElementById('log-date').value;
    const sessionType = document.getElementById('session-type').value;
    let sessionName = sessionType;

    if (sessionType === 'custom') {
        const customName = document.getElementById('custom-session-name').value.trim();
        sessionName = customName || 'custom';
    }

    // Filter out inactive exercises for daily view
    const activeExercises = exercises.filter(ex => ex.metadata?.isActive !== false);

    if (activeExercises.length === 0) {
        container.innerHTML = '<p>No active exercises. Go to "Manage Exercises" to add or activate exercises.</p>';
        return;
    }

    container.innerHTML = activeExercises.map(exercise => {
        const existingLog = dailyLogs[selectedDate]?.sessions?.[sessionName]?.[exercise.id] || {};
        const lastValues = getLastExerciseValues(exercise.id);
        const logData = { ...lastValues, ...existingLog };
        
        return `
            <div class="exercise-card collapsed" data-exercise-id="${exercise.id}">
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
                            <span class="session-status">${exerciseData.completed ? '✅' : '⏳'}</span>
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
                        <input type="checkbox" id="completed-${exercise.id}" ${logData.completed ? 'checked' : ''}>
                        <label for="completed-${exercise.id}">Completed</label>
                    </div>
                    
                    <div class="tracking-row">
                        <div class="tracking-group">
                            <label>Reps Completed:</label>
                            <input type="number" id="reps-${exercise.id}" value="${logData.reps || ''}" placeholder="Actual reps done">
                        </div>
                        <div class="tracking-group">
                            <label>Weight Used (lbs):</label>
                            <input type="number" id="weight-${exercise.id}" value="${logData.weight || ''}" placeholder="Weight if applicable">
                        </div>
                        <div class="tracking-group">
                            <label>Pain Level (1-10):</label>
                            <input type="number" id="pain-${exercise.id}" value="${logData.pain || ''}" min="1" max="10" placeholder="1-10">
                        </div>
                        <div class="tracking-group">
                            <label>Difficulty (1-10):</label>
                            <input type="number" id="difficulty-${exercise.id}" value="${logData.difficulty || ''}" min="1" max="10" placeholder="1-10">
                        </div>
                    </div>
                    
                    <div class="tracking-group">
                        <label>Notes:</label>
                        <textarea id="notes-${exercise.id}" rows="2" placeholder="How did it feel? Any modifications?">${logData.notes || ''}</textarea>
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
        if (!document.getElementById(`completed-${exercise.id}`)) return;
        const completed = document.getElementById(`completed-${exercise.id}`).checked;
        const reps = document.getElementById(`reps-${exercise.id}`).value;
        const weight = document.getElementById(`weight-${exercise.id}`).value;
        const pain = document.getElementById(`pain-${exercise.id}`).value;
        const difficulty = document.getElementById(`difficulty-${exercise.id}`).value;
        const notes = document.getElementById(`notes-${exercise.id}`).value;

        dailyLogs[selectedDate].sessions[sessionName][exercise.id] = {
            completed,
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












// Theme management functions
function initializeTheme() {
    const savedTheme = localStorage.getItem(PT_CONFIG.storage.theme) || 'system';
    setTheme(savedTheme);
    
    // Set up theme button listeners
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
            localStorage.setItem(PT_CONFIG.storage.theme, theme);
        });
    });
}

function setTheme(theme) {
    // Remove all theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Update active state of theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    // Apply the selected theme
    if (theme === 'system') {
        // Let system preference handle it
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Listen for system theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    const currentTheme = localStorage.getItem(PT_CONFIG.storage.theme) || 'system';
    if (currentTheme === 'system') {
        if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
});

// Chart management
let completionChart = null;
let painChart = null;
let difficultyChart = null;
let swellingChart = null;


// Update charts when theme changes
const originalSetTheme = setTheme;
setTheme = function(theme) {
    originalSetTheme(theme);
    setTimeout(() => {
        const dates = Object.keys(dailyLogs).sort();
        updateCharts(dates);
    }, 300);
};

// Milestone functions




// Shows a brief, self-dismissing toast celebrating a completed milestone.


// Weekly goals functions


// Achievement functions






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

