const assert = require('assert');
const PT_CONFIG = require('./config.js');
const PT_UTILS = require('./utils.js');
const PT_STORAGE = require('./storage.js');

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

// Utility helpers
assert.strictEqual(PT_UTILS.formatDateInput(new Date(2026, 7, 15)), '2026-08-15', 'formatDateInput formats dates');
assert.strictEqual(PT_UTILS.escapeHtml('<script>&"\''), '&lt;script&gt;&amp;&quot;&#039;', 'escapeHtml escapes HTML entities');
assert.strictEqual(PT_UTILS.parseHoldSeconds('3-5 seconds'), 3, 'parseHoldSeconds parses the first number');
assert.strictEqual(PT_UTILS.parseHoldSeconds('pause for a second while on your toes and when on your heels'), 0, 'parseHoldSeconds returns 0 when no number');
assert.strictEqual(PT_UTILS.formatTime(65), '1:05', 'formatTime formats minutes and seconds');
assert.strictEqual(PT_UTILS.formatTime(8), '0:08', 'formatTime pads seconds');

// Storage key helper
const originalTestMode = global.testMode;
global.testMode = false;
assert.strictEqual(PT_STORAGE.getStorageKey('ptExercises'), 'ptExercises', 'getStorageKey returns base key in normal mode');
global.testMode = true;
assert.strictEqual(PT_STORAGE.getStorageKey('ptExercises'), 'test_ptExercises', 'getStorageKey prefixes test key in test mode');
global.testMode = originalTestMode;

// Storage helpers
global.testMode = false;
assert.strictEqual(PT_STORAGE.getStorageKey('ptExercises'), 'ptExercises', 'getStorageKey returns base key');
global.testMode = true;
assert.strictEqual(PT_STORAGE.getStorageKey('ptExercises'), 'test_ptExercises', 'getStorageKey prefixes test key');
global.testMode = false;

// Utility edge cases
assert.strictEqual(PT_UTILS.formatDateInput(new Date(2026, 0, 5)), '2026-01-05', 'formatDateInput pads single-digit month and day');
assert.strictEqual(PT_UTILS.escapeHtml(''), '', 'escapeHtml handles empty string');
assert.strictEqual(PT_UTILS.escapeHtml(null), '', 'escapeHtml handles null');
assert.strictEqual(PT_UTILS.parseHoldSeconds('20 reps, hold 5 sec'), 20, 'parseHoldSeconds takes the first number');
assert.strictEqual(PT_UTILS.parseHoldSeconds('none'), 0, 'parseHoldSeconds returns 0 when no number');
assert.strictEqual(PT_UTILS.formatTime(0), '0:00', 'formatTime formats zero seconds');
assert.strictEqual(PT_UTILS.formatTime(3599), '59:59', 'formatTime formats large times');

console.log('All tests passed.');
