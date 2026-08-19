// Milestone and badge functions

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
                        if (log.excluded) return;
                        totalExercisesThisWeek++;
                        if (log.completed) {
                            completedExercisesThisWeek++;
                            hasCompletedExercise = true;
                        }
                    });
                });
            } else {
                // Old data structure for backward compatibility
                hasCompletedExercise = Object.values(dayLog).some(log => !log.excluded && log.completed);

                Object.values(dayLog).forEach(log => {
                    if (log.excluded) return;
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
                    if (exerciseData.excluded) return;
                    if (exerciseData.completed) exercisesCompleted++;
                });
            });
        } else {
            // Support old data structure
            exercisesCompleted = Object.values(dayLog).filter(log => !log.excluded && log.completed).length;
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
                    if (log.excluded) return;
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
                if (log.excluded) return;
                totalPossible++;
                if (log.completed) {
                    totalCompleted++;
                }
            });

            painValues = Object.values(dayLog).filter(log => !log.excluded).map(log => log.pain).filter(pain => pain !== null && pain !== undefined);
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
