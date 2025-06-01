
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import { Cliente } from "@/components/crediario/types";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactsChartProps {
  clientes: Cliente[];
}

export function ContactsChart({ clientes }: ContactsChartProps) {
  // Simular dados de contatos dos últimos 7 dias
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const contactsData = last7Days.map(day => {
    const dayStr = format(day, 'dd/MM', { locale: ptBR });
    // Simular número de contatos baseado no número de clientes
    const contacts = Math.floor(Math.random() * clientes.length * 0.3) + 1;
    return {
      day: dayStr,
      contatos: contacts,
      acordos: Math.floor(contacts * 0.4) // 40% de taxa de acordo simulada
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Contatos dos Últimos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contactsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="contatos" fill="#3b82f6" name="Contatos" />
            <Bar dataKey="acordos" fill="#10b981" name="Acordos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
