/**
 * RASA Recipes — Data Loader
 * Fetches recipes.json and provides helper utilities.
 * Used by both recipes.html and recipe-details.html
 */

const RecipesData = (() => {

  let _cache = null; // in-memory cache after first fetch

  /**
   * Load all recipes from recipes.json
   * Returns a Promise<Array>
   */
  async function loadAll() {
    if (_cache) return _cache;
    try {
      const res = await fetch('./recipes.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _cache = await res.json();
      return _cache;
    } catch (err) {
      console.error('[RASA] Failed to load recipes.json:', err);
      throw err;
    }
  }

  /**
   * Load a single recipe by numeric id
   * Returns a Promise<Object|null>
   */
  async function loadById(id) {
    const all = await loadAll();
    return all.find(r => r.id === Number(id)) || null;
  }

  /**
   * Read the ?id= query param from the current URL
   */
  function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /**
   * Build a recipe detail URL from an id
   */
  function detailURL(id) {
    return `recipe-details.html?id=${id}`;
  }

  return { loadAll, loadById, getIdFromURL, detailURL };
})();
