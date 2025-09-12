import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Frete } from "@/types/frete";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package, User, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface FretesListProps {
  onFreteClick: (frete: Frete) => void;
  refreshTrigger: number;
}

export function FretesList({ onFreteClick, refreshTrigger }: FretesListProps) {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFretes();
  }, [refreshTrigger]);

  const fetchFretes = async () => {
    try {
      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fretes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar fretes",
          variant: "destructive",
        });
        return;
      }

      setFretes((data || []) as Frete[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar fretes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (fretes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum frete cadastrado</p>
          <p className="text-muted-foreground">Clique em "Novo Frete" para começar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fretes.map((frete) => (
        <Card 
          key={frete.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFreteClick(frete)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base truncate">
                  {frete.nome_cliente}
                </CardTitle>
              </div>
              <Badge variant={frete.status === 'Entregue' ? 'default' : 'secondary'}>
                {frete.status}
              </Badge>
            </div>
            {frete.cpf_cliente && (
              <p className="text-sm text-muted-foreground">
                CPF: {frete.cpf_cliente}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor da Nota:</span>
              <span className="font-medium">
                {frete.valor_total_nota 
                  ? `R$ ${frete.valor_total_nota.toFixed(2)}`
                  : "N/A"
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor do Frete:</span>
              <span className="font-medium flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                R$ {frete.valor_frete.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pago:</span>
              <div className="flex items-center">
                {frete.pago ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="ml-1 text-sm">
                  {frete.pago ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}