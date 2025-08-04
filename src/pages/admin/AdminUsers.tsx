import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminUsers, useToggleAdmin } from "@/hooks/useAdmin";
import { Shield, ShieldOff } from "lucide-react";
import { format } from "date-fns";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const toggleAdmin = useToggleAdmin();

  const columns = [
    {
      key: "display_name",
      label: "Name",
      sortable: true,
      render: (user: any) => user.display_name || "No name set"
    },
    {
      key: "user_id",
      label: "User ID",
      render: (user: any) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {user.user_id.slice(0, 8)}...
        </code>
      )
    },
    {
      key: "isAdmin",
      label: "Role",
      render: (user: any) => (
        <div className="flex items-center gap-2">
          {user.isAdmin ? (
            <Badge variant="default">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          ) : (
            <Badge variant="secondary">User</Badge>
          )}
        </div>
      )
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (user: any) => format(new Date(user.created_at), "MMM d, yyyy")
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: any) => (
        <Button
          variant={user.isAdmin ? "destructive" : "outline"}
          size="sm"
          onClick={() => toggleAdmin.mutate({ 
            userId: user.user_id, 
            isAdmin: user.isAdmin 
          })}
          disabled={toggleAdmin.isPending}
        >
          {user.isAdmin ? (
            <>
              <ShieldOff className="h-4 w-4 mr-1" />
              Revoke Admin
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-1" />
              Make Admin
            </>
          )}
        </Button>
      )
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading users...</div>;
  }

  const adminCount = users.filter(user => user.isAdmin).length;
  const regularCount = users.length - adminCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts and admin privileges
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularCount}</div>
            <p className="text-xs text-muted-foreground">
              Standard user accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={users}
            columns={columns}
            searchKey="display_name"
            searchPlaceholder="Search users..."
            emptyMessage="No users found."
          />
        </CardContent>
      </Card>
    </div>
  );
}