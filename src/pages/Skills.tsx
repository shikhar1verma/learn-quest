import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSkills } from "@/hooks/useSkills";
import { useCreateEvent } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trophy, ExternalLink, Target } from "lucide-react";

const milestoneSchema = z.object({
  evidenceUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().min(10, "Please provide at least 10 characters of description"),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

export default function Skills() {
  const { data: skillsByTier, isLoading, error } = useSkills();
  const createEvent = useCreateEvent();
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      evidenceUrl: "",
      notes: "",
    },
  });

  const handleMilestoneComplete = async (data: MilestoneFormData) => {
    if (!selectedSkill) return;

    try {
      await createEvent.mutateAsync({
        title: `Skill Milestone: ${selectedSkill.name}`,
        tags: ['skill', 'milestone', selectedSkill.slug],
        evidenceUrl: data.evidenceUrl || undefined,
        notes: data.notes,
        difficulty: 'medium',
      });

      toast.success(`Milestone completed for ${selectedSkill.name}!`);
      setIsDialogOpen(false);
      form.reset();
      setSelectedSkill(null);
    } catch (error) {
      toast.error("Failed to complete milestone");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground mt-2">Track your learning progress across different skill areas</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((tier) => (
            <Card key={tier}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Unable to load skills</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!skillsByTier || Object.keys(skillsByTier).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No skills found</h3>
          <p className="text-muted-foreground">Skills will appear here once they're added to your class</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skills</h1>
        <p className="text-muted-foreground mt-2">Track your learning progress across different skill areas</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(skillsByTier)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([tier, skills]) => (
            <Card key={tier} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tier {tier}
                  <Badge variant="outline">{skills.length} skills</Badge>
                </CardTitle>
                <CardDescription>
                  {tier === "1" && "Foundation skills - essential building blocks"}
                  {tier === "2" && "Intermediate skills - practical applications"}
                  {tier === "3" && "Advanced skills - expert-level capabilities"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => (
                    <Card key={skill.id} className="group cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{skill.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {skill.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>0%</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          <Dialog open={isDialogOpen && selectedSkill?.id === skill.id} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setSelectedSkill(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => setSelectedSkill(skill)}
                              >
                                Mark Milestone
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Complete Milestone: {skill.name}</DialogTitle>
                                <DialogDescription>
                                  Record your progress and evidence for this skill milestone.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleMilestoneComplete)} className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name="evidenceUrl"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Evidence URL (optional)</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Link to repo, demo, article, etc."
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>What did you accomplish?</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Describe what you learned or built..."
                                            className="min-h-[100px]"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="flex gap-3 pt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsDialogOpen(false)}
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="submit"
                                      disabled={createEvent.isPending}
                                      className="flex-1"
                                    >
                                      {createEvent.isPending ? "Completing..." : "Complete Milestone"}
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}