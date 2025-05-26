
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacoesHeaderProps {
  totalCount: number;
  vmCount: number;
  informativoCount: number;
}

export function OrientacoesHeader({ totalCount, vmCount, informativoCount }: OrientacoesHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Orientações
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-background/50 text-xs">
              Total: {totalCount}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 text-xs">
              VM: {vmCount}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 text-xs">
              Informativo: {informativoCount}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className={`${isMobile ? 'flex-1' : ''}`}>
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Nova" : "Nova Orientação"}
          </Button>
        </div>
      </div>
    </div>
  );
}
