import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRewards, usePurchases, usePurchaseReward, useRedeemPurchase } from "@/hooks/useRewards";
import { useProfileStats } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShoppingCart, Gift, Clock, CheckCircle, Zap } from "lucide-react";

export default function Store() {
  const { data: rewards, isLoading: rewardsLoading } = useRewards();
  const { data: purchases, isLoading: purchasesLoading } = usePurchases();
  const { data: stats } = useProfileStats();
  const purchaseReward = usePurchaseReward();
  const redeemPurchase = useRedeemPurchase();
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const handlePurchase = async (reward: any) => {
    try {
      await purchaseReward.mutateAsync({
        rewardId: reward.id,
        cost: reward.cost_xp,
      });
      toast.success(`Purchased ${reward.title}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase reward");
    }
  };

  const handleRedeem = async (purchase: any) => {
    try {
      await redeemPurchase.mutateAsync({
        purchaseId: purchase.id,
        note: "Redeemed via store",
      });
      toast.success("Reward redeemed!");
    } catch (error) {
      toast.error("Failed to redeem reward");
    }
  };

  const canAfford = (cost: number) => {
    return stats ? stats.total_xp >= cost : false;
  };

  const isOnCooldown = (reward: any) => {
    if (!purchases || reward.cooldown_days === 0) return false;
    
    const lastPurchase = purchases.find(p => p.reward_id === reward.id);
    if (!lastPurchase) return false;
    
    const lastPurchaseDate = new Date(lastPurchase.created_at);
    const cooldownEnd = new Date(lastPurchaseDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + reward.cooldown_days);
    
    return new Date() < cooldownEnd;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (rewardsLoading || purchasesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground mt-2">Spend your XP on rewards and treats</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground mt-2">Spend your XP on rewards and treats</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold">{stats?.total_xp || 0} XP</span>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="purchases">
            My Purchases
            {purchases && purchases.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {purchases.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          {rewards && rewards.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => {
                const affordable = canAfford(reward.cost_xp);
                const onCooldown = isOnCooldown(reward);
                const canPurchase = affordable && !onCooldown;

                return (
                  <Card key={reward.id} className={`group transition-all ${canPurchase ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="line-clamp-1">{reward.title}</span>
                        <div className="flex items-center gap-1 text-primary">
                          <Zap className="h-4 w-4" />
                          <span className="font-bold">{reward.cost_xp}</span>
                        </div>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {reward.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {reward.cooldown_days > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {reward.cooldown_days} day cooldown
                          </div>
                        )}
                        
                        {onCooldown && (
                          <Badge variant="outline" className="w-full justify-center">
                            On Cooldown
                          </Badge>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant={canPurchase ? "default" : "outline"}
                              disabled={!canPurchase || purchaseReward.isPending}
                              className="w-full"
                              onClick={() => setSelectedReward(reward)}
                            >
                              {!affordable ? "Not Enough XP" : onCooldown ? "On Cooldown" : "Purchase"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Purchase {reward.title}?</DialogTitle>
                              <DialogDescription>
                                This will cost {reward.cost_xp} XP. You'll have {(stats?.total_xp || 0) - reward.cost_xp} XP remaining.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm">{reward.description}</p>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setSelectedReward(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1"
                                  onClick={() => handlePurchase(reward)}
                                  disabled={purchaseReward.isPending}
                                >
                                  {purchaseReward.isPending ? "Purchasing..." : "Confirm Purchase"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No rewards available</h3>
                <p className="text-muted-foreground">Check back later for new rewards!</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          {purchases && purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{purchase.reward.title}</h3>
                        <p className="text-sm text-muted-foreground">{purchase.reward.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Purchased {formatDate(purchase.created_at)}</span>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {purchase.cost_xp} XP
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {purchase.redeemed_at ? (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Redeemed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRedeem(purchase)}
                            disabled={redeemPurchase.isPending}
                            className="gap-1"
                          >
                            <Gift className="h-3 w-3" />
                            {redeemPurchase.isPending ? "Redeeming..." : "Redeem"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase rewards from the catalog to see them here
                </p>
                <Button onClick={() => (document.querySelector('[value="catalog"]') as HTMLElement)?.click()}>
                  Browse Catalog
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}