function updateCountdown() {
    const savedTarget = localStorage.getItem(PT_CONFIG.storage.targetDate);
    const targetDateStr = savedTarget || '2026-09-01';
    const targetDate = new Date(`${targetDateStr}T00:00:00`);
    const today = new Date();

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);

    document.getElementById('countdown').textContent = `${weeks} weeks remaining`;
    document.getElementById('target-label').textContent = targetDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}
