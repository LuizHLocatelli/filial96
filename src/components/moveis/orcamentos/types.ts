export interface OrcamentoItem {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ClienteOrcamento {
  nome: string;
  documento: string; // CPF ou CNPJ
  telefone: string;
  email: string;
  endereco: string;
}

export interface OrcamentoData {
  cliente: ClienteOrcamento;
  itens: OrcamentoItem[];
  validade: string; // Data ou texto (ex: "15 dias")
  observacoes: string;
  valorTotal: number;
  dataCriacao: Date;
}
