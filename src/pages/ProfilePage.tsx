import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile, getUserProfile } from "@/services/profileService";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      try {
        const response = await getUserProfile(user.id);
        if (response.status === 'success' && response.data) {
          setFormData({
            name: response.data.name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            address: response.data.address || ""
          });
          // Update the user context with fresh data
          if (user) {
            updateUser({ ...user, name: response.data.name, email: response.data.email, phone: response.data.phone, address: response.data.address });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to user context data if API call fails
        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || ""
          });
        }
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user, updateUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) throw new Error("Not authenticated");
      const response = await updateUserProfile({ id: user.id, ...formData });
      
      if (response.status === 'success') {
        // Update the user context with new data
        updateUser({ ...user, ...formData });
        
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        
        setIsEditing(false);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  return (
    <AdminLayout title="Profile" subtitle="Manage your account information">
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <span>My Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={handleEditClick}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                        address: user?.address || ""
                      });
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}