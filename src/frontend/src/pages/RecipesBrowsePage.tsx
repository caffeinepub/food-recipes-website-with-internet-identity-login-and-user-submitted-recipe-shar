import { useGetAllRecipes } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import RecipeCard from '../components/recipes/RecipeCard';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import { Loader2, ChefHat } from 'lucide-react';

export default function RecipesBrowsePage() {
  const { data: recipes, isLoading: recipesLoading } = useGetAllRecipes();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

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
            <p className="text-lg text-muted-foreground">
              Explore a world of culinary delights shared by our community of home cooks and food enthusiasts.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {recipesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id.toString()} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No recipes yet</h2>
            <p className="text-muted-foreground max-w-md">
              Be the first to share a delicious recipe with the community!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
