import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useGetRecipe } from '../hooks/useQueries';
import { useCreateRecipe, useUpdateRecipe } from '../hooks/useRecipeMutations';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RecipeForm from '../components/recipes/RecipeForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { ExternalBlob } from '../backend';

export default function RecipeEditorPage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const recipeId = params.recipeId ? BigInt(params.recipeId) : undefined;
  const isEditMode = !!recipeId;

  const { data: recipe, isLoading: recipeLoading } = useGetRecipe(recipeId);
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const isOwner =
    !isEditMode || (recipe && identity && recipe.owner.toString() === identity.getPrincipal().toString());

  useEffect(() => {
    if (isEditMode && recipe && !isOwner) {
      navigate({ to: '/recipes' });
    }
  }, [isEditMode, recipe, isOwner, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to create or edit recipes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate({ to: '/recipes' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditMode && recipeLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEditMode && !recipe) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Recipe not found</h2>
        <Button onClick={() => navigate({ to: '/recipes' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: {
    title: string;
    description: string;
    ingredients: Array<{ name: string; amount: string }>;
    steps: string[];
    photo?: File | null;
  }) => {
    let photoBlob: ExternalBlob | null = null;

    if (data.photo) {
      const arrayBuffer = await data.photo.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      photoBlob = ExternalBlob.fromBytes(uint8Array);
    }

    if (isEditMode && recipe) {
      await updateRecipe.mutateAsync({
        recipeId: recipe.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        steps: data.steps,
        photo: photoBlob || (recipe.photo ? recipe.photo : null),
      });
      navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id.toString() } });
    } else {
      const newRecipeId = await createRecipe.mutateAsync({
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        steps: data.steps,
        photo: photoBlob,
      });
      navigate({ to: '/recipe/$recipeId', params: { recipeId: newRecipeId.toString() } });
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: isEditMode && recipe ? `/recipe/${recipe.id}` : '/recipes' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Recipe' : 'Create New Recipe'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update your recipe details below.'
              : 'Share your culinary creation with the community.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm
            initialData={
              recipe
                ? {
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps,
                    photo: recipe.photo,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={createRecipe.isPending || updateRecipe.isPending}
            submitLabel={isEditMode ? 'Update Recipe' : 'Create Recipe'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
