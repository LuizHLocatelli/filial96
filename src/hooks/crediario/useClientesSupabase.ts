
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Cliente, ClienteFormValues } from "@/components/crediario/types";

export function useClientesSupabase() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar clientes ao iniciar
  useEffect(() => {
    fetchClientes();
  }, []);

  // Buscar clientes do Supabase
  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_clientes')
        .select('*')
        .order('nome');

      if (error) throw error;

      if (data) {
        const formattedClientes: Cliente[] = data.map(item => ({
          id: item.id,
          nome: item.nome,
          conta: item.conta,
          diaContato: new Date(item.dia_contato),
          diaPagamento: new Date(item.dia_pagamento),
          tipo: item.tipo as "pagamento" | "renegociacao",
          valorParcelas: item.valor_parcelas,
          contratosNegociados: item.contratos_negociados,
          valorEntrada: item.valor_entrada,
          qtdParcelas: item.qtd_parcelas,
          valorCadaParcela: item.valor_cada_parcela,
          observacao: item.observacao,
          indicator: item.indicator
        }));
        setClientes(formattedClientes);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Ocorreu um erro ao carregar os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar cliente
  const addCliente = async (data: ClienteFormValues): Promise<Cliente | null> => {
    try {
      // Transform indicator value
      const indicatorValue = data.indicator === "none" || !data.indicator ? null : data.indicator;
      
      const clienteData = {
        nome: data.nome,
        conta: data.conta,
        dia_contato: format(data.diaContato, 'yyyy-MM-dd'),
        dia_pagamento: format(data.diaPagamento, 'yyyy-MM-dd'),
        tipo: data.tipo,
        valor_parcelas: data.valorParcelas,
        contratos_negociados: data.contratosNegociados,
        valor_entrada: data.valorEntrada,
        qtd_parcelas: data.qtdParcelas,
        valor_cada_parcela: data.valorCadaParcela,
        observacao: data.observacao,
        indicator: indicatorValue,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };
      
      const { data: newCliente, error } = await supabase
        .from('crediario_clientes')
        .insert(clienteData)
        .select();
        
      if (error) throw error;
      
      if (newCliente && newCliente[0]) {
        const cliente: Cliente = {
          id: newCliente[0].id,
          nome: newCliente[0].nome,
          conta: newCliente[0].conta,
          diaContato: new Date(newCliente[0].dia_contato),
          diaPagamento: new Date(newCliente[0].dia_pagamento),
          tipo: newCliente[0].tipo as "pagamento" | "renegociacao",
          valorParcelas: newCliente[0].valor_parcelas,
          contratosNegociados: newCliente[0].contratos_negociados,
          valorEntrada: newCliente[0].valor_entrada,
          qtdParcelas: newCliente[0].qtd_parcelas,
          valorCadaParcela: newCliente[0].valor_cada_parcela,
          observacao: newCliente[0].observacao,
          indicator: newCliente[0].indicator
        };
        
        setClientes(prevClientes => [...prevClientes, cliente]);
        
        toast({
          title: "Cliente adicionado",
          description: "O cliente foi adicionado com sucesso.",
        });
        
        return cliente;
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Ocorreu um erro ao adicionar o cliente.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Atualizar cliente
  const updateCliente = async (clienteId: string, data: ClienteFormValues): Promise<Cliente | null> => {
    try {
      // Transform indicator value
      const indicatorValue = data.indicator === "none" || !data.indicator ? null : data.indicator;
      
      const clienteData = {
        nome: data.nome,
        conta: data.conta,
        dia_contato: format(data.diaContato, 'yyyy-MM-dd'),
        dia_pagamento: format(data.diaPagamento, 'yyyy-MM-dd'),
        tipo: data.tipo,
        valor_parcelas: data.valorParcelas,
        contratos_negociados: data.contratosNegociados,
        valor_entrada: data.valorEntrada,
        qtd_parcelas: data.qtdParcelas,
        valor_cada_parcela: data.valorCadaParcela,
        observacao: data.observacao,
        indicator: indicatorValue
      };
      
      const { data: updatedData, error } = await supabase
        .from('crediario_clientes')
        .update(clienteData)
        .eq('id', clienteId)
        .select();
        
      if (error) throw error;
      
      if (updatedData && updatedData[0]) {
        const cliente: Cliente = {
          id: updatedData[0].id,
          nome: updatedData[0].nome,
          conta: updatedData[0].conta,
          diaContato: new Date(updatedData[0].dia_contato),
          diaPagamento: new Date(updatedData[0].dia_pagamento),
          tipo: updatedData[0].tipo as "pagamento" | "renegociacao",
          valorParcelas: updatedData[0].valor_parcelas,
          contratosNegociados: updatedData[0].contratos_negociados,
          valorEntrada: updatedData[0].valor_entrada,
          qtdParcelas: updatedData[0].qtd_parcelas,
          valorCadaParcela: updatedData[0].valor_cada_parcela,
          observacao: updatedData[0].observacao,
          indicator: updatedData[0].indicator
        };
        
        setClientes(prevClientes => 
          prevClientes.map(c => c.id === clienteId ? cliente : c)
        );
        
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
        
        return cliente;
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Excluir cliente
  const deleteCliente = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crediario_clientes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setClientes(prevClientes => prevClientes.filter(c => c.id !== id));
      
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao remover cliente",
        description: "Ocorreu um erro ao remover o cliente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    clientes,
    isLoading,
    addCliente,
    updateCliente,
    deleteCliente,
    refreshClientes: fetchClientes
  };
}
