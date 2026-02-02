import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Wrench, Search, DollarSign } from "lucide-react";
import { mockEquipment, mockCategories, Equipment } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    modelNumber: "",
    categoryId: "",
    pricePerDay: "",
    description: "",
    image: "",
    status: "available" as Equipment["status"],
  });
  const { toast } = useToast();

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.modelNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || eq.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      modelNumber: "",
      categoryId: "",
      pricePerDay: "",
      description: "",
      image: "",
      status: "available",
    });
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.categoryId || !formData.pricePerDay) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const category = mockCategories.find((c) => c.id === formData.categoryId);
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      name: formData.name,
      modelNumber: formData.modelNumber,
      categoryId: formData.categoryId,
      categoryName: category?.name || "",
      pricePerDay: parseFloat(formData.pricePerDay),
      description: formData.description,
      image: formData.image || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400",
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setEquipment([...equipment, newEquipment]);
    resetForm();
    setIsAddOpen(false);
    toast({ title: "Success", description: "Equipment added successfully" });
  };

  const handleEdit = () => {
    if (!editingEquipment) return;

    const category = mockCategories.find((c) => c.id === formData.categoryId);
    setEquipment(equipment.map((eq) =>
      eq.id === editingEquipment.id
        ? {
            ...eq,
            name: formData.name,
            modelNumber: formData.modelNumber,
            categoryId: formData.categoryId,
            categoryName: category?.name || eq.categoryName,
            pricePerDay: parseFloat(formData.pricePerDay),
            description: formData.description,
            image: formData.image,
            status: formData.status,
          }
        : eq
    ));
    setEditingEquipment(null);
    resetForm();
    toast({ title: "Success", description: "Equipment updated successfully" });
  };

  const handleDelete = (id: string) => {
    setEquipment(equipment.filter((eq) => eq.id !== id));
    toast({ title: "Deleted", description: "Equipment removed successfully" });
  };

  const openEditDialog = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      modelNumber: eq.modelNumber,
      categoryId: eq.categoryId,
      pricePerDay: eq.pricePerDay.toString(),
      description: eq.description,
      image: eq.image,
      status: eq.status,
    });
  };

  const getStatusBadge = (status: Equipment["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success/10 text-success border-0">Available</Badge>;
      case "booked":
        return <Badge className="bg-warning/10 text-warning border-0">Booked</Badge>;
      case "maintenance":
        return <Badge className="bg-destructive/10 text-destructive border-0">Maintenance</Badge>;
    }
  };

  const EquipmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label>Equipment Name *</Label>
        <Input
          placeholder="Enter equipment name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Model Number</Label>
        <Input
          placeholder="Enter model number"
          value={formData.modelNumber}
          onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {mockCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Price per Day ($) *</Label>
        <Input
          type="number"
          placeholder="Enter price"
          value={formData.pricePerDay}
          onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(val: Equipment["status"]) => setFormData({ ...formData, status: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          placeholder="Enter image URL"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <AdminLayout title="Equipment" subtitle="Manage your rental equipment inventory">
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            All Equipment ({filteredEquipment.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>Add a new equipment to your inventory</DialogDescription>
                </DialogHeader>
                <EquipmentForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAdd} className="gradient-primary">Add Equipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((eq) => (
              <Card key={eq.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={eq.image}
                    alt={eq.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(eq.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{eq.name}</h3>
                      <p className="text-sm text-muted-foreground">{eq.modelNumber}</p>
                    </div>
                    <Badge variant="outline">{eq.categoryName}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{eq.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-bold text-lg">
                      <DollarSign className="w-5 h-5" />
                      {eq.pricePerDay}/day
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingEquipment?.id === eq.id} onOpenChange={(open) => !open && setEditingEquipment(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(eq)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Equipment</DialogTitle>
                            <DialogDescription>Update equipment details</DialogDescription>
                          </DialogHeader>
                          <EquipmentForm isEdit />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingEquipment(null)}>Cancel</Button>
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
                            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{eq.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(eq.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No equipment found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
