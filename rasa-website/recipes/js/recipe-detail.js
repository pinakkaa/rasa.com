/**
 * RASA Recipes — Detail Page Logic
 * ─────────────────────────────────────────────────────────────
 * Reads ?id= from URL → fetches recipes.json → renders the
 * matching recipe dynamically. Layout stays constant; only
 * content changes. One shared HTML page serves all recipes.
 *
 * Flow:
 *  1. Parse ?id= from URL
 *  2. Load recipes.json via RecipesData
 *  3. Render all sections from recipe object
 *  4. Render "More Recipes" strip from remaining records
 *  5. Animate with GSAP ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', async () => {
  const id = RecipesData.getIdFromURL();

  /* No id → redirect to listing */
  if (!id) {
    window.location.href = 'recipes.html';
    return;
  }

  try {
    const [recipe, allRecipes] = await Promise.all([
      RecipesData.loadById(id),
      RecipesData.loadAll()
    ]);

    if (!recipe) {
      showError('Recipe not found.', "The recipe you're looking for doesn't exist or has been removed.");
      return;
    }

    renderPage(recipe, allRecipes);
    document.title = `${recipe.title} — RASA Recipe`;
    animatePage();

  } catch (err) {
    console.error('[RASA] Detail page error:', err);
    showError('Something went wrong.', "We couldn't load this recipe. Please check your connection and try again.");
  }
});

/* ═══════════════════════════════════════════════════════════
   MAIN RENDER ORCHESTRATOR
   ═══════════════════════════════════════════════════════════ */

function renderPage(recipe, allRecipes) {
  hideLoader();
  renderHero(recipe);
  renderBreadcrumb(recipe);
  renderDescription(recipe);
  renderSteps(recipe);
  renderTips(recipe);
  renderPairsWith(recipe);
  renderIngredients(recipe);
  renderQuickInfo(recipe);
  renderBuyBlend(recipe);
  renderMoreRecipes(recipe, allRecipes);
}

/* ═══════════════════════════════════════════════════════════
   SECTION RENDERERS
   ═══════════════════════════════════════════════════════════ */

function renderHero(r) {
  /* Background gradient from recipe data */
  const heroBg = document.getElementById('detailHeroBg');
  if (heroBg) heroBg.style.background = r.gradientStyle;

  /* Floating emoji icon */
  const heroIcon = document.getElementById('detailHeroIcon');
  if (heroIcon) heroIcon.textContent = r.icon;

  /* Tag badge */
  const heroTag = document.getElementById('detailHeroTag');
  if (heroTag) heroTag.textContent = r.tag;

  /* Title — first word plain, rest italic gold */
  const heroTitle = document.getElementById('detailHeroTitle');
  if (heroTitle) {
    const words = r.title.split(' ');
    heroTitle.innerHTML = words.length > 1
      ? `${words[0]} <em>${words.slice(1).join(' ')}</em>`
      : r.title;
  }

  /* Subtitle */
  const heroSubtitle = document.getElementById('detailHeroSubtitle');
  if (heroSubtitle) heroSubtitle.textContent = r.subtitle;

  /* Stats bar */
  setText('statCookTime',   r.cookTime);
  setText('statPrepTime',   r.prepTime);
  setText('statDifficulty', r.difficulty);
  setText('statServings',   `${r.servings} servings`);
  setText('statCalories',   r.calories);
}

function renderBreadcrumb(r) {
  setText('breadcrumbTitle', r.title);
}

function renderDescription(r) {
  setText('detailDescription', r.description);
}

