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
import { MetricsChart } from "./MetricsChart";
import { ContactsChart } from "./ContactsChart";
import { AlertsSystem } from "../alerts/AlertsSystem";

interface ClientesDashboardProps {
  clientes: Cliente[];
}

export function ClientesDashboard({ clientes }: ClientesDashboardProps) {
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
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-900">{totalClientes}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Inadimplentes</p>
                <p className="text-2xl font-bold text-red-900">{fpd + m1 + m2 + m3}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-green-900">{taxaSucesso}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Renegociações</p>
                <p className="text-2xl font-bold text-yellow-900">{clientesRenegociacao}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
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
        <MetricsChart data={metricsData} />
        <ContactsChart clientes={clientes} />
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
                <div className="p-2 bg-blue-100 rounded-full">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Ligações Pendentes</h4>
                  <p className="text-sm text-muted-foreground">{fpd + m1} clientes</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">Envio em massa</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
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
