/**
 * RASA Recipes — Listing Page Logic
 * Renders recipe cards dynamically from recipes.json
 */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('recipesGrid');
  const loader = document.getElementById('recipesLoader');

  if (!grid) return;

  try {
    const recipes = await RecipesData.loadAll();
    if (loader) loader.remove();

    recipes.forEach((recipe, index) => {
      const card = buildCard(recipe, index);
      grid.appendChild(card);
    });

    // Trigger GSAP fade-up animations after cards are injected
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      grid.querySelectorAll('.recipe-card').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    } else {
      // Fallback: just show all cards
      grid.querySelectorAll('.recipe-card').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

  } catch (err) {
    if (loader) loader.innerHTML = '<p style="color:var(--text-brown);opacity:0.5;font-size:0.9rem;">Unable to load recipes. Please try again.</p>';
  }
});

/**
 * Build a recipe card element
 */
function buildCard(recipe, index) {
  const link = document.createElement('a');
  link.href = RecipesData.detailURL(recipe.id);
  link.className = `recipe-card ${recipe.gradientClass}`;
  link.setAttribute('aria-label', `View recipe: ${recipe.title}`);

  // Difficulty dots
  const diffDots = recipe.difficulty === 'Easy' ? '●' : '●●';
  const diffLabel = recipe.difficulty;

  link.innerHTML = `
    <div class="recipe-card-image">
      <div class="recipe-card-image-bg"></div>
      <div class="recipe-icon">${recipe.icon}</div>
      <div class="recipe-card-meta">${recipe.cookTime}</div>
    </div>
    <div class="recipe-card-body">
      <div class="recipe-card-tag">${recipe.tag}</div>
      <div class="recipe-card-name">${recipe.title}</div>
      <div class="recipe-card-desc">${recipe.cardDescription}</div>
      <div class="recipe-card-footer">
        <div class="recipe-difficulty">${diffDots} ${diffLabel}</div>
        <span class="btn-small" style="pointer-events:none;">Read More</span>
      </div>
    </div>
  `;

  return link;
}
