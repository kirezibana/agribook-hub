import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, UploadIcon } from 'lucide-react';
import { createEquipment } from '@/services/equipmentService';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number | string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreated?: () => void;
}

export default function AddEquipmentModal({ open, onOpenChange, categories, onCreated }: Props) {
  const [form, setForm] = useState({
    name: '',
    modelNumber: '',
    category_id: '',
    hourly_rate: '',
    daily_rate: '',
    description: '',
    status: 'available',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      // reset when closed
      setForm({ name: '', modelNumber: '', category_id: '', hourly_rate: '', daily_rate: '', description: '', status: 'available' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setSaving(false);
    }
  }, [open]);

  const handleChange = (key: string, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast({ title: 'Error', description: 'Please select an image file (JPEG, PNG, etc.)', variant: 'destructive' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size exceeds 5MB limit', variant: 'destructive' });
        return;
      }

      setSelectedFile(file);

      // Create a preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (window.URL && previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim() || !form.category_id || !form.daily_rate || !form.modelNumber?.trim()) {
      toast({ title: 'Error', description: 'Please fill required fields (Name, Model #, Category, Daily Rate)', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);

      // Call the createEquipment function with the file
      const equipmentData = {
        name: form.name.trim(),
        modelNumber: form.modelNumber?.trim() || '',
        category_id: typeof form.category_id === 'string' ? parseInt(form.category_id) : form.category_id,
        hourly_rate: parseFloat(form.hourly_rate || '0'),
        daily_rate: parseFloat(form.daily_rate),
        description: form.description,
        status: form.status as any,
      };

      const res = await createEquipment(equipmentData, selectedFile || undefined);

      if (res.status === 'success') {
        toast({ title: 'Success', description: 'Equipment added' });
        onOpenChange(false);
        onCreated && onCreated();
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to add equipment', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to add equipment', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-primary" onClick={() => onOpenChange(true)}>Add Equipment</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} onKeyDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>Add a new equipment to your inventory</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Equipment Name *</Label>
              <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>

            <div className="space-y-2">
              <Label>Model Number *</Label>
              <Input value={form.modelNumber} onChange={(e) => handleChange('modelNumber', e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                <SelectTrigger onKeyDown={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hourly Rate ($)</Label>
              <Input type="number" value={form.hourly_rate} onChange={(e) => handleChange('hourly_rate', e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>

            <div className="space-y-2">
              <Label>Daily Rate ($) *</Label>
              <Input required type="number" value={form.daily_rate} onChange={(e) => handleChange('daily_rate', e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger onKeyDown={(e) => e.stopPropagation()}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Equipment Image</Label>
              <div className="flex flex-col gap-4">
                {/* File upload section */}
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="equipment-image-upload"
                    />
                    <label htmlFor="equipment-image-upload" className="cursor-pointer">
                      <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </div>

                  {/* Preview if file is selected */}
                  {previewUrl && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Selected file:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSelectedFile}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="gradient-primary" type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Equipment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
