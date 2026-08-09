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
        reminderTime: 'reminderTime',
        targetDate: 'ptTargetDate',
        lastBackup: 'ptLastBackup'
    },
    defaultExercises: [
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
                modified: "2026-08-07",
                version: 1,
                isActive: true
            }
        },
        {
            id: 4,
            name: "BIG: Standing Hip Abduction",
            description: "Stand upright while holding onto a stable surface for support (kitchen sink works well). Slowly move the working leg out to the side while keeping the trunk upright and the pelvis level. Return to the starting position with control and repeat. Ankle weights are not always needed, but can be used for added difficulty. Move slow and steady, no leaning. The less dependent you are on your hold, the more you will balance with your legs.",
            reps: 20,
            hold: "3-5 seconds",
            frequency: "1-2 times a day",
            weight: "3-5 lbs",
            metadata: {
                created: "2026-07-30",
                modified: "2026-08-07",
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
                modified: "2026-08-07",
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
                modified: "2026-08-07",
                version: 1,
                isActive: true
            }
        },
        {
            id: 7,
            name: "BIG: Toe and Heel Raises",
            description: "Stand tall while lightly holding onto a stable surface for balance. The kitchen sink is a good place to hold on to. Do not fall backwards when raising your toes. Heel raises: lift your heels off the ground, rising up onto the balls of your feet. Hold briefly, then lower slowly. Toe raises: lift your toes and the front of your foot while keeping your heels on the ground. Hold briefly, then lower with control. Repeat in a smooth, controlled motion without leaning forward or backward.",
            reps: 20,
            hold: "pause for a second while on your toes and when on your heels",
            frequency: "2-3 times per day",
            weight: "",
            metadata: {
                created: "2026-07-30",
                modified: "2026-08-07",
                version: 1,
                isActive: true
            }
        },
        {
            id: 8,
            name: "BIG: Cross Drill Tandem",
            description: "Stand in a tandem stance (one foot directly in front of the other) on a foam pad. Hold a lightweight medicine ball (or similar object) at chest height. Maintain a tall posture, core engaged, and eyes forward. Slowly raise the ball up and diagonally across your body, extending your arms overhead in a controlled cross-body pattern. Return to the starting position without losing balance. Keep your lower body steady and avoid twisting excessively through the hips or trunk. Repeat for the prescribed number of repetitions, then switch tandem foot position to challenge both sides equally.",
            reps: "10 each stance",
            hold: "5-10 seconds",
            frequency: "2-3 times per day",
            weight: "",
            metadata: {
                created: "2026-08-07",
                modified: "2026-08-07",
                version: 1,
                isActive: true
            }
        },
        {
            id: 9,
            name: "BIG: Single Leg RDL's",
            description: "Stand on one leg with a soft bend in your knee. Keep your back straight and your core muscles engaged. Slowly hinge forward at your hips, allowing your opposite leg to extend straight behind you as a counterbalance. Your torso and lifted leg should move together, staying in a straight line from your head to your heel. Reach your hand toward the floor or toward your shin while keeping your hips level and avoiding twisting or rounding your back. Move only as far as you can while maintaining good balance and control. Then tighten your glutes and hamstrings to return to the upright position. Perform the motion slowly and steadily.",
            reps: "20 each side",
            hold: "2-3 seconds",
            frequency: "2-3 times per day",
            weight: "",
            metadata: {
                created: "2026-08-07",
                modified: "2026-08-07",
                version: 1,
                isActive: true
            }
        }
    ],
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PT_CONFIG;
}
