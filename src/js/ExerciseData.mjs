const BASE_URL = 'https://exercisedb-api.vercel.app/api/v1';

export default class ExerciseData {
  async getBodyPartList() {
    const res = await fetch(`${BASE_URL}/bodyparts`);
    const data = await res.json();
    return data.data;
  }

  async getEquipmentList() {
    const res = await fetch(`${BASE_URL}/equipments`);
    const data = await res.json();
    return data.data;
  }

  async getExercisesByBodyPart(bodyPart) {
    const res = await fetch(`${BASE_URL}/exercises?limit=20&offset=0`);
    const data = await res.json();
    return data.data.exercises.filter(
      (ex) => ex.bodyParts.includes(bodyPart)
    );
  }

  async getExercisesByEquipment(equipment) {
    const res = await fetch(`${BASE_URL}/exercises?limit=20&offset=0`);
    const data = await res.json();
    return data.data.exercises.filter(
      (ex) => ex.equipments.includes(equipment)
    );
  }

  async getAllExercises() {
    const res = await fetch(`${BASE_URL}/exercises?limit=20&offset=0`);
    const data = await res.json();
    return data.data.exercises;
  }
}
