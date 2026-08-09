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
function checkForExerciseUpdates() {
    const updates = {
        newExercises: [],
        modifiedExercises: [],
        unchangedExercises: []
    };

    // Check for new or modified exercises, avoiding duplicates by ID or name
    PT_CONFIG.defaultExercises.forEach(defaultExercise => {
        const existingById = exercises.find(ex => ex.id === defaultExercise.id);
        const existingByName = !existingById ? exercises.find(
            ex => ex.name && defaultExercise.name &&
                  ex.name.toLowerCase().trim() === defaultExercise.name.toLowerCase().trim()
        ) : null;
        const existingExercise = existingById || existingByName;

        if (!existingExercise) {
            // New exercise
            updates.newExercises.push(defaultExercise);
        } else {
            // Merge with the existing exercise to preserve its ID and active state
            const mergedExercise = {
                ...defaultExercise,
                id: existingExercise.id,
                metadata: {
                    ...(defaultExercise.metadata || {}),
                    created: existingExercise.metadata?.created || defaultExercise.metadata?.created,
                    isActive: existingExercise.metadata?.isActive !== false
                }
            };

            const isModified = (
                existingExercise.name !== mergedExercise.name ||
                existingExercise.description !== mergedExercise.description ||
                existingExercise.reps !== mergedExercise.reps ||
                existingExercise.hold !== mergedExercise.hold ||
                existingExercise.frequency !== mergedExercise.frequency ||
                existingExercise.weight !== mergedExercise.weight
            );

            if (isModified) {
                updates.modifiedExercises.push({
                    existing: existingExercise,
                    updated: mergedExercise
                });
            } else {
                updates.unchangedExercises.push(existingExercise);
            }
        }
    });

    // No automatic archiving. Users activate/inactivate exercises manually.

    // If there are updates, store them and show confirmation dialog
    if (updates.newExercises.length > 0 || updates.modifiedExercises.length > 0) {
        pendingExerciseUpdates = updates;
        showExerciseUpdateDialog(updates);
    }
}

