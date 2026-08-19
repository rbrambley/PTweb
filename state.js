// Global application state
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

function saveMilestones() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.milestones), JSON.stringify(milestones));
    persistToIndexedDB();
}

function saveBadges() {
    localStorage.setItem(getStorageKey(PT_CONFIG.storage.badges), JSON.stringify(unlockedBadges));
    persistToIndexedDB();
}
