import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useGetRecipe, useHasUserLikedRecipe, useGetUserProfile } from '../hooks/useQueries';
import { useDeleteRecipe, useLikeRecipe, useUnlikeRecipe, useAddComment } from '../hooks/useRecipeMutations';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserStorefront } from '../hooks/useStorefrontQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Edit, Trash2, Clock, Heart, MessageCircle } from 'lucide-react';
import AuthorMonetizationSection from '../components/monetize/AuthorMonetizationSection';

export default function RecipeDetailPage() {
  const { recipeId } = useParams({ from: '/recipe/$recipeId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: recipe, isLoading } = useGetRecipe(BigInt(recipeId));
  const deleteRecipe = useDeleteRecipe();
  const likeRecipe = useLikeRecipe();
  const unlikeRecipe = useUnlikeRecipe();
  const addComment = useAddComment();

  const { data: hasLiked, isLoading: likeStatusLoading } = useHasUserLikedRecipe(BigInt(recipeId));

  const { data: authorStorefront, isLoading: storefrontLoading } = useGetUserStorefront(
    recipe?.owner
  );

  const [commentText, setCommentText] = useState('');

  const isOwner = recipe && identity && recipe.owner.toString() === identity.getPrincipal().toString();

  const handleDelete = async () => {
    if (recipe) {
      await deleteRecipe.mutateAsync(recipe.id);
      navigate({ to: '/recipes' });
    }
  };

  const handleEdit = () => {
    navigate({ to: '/recipe/$recipeId/edit', params: { recipeId } });
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated || !recipe) return;
    
    try {
      if (hasLiked) {
        await unlikeRecipe.mutateAsync(recipe.id);
      } else {
        await likeRecipe.mutateAsync(recipe.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !recipe || !commentText.trim()) return;

    try {
      await addComment.mutateAsync({
        recipeId: recipe.id,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Recipe not found</h2>
        <p className="text-muted-foreground mb-6">
          The recipe you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate({ to: '/recipes' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
      </div>
    );
  }

  const hasMonetization = authorStorefront && (
    authorStorefront.supportLinks.length > 0 || 
    authorStorefront.products.length > 0
  );

  const likeCount = recipe.likes.length;
  const isLiking = likeRecipe.isPending || unlikeRecipe.isPending;

  return (
    <div className="container py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/recipes' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Recipes
      </Button>

      <div className="space-y-6">
        {recipe.photo && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={recipe.photo.getDirectURL()}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{recipe.title}</h1>
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          </div>
          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this recipe? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {recipe.ingredients.length} ingredients
          </Badge>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.steps.length} steps</span>
          </div>
          <Button
            variant={hasLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLikeToggle}
            disabled={!isAuthenticated || isLiking || likeStatusLoading}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-muted-foreground">— {ingredient.amount}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <p className="flex-1 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({recipe.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recipe.comments.length > 0 && (
              <div className="space-y-4">
                {recipe.comments.map((comment, index) => (
                  <CommentItem key={index} comment={comment} />
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  disabled={addComment.isPending}
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim() || addComment.isPending}
                  size="sm"
                >
                  {addComment.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Please log in to add a comment
              </div>
            )}
          </CardContent>
        </Card>

        {hasMonetization && !storefrontLoading && (
          <AuthorMonetizationSection storefront={authorStorefront} />
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: { author: any; content: string; timestamp: bigint } }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);
  const authorName = authorProfile?.name || 'Anonymous';
  const initials = authorName.slice(0, 2).toUpperCase();

  const date = new Date(Number(comment.timestamp) / 1000000);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{authorName}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
