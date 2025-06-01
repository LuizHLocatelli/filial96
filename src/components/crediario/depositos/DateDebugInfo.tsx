import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, Eye, EyeOff } from "lucide-react";

interface DateDebugInfoProps {
  selectedDay: Date | null;
}

export function DateDebugInfo({ selectedDay }: DateDebugInfoProps) {
  const [showDebug, setShowDebug] = useState(false);

  if (!selectedDay) return null;

  const formatDateForDatabase = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const debugInfo = {
    selectedDate: selectedDay,
    formatted_ptBR: format(selectedDay, "dd/MM/yyyy", { locale: ptBR }),
    formatted_database: formatDateForDatabase(selectedDay),
    toISOString: selectedDay.toISOString(),
    toISOString_split: selectedDay.toISOString().split('T')[0],
    getTime: selectedDay.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: selectedDay.getTimezoneOffset()
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug de Data
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="h-6 px-2 text-xs"
          >
            {showDebug ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showDebug ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>
      
      {showDebug && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs font-mono">
            <div><strong>Data Selecionada:</strong> {debugInfo.formatted_ptBR}</div>
            <div><strong>Para Banco (Novo):</strong> <span className="text-green-600">{debugInfo.formatted_database}</span></div>
            <div><strong>ISO String:</strong> {debugInfo.toISOString}</div>
            <div><strong>ISO Split (Antigo):</strong> <span className="text-red-600">{debugInfo.toISOString_split}</span></div>
            <div><strong>Timestamp:</strong> {debugInfo.getTime}</div>
            <div><strong>Timezone:</strong> {debugInfo.timezone}</div>
            <div><strong>Offset (min):</strong> {debugInfo.timezoneOffset}</div>
          </div>
          
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
            <strong>Problema:</strong> ISO Split pode mudar a data devido ao timezone. 
            <br />
            <strong>Solução:</strong> Usar formatação local para manter a data correta.
          </div>
        </CardContent>
      )}
    </Card>
  );
} 