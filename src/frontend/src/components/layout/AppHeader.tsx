import { useNavigate } from '@tanstack/react-router';
import { ChefHat, Plus, DollarSign } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/recipe-logo.dim_512x512.png"
              alt="Recipe Book"
              className="h-10 w-10"
            />
            <span className="font-display text-xl font-semibold text-foreground">
              Recipe Book
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate({ to: '/recipes' })}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Recipes
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate({ to: '/monetize' })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Monetize
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button
                onClick={() => navigate({ to: '/monetize' })}
                size="sm"
                variant="outline"
                className="gap-2 hidden sm:flex"
              >
                <DollarSign className="h-4 w-4" />
                <span>Monetize</span>
              </Button>
              <Button
                onClick={() => navigate({ to: '/recipe/new' })}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Recipe</span>
              </Button>
            </>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
