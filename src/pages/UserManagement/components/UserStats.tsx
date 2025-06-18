import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";
import { UserWithStats, roleLabels } from "../types";

interface UserStatsProps {
  users: UserWithStats[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="grid-responsive-stats">
      <Card className="card-responsive col-span-2 lg:col-span-1">
        <CardHeader className="header-responsive space-y-0 pb-2">
          <CardTitle className="text-responsive-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground touch-friendly" />
        </CardHeader>
        <CardContent>
          <div className="text-responsive-lg font-bold">{users.length}</div>
        </CardContent>
      </Card>

      {Object.entries(roleLabels).map(([role, label]) => {
        const count = users.filter(user => user.role === role).length;
        return (
          <Card key={role} className="card-responsive">
            <CardHeader className="header-responsive space-y-0 pb-2">
              <CardTitle className="text-responsive-sm font-medium line-clamp-1">{label}</CardTitle>
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 touch-friendly" />
            </CardHeader>
            <CardContent>
              <div className="text-responsive-lg font-bold">{count}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 