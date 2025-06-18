import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, User, BarChart3 } from "lucide-react";
import { ActivityStats as ActivityStatsType } from "../types";

interface ActivityStatsProps {
  stats: ActivityStatsType;
}

export function ActivityStats({ stats }: ActivityStatsProps) {
  return (
    <div className="grid-responsive-stats mb-6">
      <Card className="card-responsive">
        <CardContent className="p-4 sm:p-6">
          <div className="inline-md">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary touch-friendly" />
            <div>
              <p className="text-responsive-lg font-bold">{stats.total}</p>
              <p className="text-responsive-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-responsive">
        <CardContent className="p-4 sm:p-6">
          <div className="inline-md">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 touch-friendly" />
            <div>
              <p className="text-responsive-lg font-bold">{stats.completed}</p>
              <p className="text-responsive-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-responsive">
        <CardContent className="p-4 sm:p-6">
          <div className="inline-md">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 touch-friendly" />
            <div>
              <p className="text-responsive-lg font-bold">{stats.pending}</p>
              <p className="text-responsive-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-responsive">
        <CardContent className="p-4 sm:p-6">
          <div className="inline-md">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary touch-friendly" />
            <div>
              <p className="text-responsive-lg font-bold">{stats.recent}</p>
              <p className="text-responsive-xs text-muted-foreground">Nas últimas 24h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 