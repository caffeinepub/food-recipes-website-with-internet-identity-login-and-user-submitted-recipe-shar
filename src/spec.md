# Specification

## Summary
**Goal:** Add a Home landing page with a recent recipes feed, plus comments, likes, and support for attaching and displaying recipe photos.

**Planned changes:**
- Add a dedicated Home page at `/` with an English-labeled “recent/new recipes” section and navigation to the full recipe browse/listing page.
- Implement a backend + frontend “recent recipes” feed ordered by newest first, with an option to exclude the signed-in user’s own recipes when authenticated.
- Add recipe comments: show comments to all visitors on recipe detail pages; allow signed-in users to add comments without a full page refresh.
- Add recipe likes: show like count and a like/unlike toggle for signed-in users; prevent multiple likes per user per recipe; ensure signed-out users cannot like.
- Add recipe photo uploads for recipe authors during create/edit, store images in the canister with size/type limits, and display photos on recipe detail and as thumbnails/previews in listings.

**User-visible outcome:** Users land on a Home page showing the newest recipes, can browse all recipes, view and post comments (when signed in), like/unlike recipes (when signed in), and authors can upload and display food photos for their recipes.
