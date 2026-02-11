import { useNavigate } from '@tanstack/react-router';
import { useGetRecentRecipes } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import RecipeCard from '../components/recipes/RecipeCard';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import { Button } from '@/components/ui/button';
import { Loader2, ChefHat, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: recentRecipes, isLoading: recipesLoading } = useGetRecentRecipes(true);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />
      
      <div className="recipe-hero">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Discover Delicious Recipes
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Explore a world of culinary delights shared by our community of home cooks and food enthusiasts.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/recipes' })} size="lg">
                Browse All Recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {isAuthenticated && (
                <Button onClick={() => navigate({ to: '/recipe/new' })} size="lg" variant="outline">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Create Recipe
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">New recipes from other users</h2>
          <p className="text-muted-foreground">
            Check out the latest culinary creations from our community
          </p>
        </div>

        {recipesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentRecipes && recentRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.slice(0, 6).map((recipe) => (
                <RecipeCard key={recipe.id.toString()} recipe={recipe} />
              ))}
            </div>
            {recentRecipes.length > 6 && (
              <div className="mt-8 text-center">
                <Button onClick={() => navigate({ to: '/recipes' })} variant="outline" size="lg">
                  View All Recipes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No recipes yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Be the first to share a delicious recipe with the community!
            </p>
            {isAuthenticated && (
              <Button onClick={() => navigate({ to: '/recipe/new' })}>
                <ChefHat className="mr-2 h-4 w-4" />
                Create Your First Recipe
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
