import { useState, useEffect } from 'react';
import type { Ingredient } from '../../backend';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  photo?: any;
}

interface RecipeFormProps {
  initialData?: RecipeFormData;
  onSubmit: (data: RecipeFormData & { photo?: File | null }) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function RecipeForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients || [{ name: '', amount: '' }]
  );
  const [steps, setSteps] = useState<string[]>(initialData?.steps || ['']);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<any>(initialData?.photo || null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setIngredients(initialData.ingredients.length > 0 ? initialData.ingredients : [{ name: '', amount: '' }]);
      setSteps(initialData.steps.length > 0 ? initialData.steps : ['']);
      setExistingPhoto(initialData.photo || null);
    }
  }, [initialData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      setExistingPhoto(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingPhoto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.amount.trim());
    const validSteps = steps.filter((step) => step.trim());

    if (title.trim() && description.trim() && validIngredients.length > 0 && validSteps.length > 0) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        ingredients: validIngredients,
        steps: validSteps,
        photo: photoFile,
      });
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const displayPhoto = photoPreview || (existingPhoto ? existingPhoto.getDirectURL() : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Recipe Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Classic Chocolate Chip Cookies"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your recipe..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Recipe Photo</Label>
        {displayPhoto ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={displayPhoto}
              alt="Recipe preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <Label
              htmlFor="photo-upload"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
              <br />
              PNG, JPG, GIF up to 5MB
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Ingredients</Label>
          <Button type="button" onClick={addIngredient} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Ingredient
          </Button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      required
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button type="button" onClick={addStep} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <Textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    required
                  />
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeStep(index)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