function renderSteps(r) {
  const container = document.getElementById('detailSteps');
  if (!container) return;
  container.innerHTML = '';

  r.steps.forEach(step => {
    const div = document.createElement('div');
    div.className = 'detail-step';
    div.innerHTML = `
      <div class="detail-step-num">${step.step}</div>
      <div class="detail-step-content">
        <div class="detail-step-header">
          <div class="detail-step-title">${step.title}</div>
          ${step.time ? `<span class="detail-step-time">${step.time}</span>` : ''}
        </div>
        <p class="detail-step-desc">${step.description}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderTips(r) {
  const container = document.getElementById('detailTips');
  if (!container) return;
  container.innerHTML = '';

  r.tips.forEach(tip => {
    const div = document.createElement('div');
    div.className = 'detail-tip';
    div.innerHTML = `
      <span class="detail-tip-icon">✦</span>
      <span class="detail-tip-text">${tip}</span>
    `;
    container.appendChild(div);
  });
}

function renderPairsWith(r) {
  const container = document.getElementById('detailPairs');
  if (!container) return;
  container.innerHTML = '';

  r.pairsWith.forEach(item => {
    const span = document.createElement('span');
    span.className = 'pairs-pill';
    span.textContent = item;
    container.appendChild(span);
  });
}

function renderIngredients(r) {
  const container = document.getElementById('detailIngredients');
  if (!container) return;

  /* Store servings metadata on the container for scaler */
  container.dataset.baseServings    = r.servings;
  container.dataset.currentServings = r.servings;

  const servingsVal = document.getElementById('servingsVal');
  if (servingsVal) servingsVal.textContent = `${r.servings} servings`;

  renderIngredientList(r.ingredients, r.servings, r.servings);
}

function renderIngredientList(ingredients, currentServings, baseServings) {
  const container = document.getElementById('detailIngredients');
  if (!container) return;
  container.innerHTML = '';

  const ratio = currentServings / baseServings;

  ingredients.forEach(group => {
    /* Category heading */
    const catEl = document.createElement('div');
    catEl.className = 'ingredient-category';
    catEl.textContent = group.category;
    container.appendChild(catEl);

    /* Items */
    group.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'ingredient-item';
      div.textContent = scaleIngredient(item, ratio);
      container.appendChild(div);
    });
  });
}

/**
 * Naive ingredient scaler — multiplies leading numeric tokens
 * by the ratio. Handles "750g", "2 medium", "1 tsp" etc.
 */
function scaleIngredient(text, ratio) {
  if (ratio === 1) return text;
  return text.replace(/(\d+(\.\d+)?)/g, (match) => {
    const scaled  = parseFloat(match) * ratio;
    const rounded = Math.round(scaled * 4) / 4; // nearest ¼
    return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
  });
}

function renderQuickInfo(r) {
  setText('qiCookTime',  r.cookTime);
  setText('qiPrepTime',  r.prepTime);
  setText('qiTotalTime', r.totalTime);
  setText('qiDifficulty',r.difficulty);
  setText('qiCalories',  r.calories);
  setText('qiBlend',     r.spiceBlend);
}

function renderBuyBlend(r) {
  setText('buyBlendName', r.spiceBlend);
}

/**
 * Renders a horizontal strip of the OTHER recipes
 * (excludes the currently viewed one).
 */
function renderMoreRecipes(current, allRecipes) {
  const grid = document.getElementById('moreRecipesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  allRecipes.forEach(r => {
    const a = document.createElement('a');
    a.href = RecipesData.detailURL(r.id);
    a.className = `more-recipe-card${r.id === current.id ? ' current' : ''}`;
    a.setAttribute('aria-label', `View recipe: ${r.title}`);

    a.innerHTML = `
      <div class="more-recipe-thumb">
        <div class="more-recipe-thumb-bg" style="background-image:url('${r.ImageUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;"></div>
        <span class="more-recipe-thumb-icon">${r.icon}</span>
      </div>
      <div class="more-recipe-info">
        <div class="more-recipe-tag">${r.tag}</div>
        <div class="more-recipe-name">${r.title}</div>
      </div>
    `;
    grid.appendChild(a);
  });
}

/* ═══════════════════════════════════════════════════════════
   SERVINGS SCALER (exposed globally for inline onclick)
   ═══════════════════════════════════════════════════════════ */

async function changeServings(delta) {
  const servingsVal = document.getElementById('servingsVal');
  const container   = document.getElementById('detailIngredients');
  if (!servingsVal || !container) return;

  const base    = parseInt(container.dataset.baseServings, 10);
  let current   = parseInt(container.dataset.currentServings, 10);

  current = Math.max(1, Math.min(20, current + delta));
  container.dataset.currentServings = current;
  servingsVal.textContent = `${current} serving${current !== 1 ? 's' : ''}`;

  const recipe = await RecipesData.loadById(RecipesData.getIdFromURL());
  if (recipe) renderIngredientList(recipe.ingredients, current, base);
}

window.changeServings = changeServings;

/* ═══════════════════════════════════════════════════════════
   GSAP ANIMATIONS
   ═══════════════════════════════════════════════════════════ */

function animatePage() {
  if (typeof gsap === 'undefined') {
    /* Fallback — reveal everything without animation */
    document.querySelectorAll('.fade-up').forEach(el => {
      el.style.opacity    = '1';
      el.style.transform  = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Hero content entrance */
  const heroContent = document.querySelector('.detail-hero-content');
  if (heroContent) {
    gsap.fromTo(heroContent,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }

  /* Hero icon float */
  const heroIcon = document.querySelector('.detail-hero-icon');
  if (heroIcon) {
    gsap.fromTo(heroIcon,
      { opacity: 0, scale: 0.6 },
      { opacity: 0.15, scale: 1, duration: 1.2, ease: 'back.out(1.4)', delay: 0.1 }
    );
  }

  /* Scroll-triggered fade-ups */
  document.querySelectorAll('.fade-up').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 36 },
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

  /* Step-by-step stagger left-slide */
  const steps = document.querySelectorAll('.detail-step');
  if (steps.length) {
    gsap.fromTo(steps,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '#detailSteps',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  /* More recipes cards stagger */
  const moreCards = document.querySelectorAll('.more-recipe-card');
  if (moreCards.length) {
    gsap.fromTo(moreCards,
      { opacity: 0, y: 24 },
      {
        opacity: (i, el) => el.classList.contains('current') ? 0.55 : 1,
        y: 0, duration: 0.55, ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.more-recipes-grid',
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   LOADING / ERROR HELPERS
   ═══════════════════════════════════════════════════════════ */

function hideLoader() {
  const loader = document.getElementById('detailLoader');
  if (loader) loader.remove();

  const content = document.getElementById('detailContent');
  if (content) content.style.display = '';
}

function showError(title, message) {
  const loader = document.getElementById('detailLoader');
  if (loader) loader.remove();

  const errorEl = document.getElementById('detailError');
  if (!errorEl) return;
  errorEl.querySelector('h2').textContent = title;
  errorEl.querySelector('p').textContent  = message;
  errorEl.style.display = '';
}

/* ═══════════════════════════════════════════════════════════
   UTILITY
   ═══════════════════════════════════════════════════════════ */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
