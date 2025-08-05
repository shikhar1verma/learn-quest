import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Calendar, Zap, Target, Clock } from "lucide-react";
import { useAdminQuests, useCreateQuest, useUpdateQuest, useDeleteQuest, AdminQuest } from "@/hooks/useAdminQuests";
import { usePlayerClasses } from "@/hooks/useProfile";
import { format } from "date-fns";

export default function AdminQuests() {
  const { data: quests, isLoading } = useAdminQuests();
  const { data: playerClasses } = usePlayerClasses();
  const createMutation = useCreateQuest();
  const updateMutation = useUpdateQuest();
  const deleteMutation = useDeleteQuest();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<AdminQuest | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "primary",
    difficulty: "easy",
    base_xp: 20,
    class_id: "",
    due_at: "",
    checklist: [] as Array<{ label: string; sort_order: number; is_done?: boolean }>
  });
  const [checklistInput, setChecklistInput] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "primary",
      difficulty: "easy",
      base_xp: 20,
      class_id: "",
      due_at: "",
      checklist: []
    });
    setChecklistInput("");
  };

  const handleCreateQuest = async () => {
    if (!formData.title || !formData.class_id) return;

    await createMutation.mutateAsync({
      ...formData,
      due_at: formData.due_at || undefined,
      checklist: formData.checklist.length > 0 ? formData.checklist : undefined
    });

    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditQuest = (quest: AdminQuest) => {
    setEditingQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description || "",
      type: quest.type,
      difficulty: quest.difficulty,
      base_xp: quest.base_xp,
      class_id: quest.class_id,
      due_at: quest.due_at ? format(new Date(quest.due_at), "yyyy-MM-dd'T'HH:mm") : "",
      checklist: quest.quest_checklist?.map((item, index) => ({
        label: item.label,
        sort_order: index,
        is_done: item.is_done
      })) || []
    });
  };

  const handleUpdateQuest = async () => {
    if (!editingQuest || !formData.title || !formData.class_id) return;

    await updateMutation.mutateAsync({
      id: editingQuest.id,
      ...formData,
      due_at: formData.due_at || undefined,
      checklist: formData.checklist.length > 0 ? formData.checklist : undefined
    });

    setEditingQuest(null);
    resetForm();
  };

  const handleDeleteQuest = async (questId: string) => {
    await deleteMutation.mutateAsync(questId);
  };

  const addChecklistItem = () => {
    if (!checklistInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { label: checklistInput.trim(), sort_order: prev.checklist.length }
      ]
    }));
    setChecklistInput("");
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-quest-primary text-white';
      case 'side': return 'bg-quest-side text-white';
      case 'boss': return 'bg-quest-boss text-white';
      case 'weekly': return 'bg-quest-weekly text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
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
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold">Quest Management</h1>
          <p className="text-muted-foreground">Create and manage quests for different player classes</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quest</DialogTitle>
              <DialogDescription>
                Add a new quest for players to complete
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Quest title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="class">Player Class *</Label>
                  <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {playerClasses?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Quest description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                      <SelectItem value="boss">Boss</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_xp">Base XP</Label>
                  <Input
                    id="base_xp"
                    type="number"
                    value={formData.base_xp}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_xp: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_at">Due Date (Optional)</Label>
                <Input
                  id="due_at"
                  type="datetime-local"
                  value={formData.due_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_at: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Checklist Items</Label>
                <div className="flex gap-2">
                  <Input
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    placeholder="Add checklist item"
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                  />
                  <Button type="button" onClick={addChecklistItem}>Add</Button>
                </div>
                
                {formData.checklist.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.checklist.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{item.label}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuest} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Quest"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {quests?.map((quest) => (
          <Card key={quest.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{quest.title}</CardTitle>
                    <Badge className={getQuestTypeColor(quest.type)}>
                      {quest.type}
                    </Badge>
                    <Badge className={getDifficultyColor(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xp">
                      <Zap className="h-3 w-3 mr-1" />
                      {quest.base_xp} XP
                    </Badge>
                  </div>
                  
                  {quest.description && (
                    <CardDescription className="text-sm">
                      {quest.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Status: <Badge variant="outline">{quest.status}</Badge></span>
                    {quest.due_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {format(new Date(quest.due_at), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created: {format(new Date(quest.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={editingQuest?.id === quest.id} onOpenChange={(open) => !open && setEditingQuest(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEditQuest(quest)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Quest</DialogTitle>
                        <DialogDescription>
                          Update quest details
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Quest title"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-class">Player Class *</Label>
                            <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {playerClasses?.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Quest description"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-type">Type</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="primary">Primary</SelectItem>
                                <SelectItem value="side">Side</SelectItem>
                                <SelectItem value="boss">Boss</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-difficulty">Difficulty</Label>
                            <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-base_xp">Base XP</Label>
                            <Input
                              id="edit-base_xp"
                              type="number"
                              value={formData.base_xp}
                              onChange={(e) => setFormData(prev => ({ ...prev, base_xp: parseInt(e.target.value) }))}
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-due_at">Due Date (Optional)</Label>
                          <Input
                            id="edit-due_at"
                            type="datetime-local"
                            value={formData.due_at}
                            onChange={(e) => setFormData(prev => ({ ...prev, due_at: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Checklist Items</Label>
                          <div className="flex gap-2">
                            <Input
                              value={checklistInput}
                              onChange={(e) => setChecklistInput(e.target.value)}
                              placeholder="Add checklist item"
                              onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                            />
                            <Button type="button" onClick={addChecklistItem}>Add</Button>
                          </div>
                          
                          {formData.checklist.length > 0 && (
                            <div className="space-y-2 mt-4">
                              {formData.checklist.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-2">
                                    <Checkbox 
                                      checked={item.is_done || false}
                                      onCheckedChange={(checked) => {
                                        const newChecklist = [...formData.checklist];
                                        newChecklist[index] = { ...newChecklist[index], is_done: !!checked };
                                        setFormData(prev => ({ ...prev, checklist: newChecklist }));
                                      }}
                                    />
                                    <span>{item.label}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeChecklistItem(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingQuest(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateQuest} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? "Updating..." : "Update Quest"}
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
                        <AlertDialogTitle>Delete Quest</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{quest.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteQuest(quest.id)}
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
            
            {quest.quest_checklist && quest.quest_checklist.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Checklist Items:</h4>
                  <div className="grid gap-1">
                    {quest.quest_checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={item.is_done} disabled />
                        <span className={item.is_done ? 'line-through text-muted-foreground' : ''}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {quests?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quests found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first quest for players to complete.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Quest
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 