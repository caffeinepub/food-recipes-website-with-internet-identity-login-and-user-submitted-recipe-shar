import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useSaveStorefront } from '../../hooks/useStorefrontMutations';
import { useGetCallerStorefront } from '../../hooks/useStorefrontQueries';
import type { ExternalSupportLink } from '../../backend';
import { toast } from 'sonner';

interface SupportLinksEditorProps {
  initialLinks: ExternalSupportLink[];
}

export default function SupportLinksEditor({ initialLinks }: SupportLinksEditorProps) {
  const [links, setLinks] = useState<ExternalSupportLink[]>(initialLinks);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExternalSupportLink>({
    displayName: '',
    url: '',
    description: '',
  });

  const { data: storefront } = useGetCallerStorefront();
  const saveStorefront = useSaveStorefront();

  const handleAddNew = () => {
    setEditingIndex(-1);
    setFormData({ displayName: '', url: '', description: '' });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(links[index]);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({ displayName: '', url: '', description: '' });
  };

  const handleSave = async () => {
    if (!formData.displayName.trim() || !formData.url.trim()) {
      toast.error('Display name and URL are required');
      return;
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.url)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    let updatedLinks: ExternalSupportLink[];
    if (editingIndex === -1) {
      updatedLinks = [...links, formData];
    } else if (editingIndex !== null) {
      updatedLinks = links.map((link, i) => (i === editingIndex ? formData : link));
    } else {
      return;
    }

    try {
      await saveStorefront.mutateAsync({
        supportLinks: updatedLinks,
        products: storefront?.products || [],
      });
      setLinks(updatedLinks);
      setEditingIndex(null);
      setFormData({ displayName: '', url: '', description: '' });
      toast.success('Support links updated successfully');
    } catch (error) {
      toast.error('Failed to save support links');
    }
  };

  const handleDelete = async (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    try {
      await saveStorefront.mutateAsync({
        supportLinks: updatedLinks,
        products: storefront?.products || [],
      });
      setLinks(updatedLinks);
      toast.success('Support link removed');
    } catch (error) {
      toast.error('Failed to remove support link');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Links</CardTitle>
        <CardDescription>
          Add links where supporters can help you (e.g., Buy Me a Coffee, Patreon, Ko-fi)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 && editingIndex === null && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No support links added yet
          </p>
        )}

        {links.map((link, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-4 p-4 border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{link.displayName}</h4>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {link.url}
              </a>
              {link.description && (
                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(index)}
                disabled={editingIndex !== null}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(index)}
                disabled={saveStorefront.isPending || editingIndex !== null}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {editingIndex !== null && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="e.g., Buy Me a Coffee"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a short description..."
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
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
            Add Support Link
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
