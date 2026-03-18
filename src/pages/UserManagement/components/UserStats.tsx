import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";
import { UserWithStats, roleLabels } from "../types";

interface UserStatsProps {
  users: UserWithStats[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      <Card className="glass-card border-border/40 hover:border-primary/20 transition-all hover:shadow-md group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Total
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold">{users.length}</div>
        </CardContent>
      </Card>

      {Object.entries(roleLabels).map(([role, label]) => {
        const count = users.filter(user => user.role === role).length;
        return (
          <Card key={role} className="glass-card border-border/40 hover:border-primary/20 transition-all hover:shadow-md group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1" title={label}>
                {label}
              </CardTitle>
              <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 