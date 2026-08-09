// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});



// Return-to-play milestones

// Groups milestones into recovery phases for the Return to Play timeline.
// Defined by milestone id ranges so it stays in sync even for milestones
// saved to localStorage before this grouping existed.
const milestonePhases = [
    { name: 'Weeks 1-2: Foundation', icon: '🌱', minId: 1, maxId: 4 },
    { name: 'Weeks 3-4: Building Strength', icon: '💪', minId: 5, maxId: 8 },
    { name: 'Weeks 5-6: Advanced Training', icon: '🚀', minId: 9, maxId: 12 },
    { name: 'Return to Competition', icon: '🏆', minId: 13, maxId: 13 }
];




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
    setupCollapseListeners();
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






