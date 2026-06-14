import ExerciseData from './ExerciseData.mjs';

const dataSource = new ExerciseData();
const searchInput = document.getElementById('exercise-search');
const searchResults = document.getElementById('search-results');
const searchSpinner = document.getElementById('search-spinner');
const routineList = document.getElementById('routine-list');
const exerciseCount = document.getElementById('exercise-count');
const emptyMsg = document.getElementById('empty-msg');
const routineNameInput = document.getElementById('routine-name');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const loadModal = document.getElementById('load-modal');
const savedRoutinesList = document.getElementById('saved-routines-list');
const closeModal = document.getElementById('close-modal');

let currentRoutine = [];
let allExercises = [];

// Search result template
function searchResultTemplate(exercise) {
  return `
    <li class="search-result-item">
      <div class="search-result-info">
        <p class="search-result-name">${exercise.name}</p>
        <p class="search-result-target">${exercise.targetMuscles.join(', ')} — ${exercise.equipments.join(', ')}</p>
      </div>
      <button class="btn btn-primary btn-small add-exercise-btn" data-id="${exercise.exerciseId}">+ Add</button>
    </li>
  `;
}

// Routine item template
function routineItemTemplate(item, index) {
  return `
    <li class="routine-item" data-index="${index}">
      <div class="routine-item__info">
        <p class="routine-item__name">${index + 1}. ${item.name}</p>
        <p class="routine-item__target">${item.targetMuscles} — ${item.equipment}</p>
      </div>
      <div class="routine-item__fields">
        <label>Sets <input type="number" class="sets-input" value="${item.sets}" min="1" data-index="${index}" /></label>
        <label>Reps <input type="number" class="reps-input" value="${item.reps}" min="1" data-index="${index}" /></label>
        <label>Rest <input type="text" class="rest-input" value="${item.rest}" data-index="${index}" placeholder="60s" /></label>
      </div>
      <button class="btn btn-remove remove-btn" data-index="${index}">Remove</button>
    </li>
  `;
}

function renderRoutine() {
  exerciseCount.textContent = currentRoutine.length;

  if (currentRoutine.length === 0) {
    routineList.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  routineList.innerHTML = currentRoutine.map(routineItemTemplate).join('');

  // Attach remove listeners
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      currentRoutine.splice(index, 1);
      renderRoutine();
    });
  });

  // Attach input change listeners
  document.querySelectorAll('.sets-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      currentRoutine[e.target.dataset.index].sets = Number(e.target.value);
    });
  });

  document.querySelectorAll('.reps-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      currentRoutine[e.target.dataset.index].reps = Number(e.target.value);
    });
  });

  document.querySelectorAll('.rest-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      currentRoutine[e.target.dataset.index].rest = e.target.value;
    });
  });
}

function addExercise(exercise) {
  currentRoutine.push({
    id: exercise.exerciseId,
    name: exercise.name,
    targetMuscles: exercise.targetMuscles.join(', '),
    equipment: exercise.equipments.join(', '),
    sets: 3,
    reps: 10,
    rest: '60s',
  });
  renderRoutine();
}

// Search
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    const filtered = allExercises.filter((ex) =>
      ex.name.toLowerCase().includes(query)
    );

    searchResults.innerHTML = filtered.slice(0, 10).map(searchResultTemplate).join('');

    // Attach add listeners
    document.querySelectorAll('.add-exercise-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const exercise = allExercises.find((ex) => ex.exerciseId === id);
        if (exercise) addExercise(exercise);
      });
    });
  }, 300);
});

// Save routine
saveBtn.addEventListener('click', () => {
  const name = routineNameInput.value.trim();
  if (!name) {
    alert('Please enter a routine name.');
    return;
  }

  if (currentRoutine.length === 0) {
    alert('Add at least one exercise to save.');
    return;
  }

  const saved = JSON.parse(localStorage.getItem('ff-routines') || '[]');
  const existing = saved.findIndex((r) => r.name === name);

  if (existing > -1) {
    saved[existing].exercises = currentRoutine;
  } else {
    saved.push({ name, exercises: currentRoutine });
  }

  localStorage.setItem('ff-routines', JSON.stringify(saved));
  alert(`Routine "${name}" saved!`);
});

// Load routine modal
loadBtn.addEventListener('click', () => {
  const saved = JSON.parse(localStorage.getItem('ff-routines') || '[]');

  if (saved.length === 0) {
    savedRoutinesList.innerHTML = '<p style="color: var(--text-muted);">No saved routines yet.</p>';
  } else {
    savedRoutinesList.innerHTML = saved.map((r, i) => `
      <li class="saved-routine-item">
        <span>${r.name} (${r.exercises.length} exercises)</span>
        <div>
          <button class="btn btn-primary btn-small load-routine-btn" data-index="${i}">Load</button>
          <button class="btn btn-remove btn-small delete-routine-btn" data-index="${i}">Delete</button>
        </div>
      </li>
    `).join('');

    document.querySelectorAll('.load-routine-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = Number(e.target.dataset.index);
        const routine = saved[index];
        routineNameInput.value = routine.name;
        currentRoutine = [...routine.exercises];
        renderRoutine();
        loadModal.classList.add('hide');
      });
    });

    document.querySelectorAll('.delete-routine-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = Number(e.target.dataset.index);
        saved.splice(index, 1);
        localStorage.setItem('ff-routines', JSON.stringify(saved));
        loadBtn.click();
      });
    });
  }

  loadModal.classList.remove('hide');
});

closeModal.addEventListener('click', () => {
  loadModal.classList.add('hide');
});

// Load all exercises for searching
async function init() {
  searchSpinner.classList.add('active');
  allExercises = await dataSource.getAllExercises();
  searchSpinner.classList.remove('active');
}

init();
