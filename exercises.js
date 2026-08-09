// Exercise management functions

function checkForExerciseUpdates() {
    const updates = {
        newExercises: [],
        modifiedExercises: [],
        unchangedExercises: []
    };

    // Check for new or modified exercises, avoiding duplicates by ID or name
    PT_CONFIG.defaultExercises.forEach(defaultExercise => {
        const existingById = exercises.find(ex => ex.id === defaultExercise.id);
        const existingByName = !existingById ? exercises.find(
            ex => ex.name && defaultExercise.name &&
                  ex.name.toLowerCase().trim() === defaultExercise.name.toLowerCase().trim()
        ) : null;
        const existingExercise = existingById || existingByName;

        if (!existingExercise) {
            // New exercise
            updates.newExercises.push(defaultExercise);
        } else {
            // Merge with the existing exercise to preserve its ID and active state
            const mergedExercise = {
                ...defaultExercise,
                id: existingExercise.id,
                metadata: {
                    ...(defaultExercise.metadata || {}),
                    created: existingExercise.metadata?.created || defaultExercise.metadata?.created,
                    isActive: existingExercise.metadata?.isActive !== false
                }
            };

            const isModified = (
                existingExercise.name !== mergedExercise.name ||
                existingExercise.description !== mergedExercise.description ||
                existingExercise.reps !== mergedExercise.reps ||
                existingExercise.hold !== mergedExercise.hold ||
                existingExercise.frequency !== mergedExercise.frequency ||
                existingExercise.weight !== mergedExercise.weight
            );

            if (isModified) {
                updates.modifiedExercises.push({
                    existing: existingExercise,
                    updated: mergedExercise
                });
            } else {
                updates.unchangedExercises.push(existingExercise);
            }
        }
    });

    // No automatic archiving. Users activate/inactivate exercises manually.

    // If there are updates, store them and show confirmation dialog
    if (updates.newExercises.length > 0 || updates.modifiedExercises.length > 0) {
        pendingExerciseUpdates = updates;
        showExerciseUpdateDialog(updates);
    }
}

