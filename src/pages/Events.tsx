import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEvents, useCreateEvent } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, ExternalLink, Plus, Zap } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  tags: z.string().min(1, "Please add at least one tag"),
  evidenceUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().min(10, "Please provide at least 10 characters of description"),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type EventFormData = z.infer<typeof eventSchema>;

const DIFFICULTY_COLORS = {
  easy: "bg-green-500/10 text-green-700 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-700 border-red-500/20",
};

const COMMON_TAGS = [
  "tutorial", "project", "bug-fix", "optimization", "deployment", 
  "learning", "reading", "coding", "review", "documentation"
];

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      tags: "",
      evidenceUrl: "",
      notes: "",
      difficulty: "easy",
    },
  });

  const handleSubmit = async (data: EventFormData) => {
    try {
      const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await createEvent.mutateAsync({
        title: data.title,
        tags,
        evidenceUrl: data.evidenceUrl || undefined,
        notes: data.notes,
        difficulty: data.difficulty,
      });

      toast.success("Event logged successfully!");
      form.reset();
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to log event");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">Log custom learning activities and wins</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Log Event"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log New Event</CardTitle>
            <CardDescription>
              Record any learning activity, achievement, or milestone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="What did you accomplish?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy (1x XP)</SelectItem>
                            <SelectItem value="medium">Medium (1.2x XP)</SelectItem>
                            <SelectItem value="hard">Hard (1.5x XP)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="tutorial, coding, python, api" {...field} />
                      </FormControl>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {COMMON_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => {
                              const currentTags = field.value ? field.value.split(',').map(t => t.trim()) : [];
                              if (!currentTags.includes(tag)) {
                                field.onChange([...currentTags, tag].join(', '));
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidenceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Link to repo, demo, article, etc." {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you learned or accomplished..."
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
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEvent.isPending}
                    className="flex-1"
                  >
                    {createEvent.isPending ? "Logging..." : "Log Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Events</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge className={DIFFICULTY_COLORS[event.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                          {event.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.created_at)}
                        </div>
                        {event.evidence_url && (
                          <a
                            href={event.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Evidence
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-primary">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">XP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start logging your learning activities and achievements
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Log Your First Event
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}