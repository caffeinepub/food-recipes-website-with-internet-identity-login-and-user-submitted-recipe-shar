import { useNavigate } from '@tanstack/react-router';
import type { Recipe } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/recipe/$recipeId', params: { recipeId: recipe.id.toString() } });
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-soft transition-all duration-200 hover:scale-[1.02] overflow-hidden"
      onClick={handleClick}
    >
      {recipe.photo && (
        <div className="w-full aspect-video bg-muted">
          <img
            src={recipe.photo.getDirectURL()}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{recipe.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {recipe.ingredients.length} items
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.steps.length} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{recipe.likes.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
