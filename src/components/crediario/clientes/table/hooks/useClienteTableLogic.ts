
import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/components/crediario/types";
import { calcularDiasAtraso } from "../utils/clienteUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useClienteTableLogic = (clientes: Cliente[]) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Cliente | "diasAtraso">("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleWhatsAppMassa = () => {
    if (selectedClientes.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para enviar mensagens.",
        variant: "destructive"
      });
      return;
    }

    const clientesSelecionados = clientes.filter(cliente => 
      selectedClientes.includes(cliente.id)
    );

    const templateMassa = (cliente: Cliente) => {
      const diasAtraso = calcularDiasAtraso(cliente);
      const valorDevido = parseFloat(cliente.valorParcelas || "0");
      
      return `Olá ${cliente.nome}! 

Esperamos que esteja tudo bem. Este é um lembrete sobre seu pagamento${diasAtraso > 0 ? ` que está em atraso há ${diasAtraso} dias` : ' que vence hoje'}.

💰 Valor: R$ ${valorDevido.toFixed(2)}
📅 Vencimento: ${format(cliente.diaPagamento, "dd/MM/yyyy", { locale: ptBR })}

Para regularizar, você pode:
✅ Pagar via PIX
✅ Entrar em contato para renegociar

Estamos aqui para ajudar! Responda esta mensagem ou ligue para nós.

Atenciosamente,
Equipe Filial 96`;
    };

    let sucessos = 0;
    
    try {
      clientesSelecionados.forEach((cliente) => {
        const mensagem = templateMassa(cliente);
        const encodedMessage = encodeURIComponent(mensagem);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          sucessos++;
        }, sucessos * 1000);
      });

      toast({
        title: "WhatsApp em massa iniciado",
        description: `Enviando mensagens para ${clientesSelecionados.length} clientes. Uma nova aba será aberta para cada cliente.`,
        duration: 5000
      });

      setSelectedClientes([]);
      
    } catch (error) {
      console.error('Erro no envio em massa:', error);
      toast({
        title: "Erro no envio",
        description: "Ocorreu um erro ao tentar enviar as mensagens.",
        variant: "destructive"
      });
    }
  };

  const handleListaLigacoes = () => {
    if (selectedClientes.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para gerar a lista de ligações.",
        variant: "destructive"
      });
      return;
    }

    const clientesSelecionados = clientes.filter(cliente => 
      selectedClientes.includes(cliente.id)
    );

    const listaLigacoes = clientesSelecionados.map((cliente, index) => {
      const diasAtraso = calcularDiasAtraso(cliente);
      const valorDevido = parseFloat(cliente.valorParcelas || "0");
      
      return `${index + 1}. ${cliente.nome}
   📞 Conta: ${cliente.conta}
   💰 Valor: R$ ${valorDevido.toFixed(2)}
   ⏰ ${diasAtraso > 0 ? `${diasAtraso} dias em atraso` : 'Vence hoje'}
   📅 Vencimento: ${format(cliente.diaPagamento, "dd/MM/yyyy", { locale: ptBR })}
   📝 Observação: ${cliente.observacao || 'Nenhuma'}
   `;
    }).join('\n');

    const conteudoCompleto = `LISTA DE LIGAÇÕES - ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
========================================

Total de clientes: ${clientesSelecionados.length}

${listaLigacoes}

========================================
Gerado automaticamente pelo Sistema Filial 96`;

    navigator.clipboard.writeText(conteudoCompleto).then(() => {
      toast({
        title: "Lista de ligações gerada",
        description: `Lista com ${clientesSelecionados.length} clientes copiada para a área de transferência.`,
        duration: 5000
      });
    }).catch(() => {
      const blob = new Blob([conteudoCompleto], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lista-ligacoes-${format(new Date(), "yyyy-MM-dd-HHmm")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Lista de ligações baixada",
        description: `Arquivo com ${clientesSelecionados.length} clientes foi baixado.`,
        duration: 5000
      });
    });

    setSelectedClientes([]);
  };

  const filteredAndSortedClientes = useMemo(() => {
    let filtered = clientes.filter(cliente => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.conta.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || 
                           (filterStatus === "atrasados" && calcularDiasAtraso(cliente) > 0) ||
                           (filterStatus === "em_dia" && calcularDiasAtraso(cliente) === 0) ||
                           cliente.indicator === filterStatus;
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "diasAtraso") {
        aValue = calcularDiasAtraso(a);
        bValue = calcularDiasAtraso(b);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clientes, searchTerm, filterStatus, sortField, sortDirection]);

  const handleSort = (field: keyof Cliente | "diasAtraso") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectCliente = (clienteId: string, checked: boolean) => {
    if (checked) {
      setSelectedClientes(prev => [...prev, clienteId]);
    } else {
      setSelectedClientes(prev => prev.filter(id => id !== clienteId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClientes(filteredAndSortedClientes.map(c => c.id));
    } else {
      setSelectedClientes([]);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedClientes,
    sortField,
    sortDirection,
    filteredAndSortedClientes,
    handleSort,
    handleSelectCliente,
    handleSelectAll,
    handleWhatsAppMassa,
    handleListaLigacoes,
  };
};
