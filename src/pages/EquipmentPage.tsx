import { useState, useEffect } from "react";
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
import AddEquipmentModal from "@/components/dialogs/AddEquipmentModal";
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
import { Plus, Pencil, Trash2, Wrench, Search, DollarSign, AlertCircle } from "lucide-react";
import { Equipment } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from "@/services/equipmentService";
import { getCategories } from "@/services/categoriesService";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    hourly_rate: "",
    daily_rate: "",
    description: "",
    status: "available" as Equipment["status"],
  });
  const { toast } = useToast();

  // Load equipment and categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [equipmentData, categoriesData] = await Promise.all([
        getEquipment(),
        getCategories(),
      ]);
      
      setEquipment(equipmentData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load equipment');
      console.error(err);
      toast({ title: "Error", description: "Failed to load equipment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      hourly_rate: "",
      daily_rate: "",
      description: "",
      status: "available",
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.category_id || !formData.daily_rate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      setSaveLoading(true);
      await createEquipment({
        name: formData.name,
        category_id: parseInt(formData.category_id),
        hourly_rate: parseFloat(formData.hourly_rate || "0"),
        daily_rate: parseFloat(formData.daily_rate),
        description: formData.description,
        status: formData.status,
      });

      resetForm();
      setIsAddOpen(false);
      await fetchData();
      toast({ title: "Success", description: "Equipment added successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add equipment", variant: "destructive" });
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingEquipment) return;

    try {
      setSaveLoading(true);
      await updateEquipment(editingEquipment.id, {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        hourly_rate: parseFloat(formData.hourly_rate || "0"),
        daily_rate: parseFloat(formData.daily_rate),
        description: formData.description,
        status: formData.status,
      });

      setEditingEquipment(null);
      resetForm();
      await fetchData();
      toast({ title: "Success", description: "Equipment updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update equipment", variant: "destructive" });
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEquipment(id);
      await fetchData();
      toast({ title: "Deleted", description: "Equipment removed successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete equipment", variant: "destructive" });
      console.error(err);
    }
  };

  const openEditDialog = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      category_id: eq.categoryId,
      hourly_rate: eq.hourlyRate?.toString() || "0",
      daily_rate: eq.dailyRate?.toString() || "0",
      description: eq.description,
      status: eq.status,
    });
  };

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || eq.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
          <SelectTrigger onKeyDown={(e) => e.stopPropagation()}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Hourly Rate ($)</Label>
        <Input
          type="number"
          placeholder="Enter hourly rate"
          value={formData.hourly_rate}
          onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="space-y-2">
        <Label>Daily Rate ($) *</Label>
        <Input
          type="number"
          placeholder="Enter daily rate"
          value={formData.daily_rate}
          onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(val: Equipment["status"]) => setFormData({ ...formData, status: val })}>
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
      <div className="col-span-2 space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Equipment" subtitle="Manage your rental equipment inventory">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Equipment" subtitle="Manage your rental equipment inventory">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="outline" onClick={fetchData} size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

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
                {categories.map((cat) => (
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
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            {/* Add Equipment Modal (separated into its own component) */}
            <AddEquipmentModal
              open={isAddOpen}
              onOpenChange={(o) => {
                if (!o) resetForm();
                setIsAddOpen(o);
              }}
              categories={categories}
              onCreated={async () => {
                resetForm();
                await fetchData();
                // refresh list after creation (toast is shown by modal)
                await Promise.resolve();
              }}
            />
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('placehold.co')) {
                        target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                      }
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(eq.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{eq.name}</h3>
                      <p className="text-sm text-muted-foreground">{eq.category}</p>
                    </div>
                    <Badge variant="outline">{eq.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{eq.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-bold text-lg">
                      <DollarSign className="w-5 h-5" />
                      {eq.dailyRate}/day
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
                            <Button onClick={handleEdit} className="gradient-primary" disabled={saveLoading}>
                              {saveLoading ? "Saving..." : "Save Changes"}
                            </Button>
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
