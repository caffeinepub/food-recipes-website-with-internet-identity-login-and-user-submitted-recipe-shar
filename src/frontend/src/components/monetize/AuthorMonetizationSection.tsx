import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Heart, Package } from 'lucide-react';
import type { Storefront } from '../../backend';

interface AuthorMonetizationSectionProps {
  storefront: Storefront;
}

export default function AuthorMonetizationSection({ storefront }: AuthorMonetizationSectionProps) {
  const hasSupportLinks = storefront.supportLinks.length > 0;
  const hasProducts = storefront.products.length > 0;

  if (!hasSupportLinks && !hasProducts) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Support the Author
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasSupportLinks && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Support Links
            </h4>
            <div className="flex flex-wrap gap-2">
              {storefront.supportLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.description || link.displayName}
                  >
                    {link.displayName}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {hasProducts && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Products & Services
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {storefront.products.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 border rounded-lg bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Package className="h-4 w-4 text-primary shrink-0" />
                      <h5 className="font-semibold text-sm truncate">{product.title}</h5>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {product.priceDisplay}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    asChild
                    className="w-full gap-2 mt-1"
                  >
                    <a
                      href={product.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
