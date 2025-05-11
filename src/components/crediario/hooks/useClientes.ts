
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente, ClienteFormValues } from "../types";
import { useClientesSupabase } from "@/hooks/crediario/useClientesSupabase";

export const useClientes = () => {
  const { toast } = useToast();
  const { 
    clientes, 
    isLoading, 
    addCliente: addClienteSupabase, 
    updateCliente: updateClienteSupabase, 
    deleteCliente: deleteClienteSupabase 
  } = useClientesSupabase();
  
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    
    let daysArray: Date[] = [];
    for (let i = 1; i <= days; i++) {
      daysArray.push(new Date(year, month, i));
    }
    
    return daysArray;
  };
  
  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  
  const daysInMonth = getDaysInMonth(currentMonth);
  
  // Filter clients by selected month
  const clientesNoMes = clientes.filter((cliente) => {
    const pagamentoMonth = cliente.diaPagamento.getMonth();
    const pagamentoYear = cliente.diaPagamento.getFullYear();
    return pagamentoMonth === currentMonth.getMonth() && pagamentoYear === currentMonth.getFullYear();
  });

  const addCliente = async (data: ClienteFormValues) => {
    const newCliente = await addClienteSupabase(data);
    if (newCliente) {
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
    }
  };

  const updateCliente = async (clienteId: string, data: ClienteFormValues) => {
    const updatedCliente = await updateClienteSupabase(clienteId, data);
    if (updatedCliente) {
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
    }
  };

  const deleteCliente = async (id: string) => {
    const success = await deleteClienteSupabase(id);
    if (success) {
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
    }
  };

  const openAddDialog = () => {
    setEditingCliente(null);
    setDialogOpen(true);
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setDialogOpen(true);
  };

  return {
    clientes,
    clientesNoMes,
    currentMonth,
    editingCliente,
    dialogOpen,
    daysInMonth,
    isLoading,
    setDialogOpen,
    addCliente,
    updateCliente,
    deleteCliente,
    prevMonth,
    nextMonth,
    openAddDialog,
    openEditDialog
  };
};
