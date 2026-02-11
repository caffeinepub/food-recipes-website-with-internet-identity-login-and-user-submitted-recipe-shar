import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import RecipesBrowsePage from './pages/RecipesBrowsePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipeEditorPage from './pages/RecipeEditorPage';
import MonetizePage from './pages/MonetizePage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipes',
  component: RecipesBrowsePage,
});

const recipeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipe/$recipeId',
  component: RecipeDetailPage,
});

const newRecipeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipe/new',
  component: RecipeEditorPage,
});

const editRecipeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipe/$recipeId/edit',
  component: RecipeEditorPage,
});

const monetizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monetize',
  component: MonetizePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  recipesRoute,
  recipeDetailRoute,
  newRecipeRoute,
  editRecipeRoute,
  monetizeRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
