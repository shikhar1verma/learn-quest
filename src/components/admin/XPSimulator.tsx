import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulateXP } from "@/hooks/useAdminRules";
import { Zap } from "lucide-react";

export function XPSimulator() {
  const [baseXP, setBaseXP] = useState(20);
  const [difficulty, setDifficulty] = useState("easy");
  const [classAligned, setClassAligned] = useState(false);
  const [socialProof, setSocialProof] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

  const simulateXP = useSimulateXP();

  const handleSimulate = () => {
    simulateXP.mutate({
      base_xp: baseXP,
      difficulty,
      class_aligned: classAligned,
      social_proof: socialProof,
      first_time: firstTime
    });
  };

  const result = simulateXP.data;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="base-xp">Base XP</Label>
          <Input
            id="base-xp"
            type="number"
            value={baseXP}
            onChange={(e) => setBaseXP(parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="class-aligned">Class Aligned</Label>
            <Switch
              id="class-aligned"
              checked={classAligned}
              onCheckedChange={setClassAligned}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="social-proof">Social Proof</Label>
            <Switch
              id="social-proof"
              checked={socialProof}
              onCheckedChange={setSocialProof}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="first-time">First Time Bonus</Label>
            <Switch
              id="first-time"
              checked={firstTime}
              onCheckedChange={setFirstTime}
            />
          </div>
        </div>

        <Button 
          onClick={handleSimulate} 
          className="w-full"
          disabled={simulateXP.isPending}
        >
          <Zap className="h-4 w-4 mr-2" />
          Calculate XP
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {(result as any).total} XP
              </div>
              <div className="text-sm text-muted-foreground">
                Multiplier: {(result as any).multiplier?.toFixed(2)}x
              </div>
              
              {(result as any).breakdown && (
                <div className="text-xs space-y-1 pt-2 border-t">
                  <div className="font-medium">Breakdown:</div>
                  <div>Base: {(result as any).breakdown.base} XP</div>
                  <div>Difficulty: {(result as any).breakdown.difficulty}x</div>
                  {(result as any).breakdown.classAlignment && (
                    <div>Class Alignment: {(result as any).breakdown.classAlignment}x</div>
                  )}
                  {(result as any).breakdown.socialProof && (
                    <div>Social Proof: {(result as any).breakdown.socialProof}x</div>
                  )}
                  {(result as any).breakdown.novelty && (
                    <div>First Time: {(result as any).breakdown.novelty}x</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}