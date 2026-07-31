// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Default exercises from the PT flowsheet
const defaultExercises = [
    {
        id: 1,
        name: "Supine Hamstring Stretch - Strap",
        description: "Use a stretch strap, bath towel, or bed sheet. Wrap it around the arch of your foot, then lay down on your back in a relaxed and comfortable position. Keeping your leg completely relaxed, use your arms to pull the strap. Feel a gentle stretch behind your thigh and/or knee. Try to keep your knee straight as you pull on the strap to ensure a good stretch.",
        reps: "",
        hold: "",
        frequency: "",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 2,
        name: "Tandem Balance",
        description: "Get set-up standing with your feet in a heel-to-toe position. Maintain your balance, switch feet and perform again. You should feel like your balance is being challenged. If you're having difficulty maintaining your balance, try to focus on an object with your eyes in the distance or near you. Try not to lose your posture or excessively lean forward/backward or side to side.",
        reps: "",
        hold: "",
        frequency: "",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 3,
        name: "Sit To Stand",
        description: "Place a box, chair, or elevated surface behind you. Sink your hips down and backwards with good squat form, and completely sit down. Then, shift your weight forward and stand back up. You should feel your thigh and butt muscles working. Try your best not to fall into the chair. Try to control yourself as you lower into the chair. Do not use momentum to stand up, if able.",
        reps: "",
        hold: "",
        frequency: "",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 4,
        name: "BIG: Standing Hip Abduction",
        description: "Stand upright while holding onto a stable surface for support (kitchen sink works well). Slowly move the working leg out to the side while keeping the trunk upright and the pelvis level. Return to the starting position with control and repeat. Don't need ankle weights, but can for added difficulty. Moving slow and steady, no leaning. The less dependent you are on your hold, making you balance more with your legs the better.",
        reps: 20,
        hold: "3-5 seconds",
        frequency: "1-2 times a day",
        weight: "3-5 lbs (optional)",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 5,
        name: "BIG: Seated Knee Extension (Long Arc Quad LAQ)",
        description: "Sit at the edge of a table or chair with feet hanging freely (if possible). Slowly straighten your knee until your leg is fully extended, then lower it back down with control. Keep your trunk upright and avoid leaning back. Ankle weights are not always necessary, but often used in clinic. Hold for 3 seconds.",
        reps: 20,
        hold: "3 seconds",
        frequency: "2-3 times per day",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 6,
        name: "BIG: Standing Knee Bend / Standing Hamstring Curl (Supported)",
        description: "Stand tall while holding onto a stable surface for balance. Slowly bend your knee, bringing your heel toward your buttocks while keeping your thighs aligned and your hips steady. Lower the leg back down with control and repeat. Ankle weights are not always necessary, but often used in clinic.",
        reps: 20,
        hold: "3 seconds",
        frequency: "2-3 times per day",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    },
    {
        id: 7,
        name: "BIG: Toe and Heel Raises",
        description: "Stand tall while lightly holding onto a stable surface for balance. The kitchen sink is a good place to hold on to. Do not fall backwards when raising your toes. Heel raises: lift your heels off the ground, rising up onto the balls of your feet. Hold briefly, then lower slowly. Toe raises: lift your toes and the front of your foot while keeping your heels on the ground. Hold briefly, then lower with control. Repeat in a smooth, controlled motion without leaning forward or backward.",
        reps: 20,
        hold: "1 second",
        frequency: "2-3 times per day",
        weight: "",
        metadata: {
            created: "2026-07-30",
            modified: "2026-07-30",
            version: 1,
            isActive: true
        }
    }
];

let exercises = [];
let dailyLogs = {};
let editingExerciseId = null;
let currentCalendarDate = new Date();
let timers = {};

// Test mode flag - set to true to use mock data and separate storage
let testMode = false;

// Return-to-play milestones
const defaultMilestones = [
    { id: 1, text: "Complete 1 week of exercises without pain", completed: false },
    { id: 2, text: "Achieve pain-free range of motion", completed: false },
    { id: 3, text: "Complete 2 weeks of exercises consistently", completed: false },
    { id: 4, text: "Practice putting without discomfort", completed: false },
    { id: 5, text: "Complete 3 weeks of exercises", completed: false },
    { id: 6, text: "Light approach throws (150ft or less)", completed: false },
    { id: 7, text: "Complete 4 weeks of exercises", completed: false },
    { id: 8, text: "Full driving practice session", completed: false },
    { id: 9, text: "Complete 5 weeks of exercises", completed: false },
    { id: 10, text: "Play a practice round", completed: false },
    { id: 11, text: "Complete 6 weeks of exercises", completed: false },
    { id: 12, text: "Return to weekly league play", completed: false },
    { id: 13, text: "Compete in first tournament", completed: false }
];

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

