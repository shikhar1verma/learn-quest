import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useRulesets, useActivateRuleset, useSimulateXP } from "@/hooks/useAdminRules";
import { RulesetDialog } from "@/components/admin/RulesetDialog";
import { XPSimulator } from "@/components/admin/XPSimulator";
import { Play, Plus, Settings, Zap } from "lucide-react";
import { format } from "date-fns";

export default function AdminRules() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRuleset, setEditingRuleset] = useState<any>(null);
  
  const { data: rulesets = [], isLoading } = useRulesets();
  const activateRuleset = useActivateRuleset();

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (ruleset: any) => (
        <div className="flex items-center gap-2">
          {ruleset.name}
          {ruleset.active && <Badge variant="default">Active</Badge>}
        </div>
      )
    },
    {
      key: "updated_at",
      label: "Last Updated",
      sortable: true,
      render: (ruleset: any) => format(new Date(ruleset.updated_at), "MMM d, yyyy")
    },
    {
      key: "actions",
      label: "Actions",
      render: (ruleset: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingRuleset(ruleset)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {!ruleset.active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => activateRuleset.mutate(ruleset.id)}
              disabled={activateRuleset.isPending}
            >
              <Play className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rules Management</h2>
          <p className="text-muted-foreground">
            Configure XP calculations, multipliers, and game mechanics
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ruleset
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Rulesets</CardTitle>
              <CardDescription>
                Manage your game economy rules and XP calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTable
                data={rulesets}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search rulesets..."
                emptyMessage="No rulesets found. Create your first ruleset to get started."
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                XP Simulator
              </CardTitle>
              <CardDescription>
                Test how XP calculations work with current rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <XPSimulator />
            </CardContent>
          </Card>
        </div>
      </div>

      <RulesetDialog
        open={createDialogOpen || !!editingRuleset}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingRuleset(null);
          }
        }}
        ruleset={editingRuleset}
      />
    </div>
  );
}