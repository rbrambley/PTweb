// PT Tracker configuration constants
const PT_CONFIG = {
    appName: 'Disc Golf PT Tracker',
    version: '1.0.0',
    storage: {
        exercises: 'ptExercises',
        dailyLogs: 'ptDailyLogs',
        swellingLogs: 'ptSwellingLogs',
        milestones: 'ptMilestones',
        badges: 'unlockedBadges',
        theme: 'theme',
        remindersEnabled: 'remindersEnabled',
        reminderTime: 'reminderTime'
    },
    defaultMilestones: [
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
    ],
    achievementBadges: [
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
    ]
};
