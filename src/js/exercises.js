import ExerciseData from './ExerciseData.mjs';

const dataSource = new ExerciseData();
const exerciseList = document.getElementById('exercise-list');
const bodyPartFilter = document.getElementById('bodypart-filter');
const equipmentFilter = document.getElementById('equipment-filter');
const spinner = document.getElementById('loading-spinner');

function exerciseCardTemplate(exercise) {
  return `
    <li class="exercise-card">
      <img src="${exercise.gifUrl || '/images/exercise-placeholder.svg'}" alt="${exercise.name}" loading="lazy" />
      <div class="exercise-card__info">
        <p class="exercise-card__name">${exercise.name}</p>
        <p class="exercise-card__target">Target: ${exercise.targetMuscles.join(', ')}</p>
        <p class="exercise-card__equipment">Equipment: ${exercise.equipments.join(', ')}</p>
      </div>
    </li>
  `;
}

function renderExercises(exercises) {
  if (exercises.length === 0) {
    exerciseList.innerHTML = '<p style="color: var(--text-muted);">No exercises found.</p>';
    return;
  }
  exerciseList.innerHTML = exercises.map(exerciseCardTemplate).join('');
}

function showSpinner() {
  spinner.classList.add('active');
}

function hideSpinner() {
  spinner.classList.remove('active');
}

async function loadFilters() {
  const [bodyParts, equipment] = await Promise.all([
    dataSource.getBodyPartList(),
    dataSource.getEquipmentList(),
  ]);

  bodyParts.forEach((bp) => {
    const option = document.createElement('option');
    option.value = bp;
    option.textContent = bp;
    bodyPartFilter.appendChild(option);
  });

  equipment.forEach((eq) => {
    const option = document.createElement('option');
    option.value = eq;
    option.textContent = eq;
    equipmentFilter.appendChild(option);
  });
}

async function loadExercises() {
  showSpinner();
  exerciseList.innerHTML = '';

  const bodyPart = bodyPartFilter.value;
  const equipment = equipmentFilter.value;

  let exercises;

  if (bodyPart) {
    exercises = await dataSource.getExercisesByBodyPart(bodyPart);
  } else if (equipment) {
    exercises = await dataSource.getExercisesByEquipment(equipment);
  } else {
    exercises = await dataSource.getAllExercises();
  }

  // If both filters are set, apply second filter on results
  if (bodyPart && equipment) {
    exercises = exercises.filter((ex) => ex.equipments.includes(equipment));
  }

  hideSpinner();
  renderExercises(exercises);
}

bodyPartFilter.addEventListener('change', () => {
  equipmentFilter.value = '';
  localStorage.setItem('ff-last-bodypart', bodyPartFilter.value);
  localStorage.setItem('ff-last-equipment', '');
  loadExercises();
});

equipmentFilter.addEventListener('change', () => {
  bodyPartFilter.value = '';
  localStorage.setItem('ff-last-equipment', equipmentFilter.value);
  localStorage.setItem('ff-last-bodypart', '');
  loadExercises();
});

// Restore last filters from localStorage
async function init() {
  await loadFilters();

  const savedBodyPart = localStorage.getItem('ff-last-bodypart');
  const savedEquipment = localStorage.getItem('ff-last-equipment');

  if (savedBodyPart) bodyPartFilter.value = savedBodyPart;
  if (savedEquipment) equipmentFilter.value = savedEquipment;

  loadExercises();
}

init();
