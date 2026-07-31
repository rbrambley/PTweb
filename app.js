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
}

function loadData() {
    const storedExercises = localStorage.getItem('ptExercises');
    const storedLogs = localStorage.getItem('ptDailyLogs');
    const storedMilestones = localStorage.getItem('ptMilestones');
    const storedBadges = localStorage.getItem('unlockedBadges');

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
    }

    if (storedMilestones) {
        milestones = JSON.parse(storedMilestones);
    } else {
        milestones = [...defaultMilestones];
        saveMilestones();
    }

    if (storedBadges) {
        unlockedBadges = JSON.parse(storedBadges);
    }
}

function saveExercises() {
    localStorage.setItem('ptExercises', JSON.stringify(exercises));
}

function saveDailyLogs() {
    localStorage.setItem('ptDailyLogs', JSON.stringify(dailyLogs));
}

function saveMilestones() {
    localStorage.setItem('ptMilestones', JSON.stringify(milestones));
}

function saveBadges() {
    localStorage.setItem('unlockedBadges', JSON.stringify(unlockedBadges));
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
    
    // Settings functionality
    document.getElementById('enable-reminders').addEventListener('click', enableReminders);
    document.getElementById('disable-reminders').addEventListener('click', disableReminders);
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-all-data').addEventListener('click', clearAllData);
    
    // Load reminder settings
    loadReminderSettings();
    
    // Exercise form submission
    document.getElementById('exercise-form').addEventListener('submit', handleExerciseFormSubmit);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
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

    dates.forEach(date => {
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
    document.getElementById('exercise-modal').style.display = 'none';
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
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pt-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
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

// Milestone functions
function renderMilestones() {
    const container = document.getElementById('milestone-list');
    
    container.innerHTML = milestones.map(milestone => `
        <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
            <input type="checkbox" class="milestone-checkbox" data-milestone-id="${milestone.id}" ${milestone.completed ? 'checked' : ''}>
            <span class="milestone-text">${milestone.text}</span>
            <span class="milestone-icon">${milestone.completed ? '✅' : '⭕'}</span>
        </div>
    `).join('');
    
    // Add event listeners to milestone checkboxes
    document.querySelectorAll('.milestone-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
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
    }
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
    
    // Add click handlers to calendar days
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', function() {
            const date = this.dataset.date;
            document.getElementById('log-date').value = date;
            switchTab('daily');
        });
    });
}