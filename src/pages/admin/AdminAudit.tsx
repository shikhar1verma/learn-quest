import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAuditLogs } from "@/hooks/useAdminAudit";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminAudit() {
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const { data: auditLogs = [], isLoading } = useAuditLogs({
    entity: entityFilter || undefined,
    action: actionFilter || undefined
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "default";
      case "update": return "secondary";
      case "delete": return "destructive";
      case "activate": return "default";
      case "grant_admin": return "default";
      case "revoke_admin": return "destructive";
      default: return "outline";
    }
  };

  const columns = [
    {
      key: "created_at",
      label: "Timestamp",
      sortable: true,
      render: (log: any) => (
        <div className="text-sm">
          {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
        </div>
      )
    },
    {
      key: "action",
      label: "Action",
      render: (log: any) => (
        <Badge variant={getActionColor(log.action)}>
          {log.action}
        </Badge>
      )
    },
    {
      key: "entity",
      label: "Entity",
      sortable: true,
      render: (log: any) => (
        <div className="font-medium">{log.entity}</div>
      )
    },
    {
      key: "actor",
      label: "Actor",
      render: (log: any) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {log.actor ? log.actor.slice(0, 8) + "..." : "System"}
        </code>
      )
    },
    {
      key: "changes",
      label: "Changes",
      render: (log: any) => {
        const hasChanges = Object.keys(log.before || {}).length > 0 || Object.keys(log.after || {}).length > 0;
        return hasChanges ? (
          <div className="text-xs text-muted-foreground">
            View details for changes
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No changes</span>
        );
      }
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading audit logs...</div>;
  }

  const entities = [...new Set(auditLogs.map(log => log.entity))];
  const actions = [...new Set(auditLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">
          Track all administrative actions and system changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            View detailed logs of all administrative actions
          </CardDescription>
          <div className="flex gap-4 pt-4">
            <div className="w-48">
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entities</SelectItem>
                  {entities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={auditLogs}
            columns={columns}
            emptyMessage="No audit logs found."
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}