import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Store, Gift, Zap, Clock, Calendar } from "lucide-react";
import { useAdminRewards, useCreateReward, useUpdateReward, useDeleteReward, AdminReward } from "@/hooks/useAdminStore";
import { format } from "date-fns";

export default function AdminStore() {
  const { data: rewards, isLoading } = useAdminRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<AdminReward | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cost_xp: 100,
    cooldown_days: 0,
    prerequisite_json: "{}"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cost_xp: 100,
      cooldown_days: 0,
      prerequisite_json: "{}"
    });
  };

  const handleCreateReward = async () => {
    if (!formData.title) return;

    let prerequisiteJson = {};
    try {
      prerequisiteJson = JSON.parse(formData.prerequisite_json);
    } catch (e) {
      prerequisiteJson = {};
    }

    await createMutation.mutateAsync({
      ...formData,
      prerequisite_json: prerequisiteJson
    });

    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditReward = (reward: AdminReward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description || "",
      cost_xp: reward.cost_xp,
      cooldown_days: reward.cooldown_days,
      prerequisite_json: JSON.stringify(reward.prerequisite_json, null, 2)
    });
  };

  const handleUpdateReward = async () => {
    if (!editingReward || !formData.title) return;

    let prerequisiteJson = {};
    try {
      prerequisiteJson = JSON.parse(formData.prerequisite_json);
    } catch (e) {
      prerequisiteJson = {};
    }

    await updateMutation.mutateAsync({
      id: editingReward.id,
      ...formData,
      prerequisite_json: prerequisiteJson
    });

    setEditingReward(null);
    resetForm();
  };

  const handleDeleteReward = async (rewardId: string) => {
    await deleteMutation.mutateAsync(rewardId);
  };

  const getCostColor = (cost: number) => {
    if (cost <= 50) return 'bg-green-500 text-white';
    if (cost <= 200) return 'bg-yellow-500 text-black';
    if (cost <= 500) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Store Management</h1>
          <p className="text-muted-foreground">Create and manage rewards that players can purchase with XP</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Reward</DialogTitle>
              <DialogDescription>
                Add a new reward that players can purchase with XP
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Reward title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Reward description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_xp">XP Cost *</Label>
                  <Input
                    id="cost_xp"
                    type="number"
                    value={formData.cost_xp}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_xp: parseInt(e.target.value) }))}
                    min="1"
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown_days">Cooldown (Days)</Label>
                  <Input
                    id="cooldown_days"
                    type="number"
                    value={formData.cooldown_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, cooldown_days: parseInt(e.target.value) }))}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisite_json">Prerequisites (JSON)</Label>
                <Textarea
                  id="prerequisite_json"
                  value={formData.prerequisite_json}
                  onChange={(e) => setFormData(prev => ({ ...prev, prerequisite_json: e.target.value }))}
                  placeholder='{"min_level": 5, "required_skills": []}'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JSON object defining prerequisites. Example: {"{"}"min_level": 5, "required_skills": ["skill_id"]{"}"} 
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReward} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Reward"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rewards?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first reward for players to purchase.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Reward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards?.map((reward) => (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{reward.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCostColor(reward.cost_xp)}>
                        <Zap className="h-3 w-3 mr-1" />
                        {reward.cost_xp} XP
                      </Badge>
                      {reward.cooldown_days > 0 && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {reward.cooldown_days}d cooldown
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Dialog open={editingReward?.id === reward.id} onOpenChange={(open) => !open && setEditingReward(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditReward(reward)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Reward</DialogTitle>
                          <DialogDescription>
                            Update reward details
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Reward title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Reward description"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-cost_xp">XP Cost *</Label>
                              <Input
                                id="edit-cost_xp"
                                type="number"
                                value={formData.cost_xp}
                                onChange={(e) => setFormData(prev => ({ ...prev, cost_xp: parseInt(e.target.value) }))}
                                min="1"
                                placeholder="100"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-cooldown_days">Cooldown (Days)</Label>
                              <Input
                                id="edit-cooldown_days"
                                type="number"
                                value={formData.cooldown_days}
                                onChange={(e) => setFormData(prev => ({ ...prev, cooldown_days: parseInt(e.target.value) }))}
                                min="0"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-prerequisite_json">Prerequisites (JSON)</Label>
                            <Textarea
                              id="edit-prerequisite_json"
                              value={formData.prerequisite_json}
                              onChange={(e) => setFormData(prev => ({ ...prev, prerequisite_json: e.target.value }))}
                              placeholder='{"min_level": 5, "required_skills": []}'
                              rows={4}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              JSON object defining prerequisites. Example: {"{"}"min_level": 5, "required_skills": ["skill_id"]{"}"} 
                            </p>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingReward(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateReward} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Updating..." : "Update Reward"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reward</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{reward.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReward(reward.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {reward.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {reward.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {Object.keys(reward.prerequisite_json).length > 0 && (
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong>Prerequisites:</strong>
                      <pre className="mt-1 text-xs text-muted-foreground">
                        {JSON.stringify(reward.prerequisite_json, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {format(new Date(reward.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 