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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, TreePine, Trophy, Users, Target } from "lucide-react";
import { useAdminSkills, useCreateSkill, useUpdateSkill, useDeleteSkill, AdminSkill } from "@/hooks/useAdminSkills";
import { usePlayerClasses } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminSkills() {
  const { data: skills, isLoading, error } = useAdminSkills();
  const { data: playerClasses, isLoading: classesLoading } = usePlayerClasses();
  

  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    tier: 1,
    class_id: "",
    parent_id: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      tier: 1,
      class_id: "",
      parent_id: ""
    });
  };

  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
    
    // Add timestamp to make it more unique
    const timestamp = Date.now().toString().slice(-4);
    return `${baseSlug}_${timestamp}`;
  };

  const handleCreateSkill = async () => {
    if (!formData.name || !formData.class_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Name and Player Class).",
        variant: "destructive"
      });
      return;
    }

    try {
      const skillData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        parent_id: formData.parent_id || undefined
      };


      await createMutation.mutateAsync(skillData);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error in handleCreateSkill:', error);
      // Error is already handled by the mutation's onError
    }
  };

  const handleEditSkill = (skill: AdminSkill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || "",
      slug: skill.slug,
      tier: skill.tier,
      class_id: skill.class_id,
      parent_id: skill.parent_id || ""
    });
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill || !formData.name || !formData.class_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Name and Player Class).",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData = {
        ...formData,
        parent_id: formData.parent_id || undefined
      };


      await updateMutation.mutateAsync({
        id: editingSkill.id,
        ...updateData
      });

      setEditingSkill(null);
      resetForm();
    } catch (error) {
      console.error('Error in handleUpdateSkill:', error);
      // Error is already handled by the mutation's onError
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    await deleteMutation.mutateAsync(skillId);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-500 text-white';
      case 2: return 'bg-blue-500 text-white';
      case 3: return 'bg-purple-500 text-white';
      case 4: return 'bg-orange-500 text-white';
      case 5: return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAvailableParentSkills = (classId: string, currentSkillId?: string) => {
    return skills?.filter(skill => 
      skill.class_id === classId && 
      skill.id !== currentSkillId
    ) || [];
  };

  const groupSkillsByClass = () => {
    const grouped: Record<string, AdminSkill[]> = {};
    skills?.forEach(skill => {
      const className = skill.player_class?.name || 'Unknown Class';
      if (!grouped[className]) {
        grouped[className] = [];
      }
      grouped[className].push(skill);
    });
    return grouped;
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error loading skills</h3>
          <p className="text-muted-foreground">{error.message}</p>
          <pre className="text-xs mt-2 p-2 bg-muted rounded">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const groupedSkills = groupSkillsByClass();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Skills Management</h1>
          <p className="text-muted-foreground">Create and manage skills for different player classes</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Skill</DialogTitle>
              <DialogDescription>
                Add a new skill for players to master
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        name,
                        slug: prev.slug || generateSlug(name)
                      }));
                    }}
                    placeholder="Skill name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="skill_slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Skill description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Player Class *</Label>
                  <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value, parent_id: "" }))}>
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

                <div className="space-y-2">
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={formData.tier.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, tier: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1</SelectItem>
                      <SelectItem value="2">Tier 2</SelectItem>
                      <SelectItem value="3">Tier 3</SelectItem>
                      <SelectItem value="4">Tier 4</SelectItem>
                      <SelectItem value="5">Tier 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Skill</Label>
                  <Select value={formData.parent_id || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {getAvailableParentSkills(formData.class_id).map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
                              <Button onClick={handleCreateSkill} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Skill"}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TreePine className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No skills found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first skill for players to master.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([className, classSkills]) => (
            <Card key={className}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  {className}
                  <Badge variant="outline">{classSkills.length} skills</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {classSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{skill.name}</h4>
                          <Badge className={getTierColor(skill.tier)}>
                            Tier {skill.tier}
                          </Badge>
                          {skill.parent_skill && (
                            <Badge variant="outline" className="text-xs">
                              Child of: {skill.parent_skill.name}
                            </Badge>
                          )}
                        </div>
                        
                        {skill.description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {skill.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Slug: {skill.slug}</span>
                          <span>Created: {format(new Date(skill.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog open={editingSkill?.id === skill.id} onOpenChange={(open) => !open && setEditingSkill(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditSkill(skill)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Skill</DialogTitle>
                              <DialogDescription>
                                Update skill details
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Name *</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Skill name"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-slug">Slug *</Label>
                                  <Input
                                    id="edit-slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="skill_slug"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Skill description"
                                  rows={3}
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-class">Player Class *</Label>
                                  <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value, parent_id: "" }))}>
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

                                <div className="space-y-2">
                                  <Label htmlFor="edit-tier">Tier</Label>
                                  <Select value={formData.tier.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, tier: parseInt(value) }))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Tier 1</SelectItem>
                                      <SelectItem value="2">Tier 2</SelectItem>
                                      <SelectItem value="3">Tier 3</SelectItem>
                                      <SelectItem value="4">Tier 4</SelectItem>
                                      <SelectItem value="5">Tier 5</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-parent">Parent Skill</Label>
                                  <Select value={formData.parent_id || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === "none" ? "" : value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {getAvailableParentSkills(formData.class_id, editingSkill?.id).map((skill) => (
                                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingSkill(null)}>
                                Cancel
                              </Button>
                                                    <Button onClick={handleUpdateSkill} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Updating..." : "Update Skill"}
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
                              <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{skill.name}"? This action cannot be undone and may affect dependent skills.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 