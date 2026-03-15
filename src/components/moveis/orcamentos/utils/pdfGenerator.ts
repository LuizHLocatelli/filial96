import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBrazilianCurrency } from "@/utils/numberFormatter";
import { OrcamentoData } from "../types";

export const generateOrcamentoPdf = (data: OrcamentoData) => {
  // Configuração inicial do documento (A4, Retrato)
  const doc = new jsPDF("p", "mm", "a4");
  
  // Constantes de formatação
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN_LEFT = 15;
  const MARGIN_RIGHT = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // --- Função para desenhar a borda da página ---
  const drawPageBorder = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, PAGE_WIDTH - 10, PAGE_HEIGHT - 10);
  };

  drawPageBorder();

  // --- CABEÇALHO ---
  let cursorY = 20;

  // Título Lojas Lebes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(33, 37, 41); // Dark gray
  doc.text("Lojas Lebes", MARGIN_LEFT, cursorY);

  // Subtítulo "Orçamento"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text("ORÇAMENTO / PROPOSTA COMERCIAL", PAGE_WIDTH - MARGIN_RIGHT, cursorY, { align: "right" });

  cursorY += 8;

  // Dados da Empresa
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  const companyInfo = [
    "Razão Social: DREBES & CIA LTDA",
    "CNPJ: 96.662.168/0118-42",
    "Atividade: Comércio varejista de móveis (CNAE 4754-7/01)",
    "Endereço: Avenida Barão do Rio Branco, 620 - Centro, Torres - RS"
  ];

  companyInfo.forEach(line => {
    doc.text(line, MARGIN_LEFT, cursorY);
    cursorY += 5;
  });

  // Data de Emissão e Validade
  cursorY -= 20; // Volta para alinhar com o começo dos dados da empresa, mas na direita
  doc.text(`Data de Emissão: ${data.dataCriacao.toLocaleDateString('pt-BR')}`, PAGE_WIDTH - MARGIN_RIGHT, cursorY, { align: "right" });
  cursorY += 5;
  if (data.validade) {
    doc.text(`Válido até: ${data.validade}`, PAGE_WIDTH - MARGIN_RIGHT, cursorY, { align: "right" });
  }

  // Linha separadora
  cursorY = Math.max(cursorY + 25, 50); // Garante que passou do cabeçalho
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, cursorY, PAGE_WIDTH - MARGIN_RIGHT, cursorY);
  cursorY += 10;

  // --- DADOS DO CLIENTE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(33, 37, 41);
  doc.text("DADOS DO CLIENTE", MARGIN_LEFT, cursorY);
  cursorY += 6;

  // Quadro de dados do cliente
  doc.setFillColor(248, 249, 250); // Fundo cinza bem claro
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(MARGIN_LEFT, cursorY, CONTENT_WIDTH, 25, 2, 2, "FD"); // Fill and Draw

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const clienteTextY = cursorY + 7;
  
  // Coluna 1
  doc.text(`Nome/Razão Social: ${data.cliente.nome || "Não informado"}`, MARGIN_LEFT + 5, clienteTextY);
  doc.text(`CPF/CNPJ: ${data.cliente.documento || "Não informado"}`, MARGIN_LEFT + 5, clienteTextY + 6);
  doc.text(`Endereço: ${data.cliente.endereco || "Não informado"}`, MARGIN_LEFT + 5, clienteTextY + 12);

  // Coluna 2
  const midX = PAGE_WIDTH / 2 + 10;
  doc.text(`Telefone: ${data.cliente.telefone || "Não informado"}`, midX, clienteTextY);
  doc.text(`E-mail: ${data.cliente.email || "Não informado"}`, midX, clienteTextY + 6);

  cursorY += 35; // Pula o quadro + margem

  // --- TABELA DE ITENS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(33, 37, 41);
  doc.text("ITENS ORÇADOS", MARGIN_LEFT, cursorY);
  cursorY += 4;

  const tableData = data.itens.map((item, index) => [
    (index + 1).toString(),
    item.quantidade.toString(),
    item.nome,
    formatBrazilianCurrency(item.valorUnitario),
    formatBrazilianCurrency(item.valorTotal)
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Item', 'Qtd', 'Descrição do Produto', 'Valor Unitário', 'Valor Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240], // Fundo claro para o cabeçalho
      textColor: [40, 40, 40],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1
    },
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    didDrawPage: function (data) {
      drawPageBorder();
    }
  });

  // @ts-expect-error - jspdf-autotable adiciona lastAutoTable ao doc
  cursorY = doc.lastAutoTable.finalY + 10;

  // --- RESUMO E TOTAL ---
  const totalBoxWidth = 80;
  const totalBoxX = PAGE_WIDTH - MARGIN_RIGHT - totalBoxWidth;
  
  doc.setFillColor(240, 248, 255); // Azul bem clarinho
  doc.setDrawColor(200, 220, 240);
  doc.roundedRect(totalBoxX, cursorY, totalBoxWidth, 15, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("VALOR TOTAL:", totalBoxX + 5, cursorY + 10);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204); // Azul escuro
  doc.text(formatBrazilianCurrency(data.valorTotal), totalBoxX + totalBoxWidth - 5, cursorY + 10, { align: "right" });

  cursorY += 30;

  // --- OBSERVAÇÕES ---
  if (data.observacoes) {
    // Verifica se precisa de nova página para as observações
    if (cursorY + 30 > PAGE_HEIGHT - 20) {
      doc.addPage();
      drawPageBorder();
      cursorY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    doc.text("OBSERVAÇÕES", MARGIN_LEFT, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    // Divide o texto para caber na largura
    const splitText = doc.splitTextToSize(data.observacoes, CONTENT_WIDTH);
    doc.text(splitText, MARGIN_LEFT, cursorY);
  }

  // --- RODAPÉ ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Documento gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: "center" }
    );
  }

  // Nome do arquivo
  const fileName = `Orcamento_Lebes_${data.cliente.nome ? data.cliente.nome.replace(/\s+/g, '_') : 'Avulso'}_${new Date().getTime()}.pdf`;
  
  // Salva o PDF
  doc.save(fileName);
};