function showExerciseUpdateDialog(updates) {
    const dialog = document.createElement('div');
    dialog.className = 'exercise-update-dialog';
    dialog.innerHTML = `
        <div class="update-dialog-content">
            <h2>Exercise Plan Updated</h2>
            <p>Your PT has updated your exercise plan:</p>

            ${updates.newExercises.length > 0 ? `
            <div class="update-section">
                <h3>New Exercises:</h3>
                <ul>
                    ${updates.newExercises.map(ex => `<li>${ex.name}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${updates.modifiedExercises.length > 0 ? `
            <div class="update-section">
                <h3>Modified Exercises:</h3>
                <ul>
                    ${updates.modifiedExercises.map(mod => `
                        <li>${mod.existing.name}
                            ${mod.existing.reps !== mod.updated.reps ? ` (${mod.existing.reps} → ${mod.updated.reps} reps)` : ''}
                            ${mod.existing.hold !== mod.updated.hold ? ` (hold: ${mod.existing.hold} → ${mod.updated.hold})` : ''}
                            ${mod.existing.frequency !== mod.updated.frequency ? ` (frequency: ${mod.existing.frequency} → ${mod.updated.frequency})` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            <p class="update-note">No exercises will be removed. You can activate or inactivate exercises on the Manage Exercises tab.</p>

            <div class="update-dialog-buttons">
                <button class="btn btn-primary" id="apply-updates">Apply Changes</button>
                <button class="btn btn-secondary" id="review-details">Review Details</button>
                <button class="btn btn-secondary" id="dismiss-updates">Dismiss</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById('apply-updates').addEventListener('click', () => {
        applyExerciseUpdates(updates);
        document.body.removeChild(dialog);
    });

    document.getElementById('review-details').addEventListener('click', () => {
        showDetailedUpdateInfo(updates);
    });

    document.getElementById('dismiss-updates').addEventListener('click', () => {
        document.body.removeChild(dialog);
        pendingExerciseUpdates = null;
    });
}

function showDetailedUpdateInfo(updates) {
    let details = "Exercise Update Details:\n\n";

    if (updates.newExercises.length > 0) {
        details += "NEW EXERCISES:\n";
        updates.newExercises.forEach(ex => {
            details += `\n${ex.name}\n`;
            details += `  Description: ${ex.description.substring(0, 100)}...\n`;
            details += `  Reps: ${ex.reps || 'N/A'}\n`;
            details += `  Hold: ${ex.hold || 'N/A'}\n`;
            details += `  Frequency: ${ex.frequency || 'N/A'}\n`;
        });
    }

    if (updates.modifiedExercises.length > 0) {
        details += "\n\nMODIFIED EXERCISES:\n";
        updates.modifiedExercises.forEach(mod => {
            details += `\n${mod.existing.name}\n`;
            details += `  Reps: ${mod.existing.reps || 'N/A'} → ${mod.updated.reps || 'N/A'}\n`;
            details += `  Hold: ${mod.existing.hold || 'N/A'} → ${mod.updated.hold || 'N/A'}\n`;
            details += `  Frequency: ${mod.existing.frequency || 'N/A'} → ${mod.updated.frequency || 'N/A'}\n`;
            details += `  Weight: ${mod.existing.weight || 'N/A'} → ${mod.updated.weight || 'N/A'}\n`;
        });
    }

    details += "\n\nNo exercises will be removed.";

    alert(details);
}

function applyExerciseUpdates(updates) {
    const today = formatDateInput(new Date());

    // Add new exercises
    updates.newExercises.forEach(newExercise => {
        const exerciseWithMetadata = {
            ...newExercise,
            metadata: {
                ...newExercise.metadata,
                created: today,
                modified: today
            }
        };
        exercises.push(exerciseWithMetadata);
    });

    // Update modified exercises
    updates.modifiedExercises.forEach(mod => {
        const existingIndex = exercises.findIndex(ex => ex.id === mod.existing.id);
        if (existingIndex !== -1) {
            exercises[existingIndex] = {
                ...mod.updated,
                metadata: {
                    ...mod.updated.metadata,
                    created: mod.existing.metadata?.created || today,
                    modified: today,
                    version: (mod.existing.metadata?.version || 1) + 1
                }
            };
        }
    });

    // No automatic archiving. Users manage active/inactive state on the Manage Exercises tab.

    // Save updated exercises
    saveExercises();

    // Refresh UI
    renderDailyExercises();
    renderManageExercises();

    alert('Exercise updates applied successfully!');
    pendingExerciseUpdates = null;
}

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

function getSwellingLevelForDate(date) {
    const dayLogs = swellingLogs[date];
    if (!dayLogs) return null;
    const timeOrder = ['morning', 'afternoon', 'evening'];
    for (let i = timeOrder.length - 1; i >= 0; i--) {
        const entry = dayLogs[timeOrder[i]];
        if (entry && entry.level != null) {
            return entry.level;
        }
    }
    return null;
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
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-all-data').addEventListener('click', clearAllData);
    document.getElementById('toggle-test-mode').addEventListener('click', toggleTestMode);
    document.getElementById('clear-test-data').addEventListener('click', clearTestData);
    
    // Load reminder settings
    loadReminderSettings();
    
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
    
    // Load reminder settings when switching to settings tab
    if (tabName === 'settings') {
        loadReminderSettings();
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

function renderManageExercises() {
    const container = document.getElementById('manage-exercises');

    if (exercises.length === 0) {
        container.innerHTML = '<p>No exercises added yet. Click "Add New Exercise" to get started.</p>';
        return;
    }

    // Show all exercises; inactive ones appear at the bottom with a visual style
    const sortedExercises = [...exercises].sort((a, b) => {
        const aInactive = a.metadata?.isActive === false ? 1 : 0;
        const bInactive = b.metadata?.isActive === false ? 1 : 0;
        return aInactive - bInactive;
    });

    const html = sortedExercises.map(exercise => `
        <div class="exercise-card ${exercise.metadata?.isActive === false ? 'archived' : ''}" data-exercise-id="${exercise.id}">
            <div class="exercise-header">
                <h3 class="exercise-title">${exercise.name}${exercise.metadata?.isActive === false ? ' (Inactive)' : ''}</h3>
                <div class="exercise-actions">
                    <button class="btn btn-edit" onclick="editExercise(${exercise.id})">Edit</button>
                    <label class="switch" title="Toggle active/inactive">
                        <input type="checkbox" onchange="toggleExerciseActive(${exercise.id})" ${exercise.metadata?.isActive !== false ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            <p class="exercise-description">${exercise.description}</p>

            <div class="exercise-details">
                ${exercise.reps ? `<span class="detail-item"><span class="detail-label">Reps:</span> ${exercise.reps}</span>` : ''}
                ${exercise.hold ? `<span class="detail-item"><span class="detail-label">Hold:</span> ${exercise.hold}</span>` : ''}
                ${exercise.frequency ? `<span class="detail-item"><span class="detail-label">Frequency:</span> ${exercise.frequency}</span>` : ''}
                ${exercise.weight ? `<span class="detail-item"><span class="detail-label">Weight:</span> ${exercise.weight}</span>` : ''}
            </div>
            ${exercise.metadata?.archived && exercise.metadata?.isActive === false ? `<p class="archive-date">Inactive since: ${exercise.metadata.archived}</p>` : ''}
        </div>
    `).join('');

    container.innerHTML = html;
}

function toggleExerciseActive(exerciseId) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
        const newActive = !(exercise.metadata?.isActive !== false);
        exercise.metadata = {
            ...exercise.metadata,
            isActive: newActive,
            archived: newActive ? null : formatDateInput(new Date())
        };
        saveExercises();
        renderManageExercises();
        renderDailyExercises();
    }
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

function updateProgress() {
    const allDates = Object.keys(dailyLogs).sort();

    // Filter to only include dates with valid session data
    const validDates = allDates.filter(date => {
        const dayLog = dailyLogs[date];
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            return true;
        }
        // Support old data structure for backward compatibility
        if (!dayLog.sessions && Object.keys(dayLog).length > 0) {
            return true;
        }
        return false;
    });


    // Total days completed (days with at least one session)
    const totalDays = validDates.length;

    document.getElementById('total-days').textContent = totalDays;

    // Current streak calculation
    let currentStreak = 0;
    const today = formatDateInput(new Date());

    for (let i = validDates.length - 1; i >= 0; i--) {
        const date = validDates[i];
        const dayLog = dailyLogs[date];
        let exercisesCompleted = 0;

        // Check new session-based structure
        if (dayLog.sessions) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(exerciseData => {
                    if (exerciseData.completed) exercisesCompleted++;
                });
            });
        } else {
            // Support old data structure
            exercisesCompleted = Object.values(dayLog).filter(log => log.completed).length;
        }

        if (exercisesCompleted > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    document.getElementById('current-streak').textContent = `${currentStreak} days`;

    // Update streak indicator in header
    const streakFire = document.getElementById('streak-fire');
    const streakCount = document.getElementById('streak-count');
    const streakLabel = document.getElementById('streak-label');
    
    streakCount.textContent = currentStreak;
    streakLabel.textContent = currentStreak === 1 ? 'day streak' : 'day streak';
    
    if (currentStreak >= 7) {
        streakFire.textContent = '🔥🔥🔥';
    } else if (currentStreak >= 3) {
        streakFire.textContent = '🔥🔥';
    } else if (currentStreak >= 1) {
        streakFire.textContent = '🔥';
    } else {
        streakFire.textContent = '💨';
    }
    
    // Completion rate
    let totalPossible = 0;
    let totalCompleted = 0;

    validDates.forEach(date => {
        const dayLog = dailyLogs[date];
        if (dayLog.sessions) {
            // New session-based structure
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    totalPossible++;
                    if (log.completed) {
                        totalCompleted++;
                    }
                });
            });
        } else {
            // Old data structure for backward compatibility
            Object.values(dayLog).forEach(log => {
                totalPossible++;
                if (log.completed) {
                    totalCompleted++;
                }
            });
        }
    });


    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;

    // Render exercise history
    renderHistory(validDates);

    // Update charts
    updateCharts(validDates);

    // Update weekly goals
    updateWeeklyGoals(validDates);

    // Update achievement badges
    updateAchievements();

    // Update milestones and badges display
    renderMilestones();
    renderBadges();
}

function renderHistory(dates) {
    const container = document.getElementById('exercise-history');

    if (dates.length === 0) {
        container.innerHTML = '<p>No exercise history yet. Start logging your daily exercises!</p>';
        return;
    }

    // Show last 7 days
    const recentDates = dates.slice(-7).reverse();

    container.innerHTML = recentDates.map(date => {
        const dayLog = dailyLogs[date];
        let totalExercises = 0;
        let completedExercises = 0;

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    totalExercises++;
                    if (log.completed) completedExercises++;
                });
            });
        } else {
            // Old data structure for backward compatibility
            const exerciseEntries = Object.entries(dayLog).filter(([key, log]) => key !== 'sessions' && log && typeof log === 'object');
            totalExercises = exerciseEntries.length;
            completedExercises = exerciseEntries.filter(([key, log]) => log.completed).length;
        }

        const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
        
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="history-item">
                <span class="history-date">${formattedDate}</span>
                <span class="history-exercises">${completedExercises}/${totalExercises} exercises</span>
                <span class="history-completion">${completionRate}% complete</span>
            </div>
        `;
    }).join('');
}

function updateCountdown() {
    // Target: First week of September 2026
    const targetDate = new Date('2026-09-01');
    const today = new Date();
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    
    document.getElementById('countdown').textContent = `${weeks} weeks remaining`;
}

function openAddExerciseModal() {
    editingExerciseId = null;
    document.getElementById('modal-title').textContent = 'Add Exercise';
    document.getElementById('exercise-form').reset();
    document.getElementById('exercise-modal').style.display = 'block';
}

function editExercise(id) {
    editingExerciseId = id;
    const exercise = exercises.find(ex => ex.id === id);
    
    if (exercise) {
        document.getElementById('modal-title').textContent = 'Edit Exercise';
        document.getElementById('exercise-name').value = exercise.name;
        document.getElementById('exercise-description').value = exercise.description;
        document.getElementById('exercise-reps').value = exercise.reps || '';
        document.getElementById('exercise-hold').value = exercise.hold || '';
        document.getElementById('exercise-frequency').value = exercise.frequency || '';
        document.getElementById('exercise-weight').value = exercise.weight || '';
        document.getElementById('exercise-modal').style.display = 'block';
    }
}

function deleteExercise(id) {
    if (confirm('Are you sure you want to delete this exercise? This will archive it and preserve all historical data.')) {
        const exercise = exercises.find(ex => ex.id === id);
        if (exercise) {
            exercise.metadata = {
                ...exercise.metadata,
                isActive: false,
                archived: formatDateInput(new Date())
            };
            saveExercises();
            renderManageExercises();
            renderDailyExercises();
        }
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    editingExerciseId = null;
}

function handleExerciseFormSubmit(e) {
    e.preventDefault();
    
    const exerciseData = {
        name: document.getElementById('exercise-name').value,
        description: document.getElementById('exercise-description').value,
        reps: document.getElementById('exercise-reps').value,
        hold: document.getElementById('exercise-hold').value,
        frequency: document.getElementById('exercise-frequency').value,
        weight: document.getElementById('exercise-weight').value
    };
    
    if (editingExerciseId) {
        // Update existing exercise
        const index = exercises.findIndex(ex => ex.id === editingExerciseId);
        if (index !== -1) {
            exercises[index] = { ...exercises[index], ...exerciseData };
        }
    } else {
        // Add new exercise
        const newId = exercises.length > 0 ? Math.max(...exercises.map(ex => ex.id)) + 1 : 1;
        exercises.push({ id: newId, ...exerciseData });
    }
    
    saveExercises();
    renderManageExercises();
    renderDailyExercises();
    closeModal();
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

function updateCharts(dates) {
    updateCompletionChart(dates);
    updatePainChart(dates);
    updateDifficultyChart(dates);
    updateSwellingChart(dates);
}

function updateCompletionChart(dates) {
    const ctx = document.getElementById('completionChart').getContext('2d');
    
    // Get last 7 days of data
    const recentDates = dates.slice(-7);
    
    const labels = recentDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    
    const completionData = recentDates.map(date => {
        const dayLog = dailyLogs[date];
        let total = 0;
        let completed = 0;

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    total++;
                    if (log.completed) completed++;
                });
            });
        } else {
            // Old data structure for backward compatibility
            total = Object.keys(dayLog).length;
            completed = Object.values(dayLog).filter(log => log.completed).length;
        }

        return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    
    if (completionChart) {
        completionChart.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#eaeaea' : '#212529';
    const gridColor = isDark ? '#374151' : '#dee2e6';
    
    completionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function updatePainChart(dates) {
    const ctx = document.getElementById('painChart').getContext('2d');
    
    // Get last 7 days of data
    const recentDates = dates.slice(-7);
    
    const labels = recentDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    
    const painData = recentDates.map(date => {
        const dayLog = dailyLogs[date];
        let painValues = [];

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    if (log.pain !== null && log.pain !== undefined) {
                        painValues.push(log.pain);
                    }
                });
            });
        } else {
            // Old data structure for backward compatibility
            painValues = Object.values(dayLog)
                .map(log => log.pain)
                .filter(pain => pain !== null && pain !== undefined);
        }

        if (painValues.length === 0) return null;

        const avgPain = painValues.reduce((sum, pain) => sum + pain, 0) / painValues.length;
        return Math.round(avgPain * 10) / 10;
    });
    
    if (painChart) {
        painChart.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#eaeaea' : '#212529';
    const gridColor = isDark ? '#374151' : '#dee2e6';
    
    painChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Pain Level (1-10)',
                data: painData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function updateDifficultyChart(dates) {
    const ctx = document.getElementById('difficultyChart').getContext('2d');
    
    // Get last 7 days of data
    const recentDates = dates.slice(-7);
    
    const labels = recentDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    
    const difficultyData = recentDates.map(date => {
        const dayLog = dailyLogs[date];
        let difficultyValues = [];

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    if (log.difficulty !== null && log.difficulty !== undefined) {
                        difficultyValues.push(log.difficulty);
                    }
                });
            });
        } else {
            // Old data structure for backward compatibility
            difficultyValues = Object.values(dayLog)
                .map(log => log.difficulty)
                .filter(difficulty => difficulty !== null && difficulty !== undefined);
        }

        if (difficultyValues.length === 0) return null;

        const avgDifficulty = difficultyValues.reduce((sum, difficulty) => sum + difficulty, 0) / difficultyValues.length;
        return Math.round(avgDifficulty * 10) / 10;
    });
    
    if (difficultyChart) {
        difficultyChart.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#eaeaea' : '#212529';
    const gridColor = isDark ? '#374151' : '#dee2e6';
    
    difficultyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Difficulty Level (1-10)',
                data: difficultyData,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function updateSwellingChart(dates) {
    const ctx = document.getElementById('swellingChart').getContext('2d');

    // Include any dates that only have a swelling entry (e.g. rest days with no exercises logged)
    const allDates = Array.from(new Set([...dates, ...Object.keys(swellingLogs)])).sort();

    // Get last 7 days of data
    const recentDates = allDates.slice(-7);

    const labels = recentDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    const swellingData = recentDates.map(date => {
        const level = getSwellingLevelForDate(date);
        return (level !== null && level !== undefined) ? level : null;
    });

    if (swellingChart) {
        swellingChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#eaeaea' : '#212529';
    const gridColor = isDark ? '#374151' : '#dee2e6';

    swellingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Swelling Level (0-10)',
                data: swellingData,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

// Update charts when theme changes
const originalSetTheme = setTheme;
setTheme = function(theme) {
    originalSetTheme(theme);
    setTimeout(() => {
        const dates = Object.keys(dailyLogs).sort();
        updateCharts(dates);
    }, 300);
};

// Reminder functions
function loadReminderSettings() {
    const reminderEnabled = localStorage.getItem(PT_CONFIG.storage.remindersEnabled) === 'true';
    const reminderTime = localStorage.getItem(PT_CONFIG.storage.reminderTime) || '09:00';
    
    document.getElementById('reminder-time').value = reminderTime;
    
    if (reminderEnabled) {
        document.getElementById('enable-reminders').classList.add('hidden');
        document.getElementById('disable-reminders').classList.remove('hidden');
        scheduleReminder(reminderTime);
    }
}

function enableReminders() {
    const time = document.getElementById('reminder-time').value;
    
    if (!Notification.permission) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                setReminderEnabled(true, time);
            } else {
                alert('Notifications are blocked. Please enable them in your browser settings.');
            }
        });
    } else if (Notification.permission === 'granted') {
        setReminderEnabled(true, time);
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                setReminderEnabled(true, time);
            } else {
                alert('Notifications are blocked. Please enable them in your browser settings.');
            }
        });
    }
}

