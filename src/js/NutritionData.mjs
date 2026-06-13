const APP_ID = '0e9e36a6';
const APP_KEY = '53e21e3528c873a47e834e0c12f8484a';

export default class NutritionData {
  async getNutrients(query) {
    const res = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': APP_ID,
        'x-app-key': APP_KEY,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const data = await res.json();
    return data.foods;
  }
}
