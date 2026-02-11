import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerStorefront } from '../hooks/useStorefrontQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, LogIn } from 'lucide-react';
import SupportLinksEditor from '../components/monetize/SupportLinksEditor';
import ProductsManager from '../components/monetize/ProductsManager';

export default function MonetizePage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: storefront, isLoading: storefrontLoading } = useGetCallerStorefront();

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Monetize Your Recipes</CardTitle>
            <CardDescription className="text-base">
              Sign in with Internet Identity to manage your support links and product listings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={login} disabled={isLoggingIn} size="lg" className="gap-2">
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In to Continue
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (storefrontLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monetize Your Recipes</h1>
        <p className="text-muted-foreground">
          Add support links and product listings that will appear on your recipe pages
        </p>
      </div>

      <div className="space-y-8">
        <SupportLinksEditor
          initialLinks={storefront?.supportLinks || []}
        />

        <ProductsManager
          initialProducts={storefront?.products || []}
        />
      </div>
    </div>
  );
}
