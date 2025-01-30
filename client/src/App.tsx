import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCustomers from "@/pages/admin/customers";
import AdminRewards from "@/pages/admin/rewards";
import AdminLayout from "@/components/layout/admin-layout";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerRewards from "@/pages/customer/rewards";
import CustomerLayout from "@/components/layout/customer-layout";

function PrivateRoute({ component: Component, admin = false, ...rest }: any) {
  const { user, isLoading } = useUser();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (admin && !user.isAdmin) {
    navigate("/dashboard");
    return null;
  }

  if (!admin && user.isAdmin) {
    navigate("/admin");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isLoading, user } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Switch>
        <Route path="/auth">
          {user ? (
            <Redirect to={user.isAdmin ? "/admin" : "/dashboard"} />
          ) : (
            <AuthPage />
          )}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminLayout>
            <PrivateRoute component={AdminDashboard} admin />
          </AdminLayout>
        </Route>
        <Route path="/admin/customers">
          <AdminLayout>
            <PrivateRoute component={AdminCustomers} admin />
          </AdminLayout>
        </Route>
        <Route path="/admin/rewards">
          <AdminLayout>
            <PrivateRoute component={AdminRewards} admin />
          </AdminLayout>
        </Route>

        {/* Customer Routes */}
        <Route path="/dashboard">
          <CustomerLayout>
            <PrivateRoute component={CustomerDashboard} />
          </CustomerLayout>
        </Route>
        <Route path="/rewards">
          <CustomerLayout>
            <PrivateRoute component={CustomerRewards} />
          </CustomerLayout>
        </Route>

        {/* Redirect root to appropriate dashboard */}
        <Route path="/">
          {user ? (
            <Redirect to={user.isAdmin ? "/admin" : "/dashboard"} />
          ) : (
            <Redirect to="/auth" />
          )}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;