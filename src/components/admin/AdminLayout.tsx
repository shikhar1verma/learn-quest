import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Swords,
  TreePine,
  Store,
  Users,
  History,
  Shield
} from "lucide-react";

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: BarChart3, exact: true },
  { title: "Rules", url: "/admin/rules", icon: FileText },
  { title: "Quests", url: "/admin/quests", icon: Swords },
  { title: "Skills", url: "/admin/skills", icon: TreePine },
  { title: "Store", url: "/admin/store", icon: Store },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Audit", url: "/admin/audit", icon: History },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const getNavCls = (path: string, exact = false) => {
    const isActive = exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
    
    return cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        <aside className="w-64 shrink-0">
          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.exact}
                className={getNavCls(item.url, item.exact)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}