import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { useSaveStorefront } from '../../hooks/useStorefrontMutations';
import { useGetCallerStorefront } from '../../hooks/useStorefrontQueries';
import type { Product } from '../../backend';
import { toast } from 'sonner';

interface ProductsManagerProps {
  initialProducts: Product[];
}

export default function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Product>({
    title: '',
    description: '',
    priceDisplay: '',
    checkoutUrl: '',
  });

  const { data: storefront } = useGetCallerStorefront();
  const saveStorefront = useSaveStorefront();

  const handleAddNew = () => {
    setEditingIndex(-1);
    setFormData({ title: '', description: '', priceDisplay: '', checkoutUrl: '' });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(products[index]);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({ title: '', description: '', priceDisplay: '', checkoutUrl: '' });
  };

  const handleSave = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.priceDisplay.trim() ||
      !formData.checkoutUrl.trim()
    ) {
      toast.error('All product fields are required');
      return;
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.checkoutUrl)) {
      toast.error('Please enter a valid checkout URL starting with http:// or https://');
      return;
    }

    let updatedProducts: Product[];
    if (editingIndex === -1) {
      updatedProducts = [...products, formData];
    } else if (editingIndex !== null) {
      updatedProducts = products.map((product, i) => (i === editingIndex ? formData : product));
    } else {
      return;
    }

    try {
      await saveStorefront.mutateAsync({
        supportLinks: storefront?.supportLinks || [],
        products: updatedProducts,
      });
      setProducts(updatedProducts);
      setEditingIndex(null);
      setFormData({ title: '', description: '', priceDisplay: '', checkoutUrl: '' });
      toast.success('Products updated successfully');
    } catch (error) {
      toast.error('Failed to save products');
    }
  };

  const handleDelete = async (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    try {
      await saveStorefront.mutateAsync({
        supportLinks: storefront?.supportLinks || [],
        products: updatedProducts,
      });
      setProducts(updatedProducts);
      toast.success('Product removed');
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Add products or services you offer (e.g., cookbooks, courses, premium recipes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 && editingIndex === null && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No products added yet
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 border rounded-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary shrink-0" />
                  <h4 className="font-semibold">{product.title}</h4>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    disabled={editingIndex !== null}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    disabled={saveStorefront.isPending || editingIndex !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold text-primary">{product.priceDisplay}</span>
                <a
                  href={product.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View checkout →
                </a>
              </div>
            </div>
          ))}
        </div>

        {editingIndex !== null && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Premium Recipe Collection"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceDisplay">Price Display *</Label>
              <Input
                id="priceDisplay"
                placeholder="e.g., $19.99 or Free"
                value={formData.priceDisplay}
                onChange={(e) =>
                  setFormData({ ...formData, priceDisplay: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkoutUrl">Checkout URL *</Label>
              <Input
                id="checkoutUrl"
                type="url"
                placeholder="https://..."
                value={formData.checkoutUrl}
                onChange={(e) =>
                  setFormData({ ...formData, checkoutUrl: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saveStorefront.isPending}
                className="gap-2"
              >
                {saveStorefront.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saveStorefront.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {editingIndex === null && (
          <Button onClick={handleAddNew} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
