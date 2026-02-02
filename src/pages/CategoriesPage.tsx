import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FolderOpen, Search } from "lucide-react";
import { mockCategories, Category } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      equipmentCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCategories([...categories, newCategory]);
    setFormData({ name: "", description: "" });
    setIsAddOpen(false);
    toast({ title: "Success", description: "Category added successfully" });
  };

  const handleEdit = () => {
    if (!editingCategory || !formData.name.trim()) return;

    setCategories(categories.map((cat) =>
      cat.id === editingCategory.id
        ? { ...cat, name: formData.name, description: formData.description }
        : cat
    ));
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    toast({ title: "Success", description: "Category updated successfully" });
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
    toast({ title: "Deleted", description: "Category removed successfully" });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  return (
    <AdminLayout title="Categories" subtitle="Manage your equipment categories">
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            All Categories ({filteredCategories.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>Create a new equipment category</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter category name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAdd} className="gradient-primary">Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Equipment Count</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {category.equipmentCount} items
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => !open && setEditingCategory(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>Update category details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Category Name</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                            <Button onClick={handleEdit} className="gradient-primary">Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
