
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente, ClienteFormValues } from "../types";

export const useClientes = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
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

  const addCliente = (data: ClienteFormValues) => {
    const newCliente: Cliente = {
      id: Math.random().toString(36).substr(2, 9),
      nome: data.nome,
      conta: data.conta,
      diaContato: data.diaContato,
      diaPagamento: data.diaPagamento,
      tipo: data.tipo,
      valorParcelas: data.valorParcelas,
      contratosNegociados: data.contratosNegociados,
      valorEntrada: data.valorEntrada,
      qtdParcelas: data.qtdParcelas,
      valorCadaParcela: data.valorCadaParcela,
      observacao: data.observacao
    };
    setClientes([...clientes, newCliente]);
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi adicionado com sucesso.",
    });
  };

  const updateCliente = (clienteId: string, data: ClienteFormValues) => {
    const updatedClientes = clientes.map(cliente => 
      cliente.id === clienteId 
        ? { 
            ...cliente,
            nome: data.nome,
            conta: data.conta,
            diaContato: data.diaContato,
            diaPagamento: data.diaPagamento,
            tipo: data.tipo,
            valorParcelas: data.valorParcelas,
            contratosNegociados: data.contratosNegociados,
            valorEntrada: data.valorEntrada,
            qtdParcelas: data.qtdParcelas,
            valorCadaParcela: data.valorCadaParcela,
            observacao: data.observacao
          }
        : cliente
    );
    setClientes(updatedClientes);
    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    });
  };

  const deleteCliente = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso.",
    });
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
