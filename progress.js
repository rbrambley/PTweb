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
