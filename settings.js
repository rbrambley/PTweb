// Reminder and data management functions

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

function loadTargetDateSettings() {
    const savedTarget = localStorage.getItem(PT_CONFIG.storage.targetDate) || '2026-09-01';
    document.getElementById('target-date').value = savedTarget;
    updateCountdown();
}

function saveTargetDate() {
    const targetDate = document.getElementById('target-date').value;
    if (!targetDate) return;
    localStorage.setItem(PT_CONFIG.storage.targetDate, targetDate);
    updateCountdown();
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
