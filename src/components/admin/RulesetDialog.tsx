import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateRuleset, useUpdateRuleset } from "@/hooks/useAdminRules";
import { toast } from "@/hooks/use-toast";

interface RulesetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleset?: any;
}

const defaultRules = {
  levelCurve: {
    baseXP: 100,
    increment: 50
  },
  baseXPCatalog: {
    read_doc: 5,
    implement_utility: 15,
    complete_tutorial: 20,
    ship_mvp_local: 35,
    deploy_mvp: 50,
    write_post: 15,
    get_dm_lead: 40,
    book_meeting: 60,
    close_pilot: 120,
    publish_demo: 20,
    run_evaluation: 30,
    fix_bug: 30
  },
  multipliers: {
    difficulty: {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5
    },
    classAlignment: 1.2,
    novelty: {
      bonus: 1.1,
      windowDays: 7
    },
    socialProof: 1.1
  },
  streaks: {
    freezeLimit: 3,
    graceDays: 1
  },
  store: {
    defaultCooldown: 7,
    prerequisites: {
      minLevel: "level >= X",
      completedQuests: "quests.includes(X)",
      minStreak: "streak >= X"
    }
  }
};

export function RulesetDialog({ open, onOpenChange, ruleset }: RulesetDialogProps) {
  const [name, setName] = useState("");
  const [rulesJson, setRulesJson] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  
  const createRuleset = useCreateRuleset();
  const updateRuleset = useUpdateRuleset();

  useEffect(() => {
    if (ruleset) {
      setName(ruleset.name);
      setRulesJson(JSON.stringify(ruleset.rules_json || defaultRules, null, 2));
    } else {
      setName("");
      setRulesJson(JSON.stringify(defaultRules, null, 2));
    }
  }, [ruleset, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the ruleset.",
        variant: "destructive"
      });
      return;
    }

    let parsedRules;
    try {
      parsedRules = JSON.parse(rulesJson);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format in rules.",
        variant: "destructive"
      });
      return;
    }

    const rulesetData = {
      name: name.trim(),
      rules_json: parsedRules
    };

    if (ruleset) {
      await updateRuleset.mutateAsync({ id: ruleset.id, ...rulesetData });
    } else {
      await createRuleset.mutateAsync(rulesetData);
    }

    onOpenChange(false);
  };

  const updateFormField = (path: string, value: any) => {
    try {
      const rules = JSON.parse(rulesJson);
      const keys = path.split('.');
      let current = rules;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setRulesJson(JSON.stringify(rules, null, 2));
    } catch (error) {
      console.error('Error updating form field:', error);
    }
  };

  const getRuleValue = (path: string) => {
    try {
      const rules = JSON.parse(rulesJson);
      return path.split('.').reduce((obj, key) => obj?.[key], rules);
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ruleset ? "Edit Ruleset" : "Create New Ruleset"}
          </DialogTitle>
          <DialogDescription>
            Configure the game economy rules and XP calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Ruleset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Default Rules v2"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="form">Form Editor</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Level Curve</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Base XP</Label>
                      <Input
                        type="number"
                        value={getRuleValue('levelCurve.baseXP')}
                        onChange={(e) => updateFormField('levelCurve.baseXP', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Per Level Increment</Label>
                      <Input
                        type="number"
                        value={getRuleValue('levelCurve.increment')}
                        onChange={(e) => updateFormField('levelCurve.increment', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Difficulty Multipliers</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Easy</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getRuleValue('multipliers.difficulty.easy')}
                        onChange={(e) => updateFormField('multipliers.difficulty.easy', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Medium</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getRuleValue('multipliers.difficulty.medium')}
                        onChange={(e) => updateFormField('multipliers.difficulty.medium', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Hard</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getRuleValue('multipliers.difficulty.hard')}
                        onChange={(e) => updateFormField('multipliers.difficulty.hard', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Bonus Multipliers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Class Alignment Bonus</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getRuleValue('multipliers.classAlignment')}
                        onChange={(e) => updateFormField('multipliers.classAlignment', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Social Proof Bonus</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getRuleValue('multipliers.socialProof')}
                        onChange={(e) => updateFormField('multipliers.socialProof', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="json">
              <div>
                <Label htmlFor="rules-json">Rules JSON</Label>
                <Textarea
                  id="rules-json"
                  value={rulesJson}
                  onChange={(e) => setRulesJson(e.target.value)}
                  className="font-mono min-h-[400px]"
                  placeholder="Enter valid JSON for rules configuration..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createRuleset.isPending || updateRuleset.isPending}
            >
              {ruleset ? "Update" : "Create"} Ruleset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}