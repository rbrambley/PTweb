const assert = require('assert');
const PT_CONFIG = require('./config.js');

// Default exercises
assert(Array.isArray(PT_CONFIG.defaultExercises), 'defaultExercises should be an array');
assert(PT_CONFIG.defaultExercises.length > 0, 'defaultExercises should not be empty');
PT_CONFIG.defaultExercises.forEach((ex, i) => {
    assert(ex.id != null, `Exercise ${i} missing id`);
    assert(ex.name, `Exercise ${i} missing name`);
});

// Default milestones
assert(Array.isArray(PT_CONFIG.defaultMilestones), 'defaultMilestones should be an array');
assert(PT_CONFIG.defaultMilestones.length > 0, 'defaultMilestones should not be empty');
PT_CONFIG.defaultMilestones.forEach((m, i) => {
    assert(m.id != null, `Milestone ${i} missing id`);
    assert(m.text, `Milestone ${i} missing text`);
});

// Achievement badge checks
const badges = PT_CONFIG.achievementBadges;
assert(Array.isArray(badges), 'achievementBadges should be an array');
assert(badges.length > 0, 'achievementBadges should not be empty');

const firstDay = badges.find(b => b.id === 'first_day');
assert(firstDay, 'first_day badge not found');
assert.strictEqual(firstDay.check({ totalDays: 0 }), false, 'first_day should not unlock with 0 days');
assert.strictEqual(firstDay.check({ totalDays: 1 }), true, 'first_day should unlock with 1 day');

const oneWeek = badges.find(b => b.id === 'one_week');
assert(oneWeek, 'one_week badge not found');
assert.strictEqual(oneWeek.check({ totalDays: 6 }), false, 'one_week should not unlock with 6 days');
assert.strictEqual(oneWeek.check({ totalDays: 7 }), true, 'one_week should unlock with 7 days');

const allMilestones = badges.find(b => b.id === 'all_milestones');
assert(allMilestones, 'all_milestones badge not found');
assert.strictEqual(allMilestones.check({ completedMilestones: 12, totalMilestones: 13 }), false, 'all_milestones should not unlock early');
assert.strictEqual(allMilestones.check({ completedMilestones: 13, totalMilestones: 13 }), true, 'all_milestones should unlock when all complete');

console.log('All tests passed.');
