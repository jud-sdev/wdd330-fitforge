const BASE_URL = 'https://wger.de/api/v2';

export default class ExerciseData {
  constructor() {
    this.muscleMap = {};
    this.equipmentMap = {};
    this.categoryMap = {};
    this.loaded = false;
  }

  async loadMaps() {
    if (this.loaded) return;

    const [muscles, equipment, categories] = await Promise.all([
      fetch(`${BASE_URL}/muscle/?format=json`).then((r) => r.json()),
      fetch(`${BASE_URL}/equipment/?format=json`).then((r) => r.json()),
      fetch(`${BASE_URL}/exercisecategory/?format=json`).then((r) => r.json()),
    ]);

    muscles.results.forEach((m) => {
      this.muscleMap[m.id] = m.name_en || m.name;
    });
    equipment.results.forEach((e) => {
      this.equipmentMap[e.id] = e.name;
    });
    categories.results.forEach((c) => {
      this.categoryMap[c.id] = c.name;
    });

    this.loaded = true;
  }

  formatExercise(ex) {
    const name =
      ex.translations?.find((t) => t.language === 2)?.name || `Exercise #${ex.id}`;
    const muscles = (ex.muscles || []).map(
      (m) => (typeof m === 'object' ? m.name_en || m.name : this.muscleMap[m]) || 'Unknown'
    );
    const equip = (ex.equipment || []).map(
      (e) => (typeof e === 'object' ? e.name : this.equipmentMap[e]) || 'Unknown'
    );
    const category =
      typeof ex.category === 'object' ? ex.category.name : this.categoryMap[ex.category] || 'General';
    const image = ex.images?.[0]?.image || null;

    return {
      exerciseId: String(ex.id),
      name,
      targetMuscles: muscles.length > 0 ? muscles : [category],
      equipments: equip.length > 0 ? equip : ['Bodyweight'],
      category,
      gifUrl: image,
    };
  }

  async getBodyPartList() {
    const res = await fetch(`${BASE_URL}/exercisecategory/?format=json`);
    const data = await res.json();
    return data.results.map((c) => c.name);
  }

  async getEquipmentList() {
    const res = await fetch(`${BASE_URL}/equipment/?format=json`);
    const data = await res.json();
    return data.results.map((e) => e.name);
  }

  async getExercisesByBodyPart(bodyPart) {
    await this.loadMaps();
    const categoryId = Object.keys(this.categoryMap).find(
      (id) => this.categoryMap[id] === bodyPart
    );
    if (!categoryId) return [];

    const res = await fetch(
      `${BASE_URL}/exerciseinfo/?format=json&language=2&limit=50&category=${categoryId}`
    );
    const data = await res.json();
    return data.results.map((ex) => this.formatExercise(ex)).filter((ex) => ex.name !== `Exercise #${ex.exerciseId}`);
  }

  async getExercisesByEquipment(equipment) {
    await this.loadMaps();
    const equipId = Object.keys(this.equipmentMap).find(
      (id) => this.equipmentMap[id] === equipment
    );
    if (!equipId) return [];

    const res = await fetch(
      `${BASE_URL}/exerciseinfo/?format=json&language=2&limit=50&equipment=${equipId}`
    );
    const data = await res.json();
    return data.results.map((ex) => this.formatExercise(ex)).filter((ex) => ex.name !== `Exercise #${ex.exerciseId}`);
  }

  async getAllExercises() {
    await this.loadMaps();
    const res = await fetch(
      `${BASE_URL}/exerciseinfo/?format=json&language=2&limit=50&offset=0`
    );
    const data = await res.json();
    return data.results.map((ex) => this.formatExercise(ex)).filter((ex) => ex.name !== `Exercise #${ex.exerciseId}`);
  }
}