// Achievement badges
const achievementBadges = [
    { id: 'first_day', name: 'First Steps', description: 'Complete your first day of exercises', icon: '🎯', check: (data) => data.totalDays >= 1 },
    { id: 'three_day_streak', name: 'Building Momentum', description: 'Achieve a 3-day streak', icon: '🔥', check: (data) => data.currentStreak >= 3 },
    { id: 'one_week', name: 'Week Warrior', description: 'Complete exercises for 7 days', icon: '📅', check: (data) => data.totalDays >= 7 },
    { id: 'perfect_week', name: 'Perfect Week', description: '100% completion for a week', icon: '⭐', check: (data) => data.completionRate === 100 && data.totalDays >= 7 },
    { id: 'two_weeks', name: 'Fortnight Fighter', description: 'Complete exercises for 14 days', icon: '💪', check: (data) => data.totalDays >= 14 },
    { id: 'milestone_master', name: 'Milestone Master', description: 'Complete 5 return-to-play milestones', icon: '🏆', check: (data) => data.completedMilestones >= 5 },
    { id: 'three_weeks', name: 'Three Week Strong', description: 'Complete exercises for 21 days', icon: '🏋️', check: (data) => data.totalDays >= 21 },
    { id: 'pain_free', name: 'Pain Free', description: 'Complete exercises with pain level 2 or lower for a week', icon: '😌', check: (data) => data.lowPainDays >= 7 },
    { id: 'four_weeks', name: 'Month Master', description: 'Complete exercises for 28 days', icon: '🌟', check: (data) => data.totalDays >= 28 },
    { id: 'five_weeks', name: 'Five Week Focus', description: 'Complete exercises for 35 days', icon: '🎯', check: (data) => data.totalDays >= 35 },
    { id: 'six_weeks', name: 'Program Complete', description: 'Complete the 6-week program', icon: '🏅', check: (data) => data.totalDays >= 42 },
    { id: 'all_milestones', name: 'Return to Play', description: 'Complete all return-to-play milestones', icon: '🥏', check: (data) => data.completedMilestones >= data.totalMilestones }
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
        const dateStr = date.toISOString().split('T')[0];

        mockDailyLogs[dateStr] = {
            sessions: {
                morning: {}
            }
        };

        // Add exercise data for each exercise
        defaultExercises.forEach(exercise => {
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
function getStorageKey(baseKey) {
    return testMode ? `test_${baseKey}` : baseKey;
}

// Exercise update detection system
function checkForExerciseUpdates() {
    const updates = {
        newExercises: [],
        modifiedExercises: [],
        removedExercises: [],
        unchangedExercises: []
    };

    // Check for new or modified exercises
    defaultExercises.forEach(defaultExercise => {
        const existingExercise = exercises.find(ex => ex.id === defaultExercise.id);

        if (!existingExercise) {
            // New exercise
            updates.newExercises.push(defaultExercise);
        } else {
            // Check if modified
            const isModified = (
                existingExercise.name !== defaultExercise.name ||
                existingExercise.description !== defaultExercise.description ||
                existingExercise.reps !== defaultExercise.reps ||
                existingExercise.hold !== defaultExercise.hold ||
                existingExercise.frequency !== defaultExercise.frequency ||
                existingExercise.weight !== defaultExercise.weight
            );

            if (isModified) {
                updates.modifiedExercises.push({
                    existing: existingExercise,
                    updated: defaultExercise
                });
            } else {
                updates.unchangedExercises.push(existingExercise);
            }
        }
    });

    // Check for removed exercises
    exercises.forEach(existingExercise => {
        const stillInDefault = defaultExercises.find(def => def.id === existingExercise.id);
        if (!stillInDefault && existingExercise.metadata?.isActive !== false) {
            updates.removedExercises.push(existingExercise);
        }
    });

    // If there are updates, store them and show confirmation dialog
    if (updates.newExercises.length > 0 || updates.modifiedExercises.length > 0 || updates.removedExercises.length > 0) {
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

            ${updates.removedExercises.length > 0 ? `
            <div class="update-section">
                <h3>Archived Exercises:</h3>
                <ul>
                    ${updates.removedExercises.map(ex => `<li>${ex.name}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <p class="update-note">Your historical data will be preserved.</p>

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

    if (updates.removedExercises.length > 0) {
        details += "\n\nARCHIVED EXERCISES:\n";
        updates.removedExercises.forEach(ex => {
            details += `\n${ex.name}\n`;
            details += `  Will be archived but historical data preserved\n`;
        });
    }

    alert(details);
}

function applyExerciseUpdates(updates) {
    const today = new Date().toISOString().split('T')[0];

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

    // Archive removed exercises (soft delete)
    updates.removedExercises.forEach(removedExercise => {
        const existingIndex = exercises.findIndex(ex => ex.id === removedExercise.id);
        if (existingIndex !== -1) {
            exercises[existingIndex].metadata = {
                ...exercises[existingIndex].metadata,
                isActive: false,
                archived: today
            };
        }
    });

    // Save updated exercises
    saveExercises();

    // Refresh UI
    renderDailyExercises();
    renderManageExercises();

    alert('Exercise updates applied successfully!');
    pendingExerciseUpdates = null;
}

function initializeApp() {
    // Check for test mode in URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    testMode = urlParams.get('test') === 'true';

    // Load data from localStorage
    loadData();

    // Set default date to today
    document.getElementById('log-date').valueAsDate = new Date();

    // Set up event listeners
    setupEventListeners();

    // Initialize theme
    initializeTheme();

    // Render initial content
    renderDailyExercises();
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
        clearButton.style.display = 'inline-block';
    } else {
        toggleButton.textContent = 'Enable Test Mode';
        toggleButton.classList.remove('btn-danger');
        toggleButton.classList.add('btn-secondary');
        clearButton.style.display = 'none';
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

function loadData() {
    const exercisesKey = getStorageKey('ptExercises');
    const logsKey = getStorageKey('ptDailyLogs');
    const milestonesKey = getStorageKey('ptMilestones');
    const badgesKey = getStorageKey('unlockedBadges');

    const storedExercises = localStorage.getItem(exercisesKey);
    const storedLogs = localStorage.getItem(logsKey);
    const storedMilestones = localStorage.getItem(milestonesKey);
    const storedBadges = localStorage.getItem(badgesKey);

    if (storedExercises) {
        exercises = JSON.parse(storedExercises);
        // Check for exercise updates from default
        checkForExerciseUpdates();
    } else {
        exercises = [...defaultExercises];
        saveExercises();
    }

    if (storedLogs) {
        dailyLogs = JSON.parse(storedLogs);
    } else if (testMode) {
        // Use mock data in test mode if no data exists
        dailyLogs = createMockData();
        saveDailyLogs();
    }

    if (storedMilestones) {
        milestones = JSON.parse(storedMilestones);
    } else {
        milestones = [...defaultMilestones];
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
    localStorage.setItem(getStorageKey('ptExercises'), JSON.stringify(exercises));
}

function saveDailyLogs() {
    localStorage.setItem(getStorageKey('ptDailyLogs'), JSON.stringify(dailyLogs));
}

function saveMilestones() {
    localStorage.setItem(getStorageKey('ptMilestones'), JSON.stringify(milestones));
}

function saveBadges() {
    localStorage.setItem(getStorageKey('unlockedBadges'), JSON.stringify(unlockedBadges));
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Date change
    document.getElementById('log-date').addEventListener('change', renderDailyExercises);

    // Session type change
    document.getElementById('session-type').addEventListener('change', function() {
        const customInput = document.getElementById('custom-session-name');
        customInput.style.display = this.value === 'custom' ? 'block' : 'none';
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
    document.getElementById('report-form').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
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
        const logData = dailyLogs[selectedDate]?.sessions?.[sessionName]?.[exercise.id] || {};
        
        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <h3 class="exercise-title">${exercise.name}</h3>
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
                        <span class="timer-display" id="timer-display-${exercise.id}">0:00</span>
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

function renderManageExercises() {
    const container = document.getElementById('manage-exercises');

    if (exercises.length === 0) {
        container.innerHTML = '<p>No exercises added yet. Click "Add New Exercise" to get started.</p>';
        return;
    }

    const activeExercises = exercises.filter(ex => ex.metadata?.isActive !== false);
    const archivedExercises = exercises.filter(ex => ex.metadata?.isActive === false);

    let html = '';

    if (activeExercises.length > 0) {
        html += '<h3>Active Exercises</h3>';
        html += activeExercises.map(exercise => `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <h3 class="exercise-title">${exercise.name}</h3>
                    <div>
                        <button class="btn btn-edit" onclick="editExercise(${exercise.id})">Edit</button>
                        <button class="btn btn-danger" onclick="archiveExercise(${exercise.id})">Archive</button>
                    </div>
                </div>
                <p class="exercise-description">${exercise.description}</p>

                <div class="exercise-details">
                    ${exercise.reps ? `<span class="detail-item"><span class="detail-label">Reps:</span> ${exercise.reps}</span>` : ''}
                    ${exercise.hold ? `<span class="detail-item"><span class="detail-label">Hold:</span> ${exercise.hold}</span>` : ''}
                    ${exercise.frequency ? `<span class="detail-item"><span class="detail-label">Frequency:</span> ${exercise.frequency}</span>` : ''}
                    ${exercise.weight ? `<span class="detail-item"><span class="detail-label">Weight:</span> ${exercise.weight}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    if (archivedExercises.length > 0) {
        html += '<h3>Archived Exercises</h3>';
        html += archivedExercises.map(exercise => `
            <div class="exercise-card archived" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <h3 class="exercise-title">${exercise.name} (Archived)</h3>
                    <div>
                        <button class="btn btn-edit" onclick="restoreExercise(${exercise.id})">Restore</button>
                    </div>
                </div>
                <p class="exercise-description">${exercise.description}</p>
                <p class="archive-date">Archived: ${exercise.metadata?.archived || 'Unknown'}</p>
            </div>
        `).join('');
    }

    container.innerHTML = html;
}

function archiveExercise(exerciseId) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
        exercise.metadata = {
            ...exercise.metadata,
            isActive: false,
            archived: new Date().toISOString().split('T')[0]
        };
        saveExercises();
        renderManageExercises();
        renderDailyExercises();
    }
}

function restoreExercise(exerciseId) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
        exercise.metadata = {
            ...exercise.metadata,
            isActive: true,
            archived: null
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
    const today = new Date().toISOString().split('T')[0];

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
            totalExercises = Object.keys(dayLog).length;
            completedExercises = Object.values(dayLog).filter(log => log.completed).length;
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
                archived: new Date().toISOString().split('T')[0]
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
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Set up theme button listeners
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
            localStorage.setItem('theme', theme);
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
    const currentTheme = localStorage.getItem('theme') || 'system';
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

function updateCharts(dates) {
    updateCompletionChart(dates);
    updatePainChart(dates);
    updateDifficultyChart(dates);
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
    const reminderEnabled = localStorage.getItem('remindersEnabled') === 'true';
    const reminderTime = localStorage.getItem('reminderTime') || '09:00';
    
    document.getElementById('reminder-time').value = reminderTime;
    
    if (reminderEnabled) {
        document.getElementById('enable-reminders').style.display = 'none';
        document.getElementById('disable-reminders').style.display = 'inline-block';
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
    localStorage.setItem('remindersEnabled', enabled);
    if (time) {
        localStorage.setItem('reminderTime', time);
    }
    
    if (enabled) {
        document.getElementById('enable-reminders').style.display = 'none';
        document.getElementById('disable-reminders').style.display = 'inline-block';
        scheduleReminder(time);
    } else {
        document.getElementById('enable-reminders').style.display = 'inline-block';
        document.getElementById('disable-reminders').style.display = 'none';
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
    link.download = `${prefix}pt-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
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
            milestones = [...defaultMilestones];
            unlockedBadges = [];

            saveExercises();
            saveDailyLogs();
            saveMilestones();
            saveBadges();

            renderDailyExercises();
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
        localStorage.removeItem('test_ptExercises');
        localStorage.removeItem('test_ptDailyLogs');
        localStorage.removeItem('test_ptMilestones');
        localStorage.removeItem('test_unlockedBadges');

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
            nextUpCard.style.display = '';
            nextUpText.textContent = nextMilestone.text;
        } else {
            nextUpCard.style.display = 'none';
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
        const dateStr = d.toISOString().split('T')[0];
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
    achievementBadges.forEach(badge => {
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
    
    container.innerHTML = achievementBadges.map(badge => {
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
    } else {
        // Start timer
        let seconds = 0;
        const display = document.getElementById(`timer-display-${exerciseId}`);
        
        timers[exerciseId] = {
            interval: setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }, 1000),
            startTime: Date.now()
        };
        
        btn.classList.add('running');
        btn.querySelector('.timer-text').textContent = 'Stop Timer';
    }
}

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
    const todayStr = today.toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLog = dailyLogs[dateStr];
        
        let dayClass = 'calendar-day';
        let indicator = '';
        
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
                        totalExercises++;
                        if (exerciseData.completed) completedExercises++;
                    });
                });
            } else {
                // Old data structure for backward compatibility
                totalExercises = Object.keys(dayLog).length;
                completedExercises = Object.values(dayLog).filter(log => log.completed).length;
            }

            if (completedExercises === totalExercises && totalExercises > 0) {
                dayClass += ' has-data';
                indicator = '✓';
            } else if (completedExercises > 0) {
                dayClass += ' partial';
                indicator = `${completedExercises}/${totalExercises}`;
            }
        }
        
        html += `
            <div class="${dayClass}" data-date="${dateStr}">
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

    if (!dayLog) {
        return `<div class="tooltip-title">${dateLabel}</div><div class="tooltip-empty">No exercises logged.</div>`;
    }

    let totalExercises = 0;
    let completedExercises = 0;
    let sessionsHtml = '';

    if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
        sessionsHtml = Object.entries(dayLog.sessions).map(([sessionName, sessionData]) => {
            const exerciseEntries = Object.entries(sessionData);
            if (exerciseEntries.length === 0) return '';
            const exerciseList = exerciseEntries.map(([exerciseId, exerciseData]) => {
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
        const exerciseEntries = Object.entries(dayLog);
        if (exerciseEntries.length === 0) {
            return `<div class="tooltip-title">${dateLabel}</div><div class="tooltip-empty">No exercises logged.</div>`;
        }
        sessionsHtml = exerciseEntries.map(([exerciseId, log]) => {
            totalExercises++;
            if (log.completed) completedExercises++;
            const exerciseName = getExerciseName(log, exerciseId);
            const statusIcon = log.completed ? '✓' : '○';
            return `<div class="tooltip-exercise"><span class="tooltip-status ${log.completed ? 'complete' : 'incomplete'}">${statusIcon}</span> ${escapeHtml(exerciseName)}</div>`;
        }).join('');
    }

    if (totalExercises === 0) {
        return `<div class="tooltip-title">${dateLabel}</div><div class="tooltip-empty">No exercises logged.</div>`;
    }

    const summary = `${completedExercises}/${totalExercises} completed`;
    return `
        <div class="tooltip-title">${dateLabel}</div>
        <div class="tooltip-summary">${summary}</div>
        ${sessionsHtml}
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
                    dayTotal++;
                    if (exerciseData.completed) dayCompleted++;
                });
            });
        } else {
            dayTotal = Object.keys(dayLog).length;
            dayCompleted = Object.values(dayLog).filter(log => log.completed).length;
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
    const todayStr = checkDate.toISOString().split('T')[0];
    if (hasLoggedData(todayStr)) {
        streak++;
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
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
    if (!dayLog) {
        body.innerHTML = '<div class="day-detail-empty">No exercises logged for this day.</div>';
    } else {
        let totalExercises = 0;
        let completedExercises = 0;
        let sessionsHtml = '';

        if (dayLog.sessions && Object.keys(dayLog.sessions).length > 0) {
            sessionsHtml = Object.entries(dayLog.sessions).map(([sessionName, sessionData]) => {
                const exerciseEntries = Object.entries(sessionData);
                if (exerciseEntries.length === 0) return '';
                const exerciseList = exerciseEntries.map(([exerciseId, exerciseData]) => {
                    totalExercises++;
                    if (exerciseData.completed) completedExercises++;
                    const exerciseName = getExerciseName(exerciseData, exerciseId);
                    const statusIcon = exerciseData.completed ? '✅' : '⏳';
                    const metaParts = [];
                    if (exerciseData.reps) metaParts.push(`${exerciseData.reps} reps`);
                    if (exerciseData.weight) metaParts.push(`${exerciseData.weight}`);
                    if (exerciseData.timestamp) {
                        metaParts.push(new Date(exerciseData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
            const exerciseEntries = Object.entries(dayLog);
            sessionsHtml = exerciseEntries.map(([exerciseId, log]) => {
                totalExercises++;
                if (log.completed) completedExercises++;
                const exerciseName = getExerciseName(log, exerciseId);
                const statusIcon = log.completed ? '✅' : '⏳';
                return `
                    <div class="day-detail-exercise">
                        <span class="day-detail-exercise-status">${statusIcon}</span>
                        <span class="day-detail-exercise-name">${escapeHtml(exerciseName)}</span>
                    </div>
                `;
            }).join('');
        }

        if (totalExercises === 0) {
            body.innerHTML = '<div class="day-detail-empty">No exercises logged for this day.</div>';
        } else {
            const completionRate = Math.round((completedExercises / totalExercises) * 100);
            body.innerHTML = `
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
                ${sessionsHtml}
            `;
        }
    }

    editBtn.onclick = () => {
        document.getElementById('log-date').value = dateStr;
        modal.style.display = 'none';
        switchTab('daily');
    };

    modal.style.display = 'block';
}

// Report generation
function openReportModal() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    document.getElementById('report-start-date').value = formatDateInput(thirtyDaysAgo);
    document.getElementById('report-end-date').value = formatDateInput(today);
    document.getElementById('report-modal').style.display = 'block';
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
    const includeTimestamps = document.getElementById('report-include-timestamps').checked;

    const startDate = startInput ? new Date(`${startInput}T00:00:00`) : null;
    const endDate = endInput ? new Date(`${endInput}T23:59:59`) : null;

    const filteredDates = Object.keys(dailyLogs).filter(dateStr => {
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

    const daysHtml = [];
    const textLines = [];

    filteredDates.forEach(dateStr => {
        const dayLog = dailyLogs[dateStr];
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
                const status = log.completed ? '✅' : '⏳';
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
                textLines.push(`    ${status} ${name}${textDetail}${time ? ` @ ${time}` : ''}`);
            });

            const sessionTotal = exerciseEntries.length;
            const sessionRate = sessionTotal > 0 ? Math.round((sessionCompleted / sessionTotal) * 100) : 0;

            dayHtml.push(`
                <div class="report-session">
                    <div class="session-title">${escapeHtml(sessionName)} <span class="session-rate">${sessionCompleted}/${sessionTotal} (${sessionRate}%)</span></div>
                    <ul class="report-exercises">${sessionHtml.join('')}</ul>
                </div>
            `);
        });

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

    const dateRangeText = startInput && endInput
        ? `${new Date(`${startInput}T00:00:00`).toLocaleDateString('en-US')} – ${new Date(`${endInput}T00:00:00`).toLocaleDateString('en-US')}`
        : 'All available dates';

    const summaryHtml = includeSummary && totalExercises > 0 ? `
        <div class="summary">
            <div class="summary-card"><div class="value">${filteredDates.length}</div><div class="label">Days</div></div>
            <div class="summary-card"><div class="value">${totalSessions}</div><div class="label">Sessions</div></div>
            <div class="summary-card"><div class="value">${completedExercises}/${totalExercises}</div><div class="label">Completed</div></div>
            <div class="summary-card"><div class="value">${completionRate}%</div><div class="label">Completion Rate</div></div>
            <div class="summary-card"><div class="value">${avgPain}</div><div class="label">Avg Pain</div></div>
            <div class="summary-card"><div class="value">${avgDifficulty}</div><div class="label">Avg Difficulty</div></div>
        </div>
    ` : '';

    const summaryText = includeSummary && totalExercises > 0
        ? `Summary: ${filteredDates.length} days, ${totalSessions} sessions, ${completedExercises}/${totalExercises} completed (${completionRate}%). Average pain: ${avgPain}, average difficulty: ${avgDifficulty}.`
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
        hasData: totalExercises > 0
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