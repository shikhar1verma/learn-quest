import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useEffect } from "react"

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    )
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-elevated">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">404</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            The quest you're looking for doesn't exist. Perhaps it was completed or moved to another realm?
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
            <Button asChild className="bg-gradient-primary">
              <Link to="/quests">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Quests
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}