function disableReminders() {
    setReminderEnabled(false, null);
}

function setReminderEnabled(enabled, time) {
    localStorage.setItem(PT_CONFIG.storage.remindersEnabled, enabled);
    if (time) {
        localStorage.setItem(PT_CONFIG.storage.reminderTime, time);
    }
    
    if (enabled) {
        document.getElementById('enable-reminders').classList.add('hidden');
        document.getElementById('disable-reminders').classList.remove('hidden');
        scheduleReminder(time);
    } else {
        document.getElementById('enable-reminders').classList.remove('hidden');
        document.getElementById('disable-reminders').classList.add('hidden');
        // Clear existing reminder timeout
        if (window.reminderTimeout) {
            clearTimeout(window.reminderTimeout);
        }
    }
}

function scheduleReminder(time) {
    if (window.reminderTimeout) {
        clearTimeout(window.reminderTimeout);
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const delay = scheduledTime - now;
    
    window.reminderTimeout = setTimeout(() => {
        showReminderNotification();
        // Schedule next day's reminder
        scheduleReminder(time);
    }, delay);
}

function showReminderNotification() {
    if (Notification.permission === 'granted') {
        new Notification('PT Exercise Reminder', {
            body: "Time to do your daily exercises! 💪",
            icon: '🥏'
        });
    }
}

// Data export/import functions
function exportData() {
    const data = {
        exercises: exercises,
        dailyLogs: dailyLogs,
        swellingLogs: swellingLogs,
        milestones: milestones,
        unlockedBadges: unlockedBadges,
        exportDate: new Date().toISOString(),
        testMode: testMode
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    const prefix = testMode ? 'test-' : '';
    link.download = `${prefix}pt-tracker-backup-${formatDateInput(new Date())}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

function backupNow() {
    exportData();
    localStorage.setItem(PT_CONFIG.storage.lastBackup, String(Date.now()));
}

function checkBackupReminder() {
    if (testMode) return;

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const lastBackup = parseInt(localStorage.getItem(PT_CONFIG.storage.lastBackup), 10) || 0;
    const now = Date.now();

    if (!lastBackup) {
        localStorage.setItem(PT_CONFIG.storage.lastBackup, String(now));
        return;
    }

    if (now - lastBackup > oneWeek) {
        if (confirm('It has been over a week since your last PT Tracker backup. Create a backup now?')) {
            backupNow();
        } else {
            localStorage.setItem(PT_CONFIG.storage.lastBackup, String(now));
        }
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.exercises && data.dailyLogs) {
                // Check if this is a test mode backup
                const isTestBackup = data.testMode === true;

                // Warn if importing test data into normal mode or vice versa
                if (isTestBackup && !testMode) {
                    if (!confirm('This backup appears to be from test mode. Import it into your real data?')) {
                        return;
                    }
                } else if (!isTestBackup && testMode) {
                    if (!confirm('This backup appears to be from real data. Import it into test mode?')) {
                        return;
                    }
                }

                exercises = data.exercises;
                dailyLogs = data.dailyLogs;

                if (data.swellingLogs) {
                    swellingLogs = data.swellingLogs;
                    normalizeSwellingLogs();
                    saveSwellingLogs();
                }

                if (data.milestones) {
                    milestones = data.milestones;
                    saveMilestones();
                }

                if (data.unlockedBadges) {
                    unlockedBadges = data.unlockedBadges;
                    saveBadges();
                }

                saveExercises();
                saveDailyLogs();

                renderDailyExercises();
                renderSwellingLog();
                renderManageExercises();
                updateProgress();
                renderMilestones();
                renderBadges();
                
                alert('Data imported successfully!');
            } else {
                alert('Invalid backup file format.');
            }
        } catch (error) {
            alert('Error reading backup file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) {
        if (confirm('This will permanently delete all exercises and progress logs. Continue?')) {
            exercises = [];
            dailyLogs = {};
            swellingLogs = {};
            milestones = [...PT_CONFIG.defaultMilestones];
            unlockedBadges = [];

            saveExercises();
            saveDailyLogs();
            saveSwellingLogs();
            saveMilestones();
            saveBadges();

            renderDailyExercises();
            renderSwellingLog();
            renderManageExercises();
            updateProgress();
            renderMilestones();
            renderBadges();

            alert('All data has been cleared.');
        }
    }
}

function toggleTestMode() {
    const currentUrl = new URL(window.location.href);
    if (testMode) {
        // Disable test mode
        currentUrl.searchParams.delete('test');
        alert('Test mode disabled. Reloading with your real data...');
    } else {
        // Enable test mode
        currentUrl.searchParams.set('test', 'true');
        alert('Test mode enabled. Reloading with mock data...');
    }
    window.location.href = currentUrl.toString();
}

function clearTestData() {
    if (confirm('Are you sure you want to clear all test data?')) {
        // Clear test storage keys
        localStorage.removeItem(`test_${PT_CONFIG.storage.exercises}`);
        localStorage.removeItem(`test_${PT_CONFIG.storage.dailyLogs}`);
        localStorage.removeItem(`test_${PT_CONFIG.storage.swellingLogs}`);
        localStorage.removeItem(`test_${PT_CONFIG.storage.milestones}`);
        localStorage.removeItem(`test_${PT_CONFIG.storage.badges}`);

        alert('Test data cleared. Reloading...');
        window.location.reload();
    }
}

// Milestone functions
function renderMilestones() {
    const timeline = document.getElementById('milestone-timeline');
    if (!timeline) return; // Not on the Return to Play tab

    const total = milestones.length;
    const completedCount = milestones.filter(m => m.completed).length;
    const overallPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Overall progress bar
    const overallBar = document.getElementById('milestone-overall-bar');
    const overallCount = document.getElementById('milestone-overall-count');
    if (overallBar) overallBar.style.width = `${overallPercent}%`;
    if (overallCount) overallCount.textContent = `${completedCount} / ${total} complete (${overallPercent}%)`;

    // "Next up" callout - the first incomplete milestone in order
    const nextUpCard = document.getElementById('next-up-card');
    const nextUpText = document.getElementById('next-up-text');
    const nextMilestone = milestones.find(m => !m.completed);
    if (nextUpCard && nextUpText) {
        if (nextMilestone) {
            nextUpCard.classList.remove('hidden');
            nextUpText.textContent = nextMilestone.text;
        } else {
            nextUpCard.classList.add('hidden');
        }
    }

    // Group milestones into phases and render as a vertical timeline
    timeline.innerHTML = milestonePhases.map(phase => {
        const phaseMilestones = milestones.filter(m => m.id >= phase.minId && m.id <= phase.maxId);
        if (phaseMilestones.length === 0) return '';

        const phaseCompleted = phaseMilestones.filter(m => m.completed).length;
        const isPhaseDone = phaseCompleted === phaseMilestones.length;

        const steps = phaseMilestones.map(milestone => {
            const isNext = nextMilestone && milestone.id === nextMilestone.id;
            return `
                <div class="milestone-step ${milestone.completed ? 'completed' : ''} ${isNext ? 'next' : ''}" data-milestone-id="${milestone.id}">
                    <div class="milestone-step-marker">${milestone.completed ? '✓' : ''}</div>
                    <div class="milestone-step-content">
                        <span class="milestone-text">${milestone.text}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="milestone-phase ${isPhaseDone ? 'completed' : ''}">
                <div class="milestone-phase-header">
                    <span class="milestone-phase-name">${phase.icon} ${phase.name}</span>
                    <span class="milestone-phase-count">${phaseCompleted}/${phaseMilestones.length}</span>
                </div>
                <div class="milestone-steps">
                    ${steps}
                </div>
            </div>
        `;
    }).join('');

    // Tapping/clicking a step toggles its completion
    document.querySelectorAll('.milestone-step').forEach(step => {
        step.addEventListener('click', function() {
            const milestoneId = parseInt(this.dataset.milestoneId);
            toggleMilestone(milestoneId);
        });
    });
}

function toggleMilestone(id) {
    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
        milestone.completed = !milestone.completed;
        saveMilestones();
        renderMilestones();
        updateAchievements();

        if (milestone.completed) {
            showMilestoneToast(`🎉 Milestone complete: ${milestone.text}`);
        }
    }
}

// Shows a brief, self-dismissing toast celebrating a completed milestone.
function showMilestoneToast(message) {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Weekly goals functions
function updateWeeklyGoals(dates) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    
    // Get dates for current week
    const weekDates = [];
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDateInput(d);
        weekDates.push(dateStr);
    }
    
    // Calculate days completed this week
    let daysCompleted = 0;
    let totalExercisesThisWeek = 0;
    let completedExercisesThisWeek = 0;
    
    weekDates.forEach(date => {
        if (dailyLogs[date]) {
            const dayLog = dailyLogs[date];
            let hasCompletedExercise = false;

            // Handle new session-based structure
            if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
                Object.values(dayLog.sessions).forEach(session => {
                    Object.values(session).forEach(log => {
                        totalExercisesThisWeek++;
                        if (log.completed) {
                            completedExercisesThisWeek++;
                            hasCompletedExercise = true;
                        }
                    });
                });
            } else {
                // Old data structure for backward compatibility
                hasCompletedExercise = Object.values(dayLog).some(log => log.completed);

                Object.values(dayLog).forEach(log => {
                    totalExercisesThisWeek++;
                    if (log.completed) {
                        completedExercisesThisWeek++;
                    }
                });
            }

            if (hasCompletedExercise) {
                daysCompleted++;
            }
        }
    });
    
    // Update weekly days progress
    const weeklyProgress = document.getElementById('weekly-progress');
    const weeklyProgressBar = document.getElementById('weekly-progress-bar');
    
    weeklyProgress.textContent = `${daysCompleted}/7 days`;
    const daysPercentage = (daysCompleted / 7) * 100;
    weeklyProgressBar.style.width = `${daysPercentage}%`;
    
    // Update weekly completion rate
    const weeklyRateProgress = document.getElementById('weekly-rate-progress');
    const weeklyRateBar = document.getElementById('weekly-rate-bar');
    
    const weeklyRate = totalExercisesThisWeek > 0 ? Math.round((completedExercisesThisWeek / totalExercisesThisWeek) * 100) : 0;
    weeklyRateProgress.textContent = `${weeklyRate}%`;
    weeklyRateBar.style.width = `${weeklyRate}%`;
}

// Achievement functions
function updateAchievements() {
    const allDates = Object.keys(dailyLogs).sort();

    // Filter to only include dates with valid session data
    const validDates = allDates.filter(date => {
        const dayLog = dailyLogs[date];
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            return true;
        }
        // Support old data structure for backward compatibility
        if (!dayLog.sessions && Object.keys(dayLog).length > 0) {
            return true;
        }
        return false;
    });

    // Calculate achievement data
    const totalDays = validDates.length;

    // Current streak calculation
    let currentStreak = 0;
    for (let i = validDates.length - 1; i >= 0; i--) {
        const date = validDates[i];
        const dayLog = dailyLogs[date];
        let exercisesCompleted = 0;

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(exerciseData => {
                    if (exerciseData.completed) exercisesCompleted++;
                });
            });
        } else {
            // Support old data structure
            exercisesCompleted = Object.values(dayLog).filter(log => log.completed).length;
        }

        if (exercisesCompleted > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Completion rate
    let totalPossible = 0;
    let totalCompleted = 0;
    let lowPainDays = 0;

    validDates.forEach(date => {
        const dayLog = dailyLogs[date];
        let painValues = [];

        // Handle new session-based structure
        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            Object.values(dayLog.sessions).forEach(session => {
                Object.values(session).forEach(log => {
                    totalPossible++;
                    if (log.completed) {
                        totalCompleted++;
                    }
                    if (log.pain !== null && log.pain !== undefined) {
                        painValues.push(log.pain);
                    }
                });
            });
        } else {
            // Old data structure for backward compatibility
            Object.values(dayLog).forEach(log => {
                totalPossible++;
                if (log.completed) {
                    totalCompleted++;
                }
            });

            painValues = Object.values(dayLog).map(log => log.pain).filter(pain => pain !== null && pain !== undefined);
        }

        // Check for low pain day (average pain <= 2)
        if (painValues.length > 0) {
            const avgPain = painValues.reduce((sum, pain) => sum + pain, 0) / painValues.length;
            if (avgPain <= 2) {
                lowPainDays++;
            }
        }
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const completedMilestones = milestones.filter(m => m.completed).length;
    
    const achievementData = {
        totalDays,
        currentStreak,
        completionRate,
        completedMilestones,
        totalMilestones: milestones.length,
        lowPainDays
    };
    
    // Check for new badge unlocks
    PT_CONFIG.achievementBadges.forEach(badge => {
        if (!unlockedBadges.includes(badge.id) && badge.check(achievementData)) {
            unlockedBadges.push(badge.id);
            saveBadges();
            showBadgeNotification(badge);
        }
    });
    
    renderBadges();
}

function renderBadges() {
    const container = document.getElementById('badges-container');
    
    container.innerHTML = PT_CONFIG.achievementBadges.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        return `
            <div class="badge ${isUnlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
            </div>
        `;
    }).join('');
}

function showBadgeNotification(badge) {
    if (Notification.permission === 'granted') {
        new Notification('Achievement Unlocked! 🎉', {
            body: `You earned the "${badge.name}" badge! ${badge.icon}`,
            icon: badge.icon
        });
    }
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

