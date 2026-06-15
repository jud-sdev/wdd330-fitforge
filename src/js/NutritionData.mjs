const BASE_URL = 'https://world.openfoodfacts.net/cgi/search.pl';

export default class NutritionData {
  async getNutrients(query) {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '10',
      sort_by: 'unique_scans_n',
      cc: 'us',
      fields: 'product_name,nutriments,image_front_small_url,serving_size',
    });

    const res = await fetch(`${BASE_URL}?${params}`);

    if (!res.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const data = await res.json();

    if (!data.products || data.products.length === 0) {
      throw new Error('No results found');
    }

    return data.products
      .filter((p) => p.product_name && /[a-zA-Z]/.test(p.product_name))
      .slice(0, 5)
      .map((p) => ({
        food_name: p.product_name,
        serving_qty: 1,
        serving_unit: p.serving_size || '100g',
        serving_weight_grams: 100,
        nf_calories: p.nutriments?.['energy-kcal_100g'] || 0,
        nf_protein: p.nutriments?.proteins_100g || 0,
        nf_total_carbohydrate: p.nutriments?.carbohydrates_100g || 0,
        nf_total_fat: p.nutriments?.fat_100g || 0,
        photo: {
          thumb: p.image_front_small_url || '',
        },
      }));
  }
}
