import { Filter, Users, Truck, CalendarDays, BarChart3 } from "@/components/ui/emoji-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Consultor {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Stats {
  totalShifts: number;
  totalCarga: number;
  workingDays: number;
  consultantsCount: number;
}

interface EscalaFilterBarProps {
  consultores: Consultor[];
  filterConsultantId: string | null;
  onFilterChange: (id: string | null) => void;
  stats: Stats;
}

export function EscalaFilterBar({ consultores, filterConsultantId, onFilterChange, stats }: EscalaFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filterConsultantId || "all"}
          onValueChange={(val) => onFilterChange(val === "all" ? null : val)}
        >
          <SelectTrigger className="w-[200px] h-8 text-sm">
            <SelectValue placeholder="Todos os consultores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os consultores</SelectItem>
            {consultores.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {stats.workingDays} dias
        </span>
        <span className="inline-flex items-center gap-1">
          <Truck className="h-3.5 w-3.5 text-primary" />
          {stats.totalCarga} cargas
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {stats.consultantsCount} consultores
        </span>
      </div>
    </div>
  );
}
