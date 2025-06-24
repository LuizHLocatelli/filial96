import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLibraryLoader } from "@/hooks/useLazyComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface MetricsChartProps {
  data: Array<{
    mes: string;
    contatos: number;
    agendamentos: number;
  }>;
}

// Lazy load da biblioteca Recharts
const loadRechartsLibrary = () => ExternalLibraryLoader.loadLibrary(
  'recharts',
  async () => {
    const recharts = await import('recharts');
    return recharts;
  }
);

export function MetricsChart({ data }: MetricsChartProps) {
  const [recharts, setRecharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        setIsLoading(true);
        const rechartsLib = await loadRechartsLibrary();
        setRecharts(rechartsLib);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar biblioteca de charts:', err);
        setError('Erro ao carregar gráfico');
      } finally {
        setIsLoading(false);
      }
    };

    loadChart();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Atendimento</CardTitle>
          <CardDescription>
            Comparativo mensal de contatos realizados vs agendamentos concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Atendimento</CardTitle>
          <CardDescription>
            Comparativo mensal de contatos realizados vs agendamentos concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recharts) {
    return null;
  }

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = recharts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Atendimento</CardTitle>
        <CardDescription>
          Comparativo mensal de contatos realizados vs agendamentos concluídos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="contatos" 
              fill="hsl(var(--primary))" 
              name="Contatos"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="agendamentos" 
              fill="hsl(var(--muted-foreground))" 
              name="Agendamentos"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
