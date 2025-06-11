import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cliente } from "@/components/crediario/types";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Phone,
  MessageSquare 
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { lazy, Suspense } from 'react';

const MetricsChart = lazy(() => import('./MetricsChart').then(module => ({ default: module.MetricsChart })));
const ContactsChart = lazy(() => import('./ContactsChart').then(module => ({ default: module.ContactsChart })));
import { AlertsSystem } from "../alerts/AlertsSystem";

interface ClientesDashboardProps {
  clientes: Cliente[];
}

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-48 w-full" />
    </CardContent>
  </Card>
);

export function ClientesDashboard({ clientes }: ClientesDashboardProps) {
  const { toast } = useToast();
  
  // Calcular métricas
  const totalClientes = clientes.length;
  const clientesPagamento = clientes.filter(c => c.tipo === "pagamento").length;
  const clientesRenegociacao = clientes.filter(c => c.tipo === "renegociacao").length;
  
  // Simular dados de inadimplência (baseado nos indicadores existentes)
  const fpd = clientes.filter(c => c.indicator === "FPD").length;
  const m1 = clientes.filter(c => c.indicator === "M1").length;
  const m2 = clientes.filter(c => c.indicator === "M2").length;
  const m3 = clientes.filter(c => c.indicator === "M3").length;
  
  const taxaSucesso = totalClientes > 0 ? Math.round((clientesPagamento / totalClientes) * 100) : 0;

  // Função para calcular dias em atraso
  const calcularDiasAtraso = (cliente: Cliente): number => {
    const hoje = new Date();
    const diasAtraso = differenceInDays(hoje, cliente.diaPagamento);
    return Math.max(0, diasAtraso);
  };

  // Função para WhatsApp em massa - clientes atrasados
  const handleWhatsAppAtrasados = () => {
    const clientesAtrasados = clientes.filter(c => calcularDiasAtraso(c) > 0);
    
    if (clientesAtrasados.length === 0) {
      toast({
        title: "Nenhum cliente em atraso",
        description: "Todos os clientes estão em dia com os pagamentos.",
      });
      return;
    }

    // Template para clientes atrasados
    const templateAtraso = (cliente: Cliente) => {
      const diasAtraso = calcularDiasAtraso(cliente);
      const valorDevido = parseFloat(cliente.valorParcelas || "0");
      
      return `⚠️ LEMBRETE DE PAGAMENTO - ${cliente.nome}

Seu pagamento está em atraso há ${diasAtraso} dias.

💰 Valor: R$ ${valorDevido.toFixed(2)}
📅 Vencimento: ${format(cliente.diaPagamento, "dd/MM/yyyy", { locale: ptBR })}

Para regularizar:
✅ PIX imediato
✅ Renegociação disponível

Entre em contato conosco para evitar maiores complicações.

Atenciosamente,
Equipe Filial 96`;
    };

    let sucessos = 0;
    
    try {
      clientesAtrasados.forEach((cliente) => {
        const mensagem = templateAtraso(cliente);
        const encodedMessage = encodeURIComponent(mensagem);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          sucessos++;
        }, sucessos * 1500); // 1.5 segundos de delay
      });

      toast({
        title: "WhatsApp para clientes atrasados",
        description: `Enviando mensagens para ${clientesAtrasados.length} clientes em atraso.`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Erro no envio:', error);
      toast({
        title: "Erro no envio",
        description: "Ocorreu um erro ao tentar enviar as mensagens.",
        variant: "destructive"
      });
    }
  };
  
  // Dados para os gráficos
  const metricsData = [
    { name: "FPD", value: fpd, color: "#ef4444" },
    { name: "M1", value: m1, color: "#f97316" },
    { name: "M2", value: m2, color: "#eab308" },
    { name: "M3", value: m3, color: "#dc2626" }
  ];

  return (
    <div className="space-y-6">
      {/* Sistema de Alertas */}
      <AlertsSystem clientes={clientes} />

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-card dark:bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Clientes</p>
                <p className="text-2xl font-bold text-foreground">{totalClientes}</p>
              </div>
              <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-card dark:bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Inadimplentes</p>
                <p className="text-2xl font-bold text-foreground">{fpd + m1 + m2 + m3}</p>
              </div>
              <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-card dark:bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-foreground">{taxaSucesso}%</p>
              </div>
              <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-card dark:bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Renegociações</p>
                <p className="text-2xl font-bold text-foreground">{clientesRenegociacao}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Status de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metricsData.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{metric.name}</span>
                <Badge variant="outline" style={{ color: metric.color, borderColor: metric.color }}>
                  {metric.value} clientes
                </Badge>
              </div>
              <Progress 
                value={totalClientes > 0 ? (metric.value / totalClientes) * 100 : 0} 
                className="h-2"
                style={{ '--progress-foreground': metric.color } as React.CSSProperties}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <MetricsChart data={metricsData} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <ContactsChart clientes={clientes} />
        </Suspense>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas de Cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Ligações Pendentes</h4>
                  <p className="text-sm text-muted-foreground">{fpd + m1} clientes</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={handleWhatsAppAtrasados}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-full">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">Envio em massa</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-full">
                  <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium">Follow-ups</h4>
                  <p className="text-sm text-muted-foreground">{m2 + m3} agendados</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
