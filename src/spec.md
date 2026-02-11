# Specification

## Summary
**Goal:** Build a food recipes website where anyone can browse published recipes, and authenticated users (via Internet Identity) can create, edit, and delete their own recipes with persistent canister storage and a cohesive food-themed UI.

**Planned changes:**
- Add Internet Identity authentication (sign in/out) and reflect auth state in the UI (including showing the user identifier or a clear signed-in indicator).
- Implement public recipe browsing: a home/list view of published recipes and a recipe detail page (title, description, ingredients, steps) with an English empty state when no recipes exist.
- Add authenticated recipe publishing: a “New Recipe” form to create/publish recipes; allow only owners to edit/delete their recipes, enforced in both UI and backend.
- Persist recipes in the Motoko canister using stable storage patterns so recipes survive refreshes and upgrades.
- Apply a consistent food/recipe visual theme (English UI text; avoid blue/purple-dominant primary colors).
- Add and render generated static image assets from `frontend/public/assets/generated` (logo in header; hero/banner on home page).

**User-visible outcome:** Visitors can browse and view recipe details without logging in; users can sign in with Internet Identity to publish recipes and manage (edit/delete) only their own recipes; recipes persist across refresh and upgrades, and the site shows a cohesive food-themed design with a header logo and home hero banner.