function showExerciseUpdateDialog(updates) {
    const dialog = document.createElement('div');
    dialog.className = 'exercise-update-dialog';
    dialog.innerHTML = `
        <div class="update-dialog-content">
            <h2>Exercise Plan Updated</h2>
            <p>Your PT has updated your exercise plan:</p>

            ${updates.newExercises.length > 0 ? `
            <div class="update-section">
                <h3>New Exercises:</h3>
                <ul>
                    ${updates.newExercises.map(ex => `<li>${ex.name}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${updates.modifiedExercises.length > 0 ? `
            <div class="update-section">
                <h3>Modified Exercises:</h3>
                <ul>
                    ${updates.modifiedExercises.map(mod => `
                        <li>${mod.existing.name}
                            ${mod.existing.reps !== mod.updated.reps ? ` (${mod.existing.reps} → ${mod.updated.reps} reps)` : ''}
                            ${mod.existing.hold !== mod.updated.hold ? ` (hold: ${mod.existing.hold} → ${mod.updated.hold})` : ''}
                            ${mod.existing.frequency !== mod.updated.frequency ? ` (frequency: ${mod.existing.frequency} → ${mod.updated.frequency})` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            <p class="update-note">No exercises will be removed. You can activate or inactivate exercises on the Manage Exercises tab.</p>

            <div class="update-dialog-buttons">
                <button class="btn btn-primary" id="apply-updates">Apply Changes</button>
                <button class="btn btn-secondary" id="review-details">Review Details</button>
                <button class="btn btn-secondary" id="dismiss-updates">Dismiss</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById('apply-updates').addEventListener('click', () => {
        applyExerciseUpdates(updates);
        document.body.removeChild(dialog);
    });

    document.getElementById('review-details').addEventListener('click', () => {
        showDetailedUpdateInfo(updates);
    });

    document.getElementById('dismiss-updates').addEventListener('click', () => {
        document.body.removeChild(dialog);
        pendingExerciseUpdates = null;
    });
}

function showDetailedUpdateInfo(updates) {
    let details = "Exercise Update Details:\n\n";

    if (updates.newExercises.length > 0) {
        details += "NEW EXERCISES:\n";
        updates.newExercises.forEach(ex => {
            details += `\n${ex.name}\n`;
            details += `  Description: ${ex.description.substring(0, 100)}...\n`;
            details += `  Reps: ${ex.reps || 'N/A'}\n`;
            details += `  Hold: ${ex.hold || 'N/A'}\n`;
            details += `  Frequency: ${ex.frequency || 'N/A'}\n`;
        });
    }

    if (updates.modifiedExercises.length > 0) {
        details += "\n\nMODIFIED EXERCISES:\n";
        updates.modifiedExercises.forEach(mod => {
            details += `\n${mod.existing.name}\n`;
            details += `  Reps: ${mod.existing.reps || 'N/A'} → ${mod.updated.reps || 'N/A'}\n`;
            details += `  Hold: ${mod.existing.hold || 'N/A'} → ${mod.updated.hold || 'N/A'}\n`;
            details += `  Frequency: ${mod.existing.frequency || 'N/A'} → ${mod.updated.frequency || 'N/A'}\n`;
            details += `  Weight: ${mod.existing.weight || 'N/A'} → ${mod.updated.weight || 'N/A'}\n`;
        });
    }

    details += "\n\nNo exercises will be removed.";

    alert(details);
}

function applyExerciseUpdates(updates) {
    const today = formatDateInput(new Date());

    // Add new exercises
    updates.newExercises.forEach(newExercise => {
        const exerciseWithMetadata = {
            ...newExercise,
            metadata: {
                ...newExercise.metadata,
                created: today,
                modified: today
            }
        };
        exercises.push(exerciseWithMetadata);
    });

    // Update modified exercises
    updates.modifiedExercises.forEach(mod => {
        const existingIndex = exercises.findIndex(ex => ex.id === mod.existing.id);
        if (existingIndex !== -1) {
            exercises[existingIndex] = {
                ...mod.updated,
                metadata: {
                    ...mod.updated.metadata,
                    created: mod.existing.metadata?.created || today,
                    modified: today,
                    version: (mod.existing.metadata?.version || 1) + 1
                }
            };
        }
    });

    // No automatic archiving. Users manage active/inactive state on the Manage Exercises tab.

    // Save updated exercises
    saveExercises();

    // Refresh UI
    renderDailyExercises();
    renderManageExercises();

    alert('Exercise updates applied successfully!');
    pendingExerciseUpdates = null;
}

function renderManageExercises() {
    const container = document.getElementById('manage-exercises');

    if (exercises.length === 0) {
        container.innerHTML = '<p>No exercises added yet. Click "Add New Exercise" to get started.</p>';
        return;
    }

    // Show all exercises; inactive ones appear at the bottom with a visual style
    const sortedExercises = [...exercises].sort((a, b) => {
        const aInactive = a.metadata?.isActive === false ? 1 : 0;
        const bInactive = b.metadata?.isActive === false ? 1 : 0;
        return aInactive - bInactive;
    });

    const html = sortedExercises.map(exercise => `
        <div class="exercise-card ${exercise.metadata?.isActive === false ? 'archived' : ''}" data-exercise-id="${exercise.id}">
            <div class="exercise-header">
                <h3 class="exercise-title">${exercise.name}${exercise.metadata?.isActive === false ? ' (Inactive)' : ''}</h3>
                <div class="exercise-actions">
                    <button class="btn btn-edit" onclick="editExercise(${exercise.id})">Edit</button>
                    <label class="switch" title="Toggle active/inactive">
                        <input type="checkbox" onchange="toggleExerciseActive(${exercise.id})" ${exercise.metadata?.isActive !== false ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            <p class="exercise-description">${exercise.description}</p>

            <div class="exercise-details">
                ${exercise.reps ? `<span class="detail-item"><span class="detail-label">Reps:</span> ${exercise.reps}</span>` : ''}
                ${exercise.hold ? `<span class="detail-item"><span class="detail-label">Hold:</span> ${exercise.hold}</span>` : ''}
                ${exercise.frequency ? `<span class="detail-item"><span class="detail-label">Frequency:</span> ${exercise.frequency}</span>` : ''}
                ${exercise.weight ? `<span class="detail-item"><span class="detail-label">Weight:</span> ${exercise.weight}</span>` : ''}
            </div>
            ${exercise.metadata?.archived && exercise.metadata?.isActive === false ? `<p class="archive-date">Inactive since: ${exercise.metadata.archived}</p>` : ''}
        </div>
    `).join('');

    container.innerHTML = html;
}

function toggleExerciseActive(exerciseId) {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
        const newActive = !(exercise.metadata?.isActive !== false);
        exercise.metadata = {
            ...exercise.metadata,
            isActive: newActive,
            archived: newActive ? null : formatDateInput(new Date())
        };
        saveExercises();
        renderManageExercises();
        renderDailyExercises();
    }
}

function openAddExerciseModal() {
    editingExerciseId = null;
    document.getElementById('modal-title').textContent = 'Add Exercise';
    document.getElementById('exercise-form').reset();
    document.getElementById('exercise-modal').style.display = 'block';
}

function editExercise(id) {
    editingExerciseId = id;
    const exercise = exercises.find(ex => ex.id === id);
    
    if (exercise) {
        document.getElementById('modal-title').textContent = 'Edit Exercise';
        document.getElementById('exercise-name').value = exercise.name;
        document.getElementById('exercise-description').value = exercise.description;
        document.getElementById('exercise-reps').value = exercise.reps || '';
        document.getElementById('exercise-hold').value = exercise.hold || '';
        document.getElementById('exercise-frequency').value = exercise.frequency || '';
        document.getElementById('exercise-weight').value = exercise.weight || '';
        document.getElementById('exercise-modal').style.display = 'block';
    }
}

function deleteExercise(id) {
    if (confirm('Are you sure you want to delete this exercise? This will archive it and preserve all historical data.')) {
        const exercise = exercises.find(ex => ex.id === id);
        if (exercise) {
            exercise.metadata = {
                ...exercise.metadata,
                isActive: false,
                archived: formatDateInput(new Date())
            };
            saveExercises();
            renderManageExercises();
            renderDailyExercises();
        }
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    editingExerciseId = null;
}

function handleExerciseFormSubmit(e) {
    e.preventDefault();
    
    const exerciseData = {
        name: document.getElementById('exercise-name').value,
        description: document.getElementById('exercise-description').value,
        reps: document.getElementById('exercise-reps').value,
        hold: document.getElementById('exercise-hold').value,
        frequency: document.getElementById('exercise-frequency').value,
        weight: document.getElementById('exercise-weight').value
    };
    
    if (editingExerciseId) {
        // Update existing exercise
        const index = exercises.findIndex(ex => ex.id === editingExerciseId);
        if (index !== -1) {
            exercises[index] = { ...exercises[index], ...exerciseData };
        }
    } else {
        // Add new exercise
        const newId = exercises.length > 0 ? Math.max(...exercises.map(ex => ex.id)) + 1 : 1;
        exercises.push({ id: newId, ...exerciseData });
    }
    
    saveExercises();
    renderManageExercises();
    renderDailyExercises();
    closeModal();
}
