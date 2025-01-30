import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, UserPlus, Pencil, Power, PowerOff, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";

const adminSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().optional(),
});

type AdminFormData = z.infer<typeof adminSchema>;

type FilterState = {
  search: string;
  status: 'all' | 'active' | 'disabled';
};

export default function AdminManagement() {
  const { data: admins } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all'
  });

  const filteredAdmins = useMemo(() => {
    if (!admins) return [];

    return admins.filter((admin: any) => {
      // Search filter
      const searchTerms = filters.search.toLowerCase();
      const matchesSearch = 
        admin.firstName?.toLowerCase().includes(searchTerms) ||
        admin.lastName?.toLowerCase().includes(searchTerms) ||
        admin.email?.toLowerCase().includes(searchTerms) ||
        admin.phoneNumber?.includes(searchTerms);

      // Status filter
      const matchesStatus = 
        filters.status === 'all' ||
        (filters.status === 'active' && admin.isEnabled) ||
        (filters.status === 'disabled' && !admin.isEnabled);

      return matchesSearch && matchesStatus;
    });
  }, [admins, filters]);

  const { toast } = useToast();
  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const res = await fetch("/api/admin/users/toggle-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: "Success", 
        description: data.message || "Admin status updated successfully" 
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Admin user created successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: AdminFormData }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Admin updated successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: number; enabled: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Admin status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={form.handleSubmit((data) => createAdminMutation.mutate(data))} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <label>Email</label>
                <Input {...form.register("email")} type="email" />
              </div>
              <div className="space-y-2">
                <label>First Name</label>
                <Input {...form.register("firstName")} />
              </div>
              <div className="space-y-2">
                <label>Last Name</label>
                <Input {...form.register("lastName")} />
              </div>
              <div className="space-y-2">
                <label>Phone Number</label>
                <Input {...form.register("phoneNumber")} type="tel" />
              </div>
              <div className="space-y-2">
                <label>Password</label>
                <Input type="password" {...form.register("password")} />
              </div>
              <Button type="submit">Create Admin</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Administrators</CardTitle>
          <div className="mt-4 space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filters.status === 'all' ? 'secondary' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                >
                  All
                </Button>
                <Button
                  variant={filters.status === 'active' ? 'secondary' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, status: 'active' }))}
                >
                  Active
                </Button>
                <Button
                  variant={filters.status === 'disabled' ? 'secondary' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, status: 'disabled' }))}
                >
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins?.map((admin: any) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phoneNumber}</TableCell>
                  <TableCell>
                    {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      admin.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!admin.isSuperAdmin && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Admin</DialogTitle>
                              </DialogHeader>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = {
                                    email: e.currentTarget.email.value,
                                    firstName: e.currentTarget.firstName.value,
                                    lastName: e.currentTarget.lastName.value,
                                    phoneNumber: e.currentTarget.phoneNumber.value,
                                    password: e.currentTarget.password.value,
                                  };
                                  updateAdminMutation.mutate({ userId: admin.id, data: formData });
                                  form.reset(); 
                                }}
                                className="space-y-4"
                              >
                                <div className="space-y-2">
                                  <label>Email</label>
                                  <Input name="email" defaultValue={admin.email} />
                                </div>
                                <div className="space-y-2">
                                  <label>First Name</label>
                                  <Input name="firstName" defaultValue={admin.firstName} />
                                </div>
                                <div className="space-y-2">
                                  <label>Last Name</label>
                                  <Input name="lastName" defaultValue={admin.lastName} />
                                </div>
                                <div className="space-y-2">
                                  <label>Phone Number</label>
                                  <Input name="phoneNumber" defaultValue={admin.phoneNumber} />
                                </div>
                                <div className="space-y-2">
                                  <label>New Password (leave empty to keep current)</label>
                                  <Input type="password" name="password" />
                                </div>
                                <Button type="submit">Update Admin</Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm(
                                "Are you sure? This will permanently remove this admin user."
                              )) {
                                toggleAdminMutation.mutate({
                                  userId: admin.id,
                                  isAdmin: false,
                                });
                              }
                            }}
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Remove Admin
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm(
                                admin.isEnabled
                                  ? "Are you sure you want to disable this admin?"
                                  : "Are you sure you want to enable this admin?"
                              )) {
                                toggleStatusMutation.mutate({
                                  userId: admin.id,
                                  enabled: !admin.isEnabled,
                                });
                              }
                            }}
                          >
                            {admin.isEnabled ? (
                              <PowerOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Power className="h-4 w-4 mr-2" />
                            )}
                            {admin.isEnabled ? 'Disable' : 'Enable'}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}