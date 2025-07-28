import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Produto {
  id: string;
  codigo_produto: string;
  setor: "masculino" | "feminino" | "infantil";
  quantidade: number;
  created_at: string;
}

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
}

interface EstoquePDFExportOptions {
  includeDate: boolean;
  includeStats: boolean;
  groupBySetor: boolean;
  includeTotal: boolean;
}

export function useEstoquePDFExport() {
  const { toast } = useToast();

  const exportToPDF = async (
    contagem: Contagem,
    produtos: Produto[],
    options: EstoquePDFExportOptions
  ): Promise<boolean> => {
    try {
      // Verificar se há produtos para exportar
      if (!produtos || produtos.length === 0) {
        toast({
          title: "Nenhum produto para exportar",
          description: "A contagem deve ter pelo menos um produto para gerar o PDF.",
          variant: "destructive"
        });
        return false;
      }

      const doc = new jsPDF();
      let yPosition = 20;

      // Configurar fonte padrão
      doc.setFont("helvetica", "normal");
      
      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Contagem de Estoque", 20, yPosition);
      yPosition += 15;

      // Nome da contagem
      doc.setFontSize(14);
      doc.text(contagem.nome, 20, yPosition);
      yPosition += 10;

      // Data se solicitado
      if (options.includeDate) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const dataFormatada = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Gerado em: ${dataFormatada}`, 20, yPosition);
        yPosition += 15;
      }

      // Status da contagem
      const statusText = contagem.status === "em_andamento" ? "Em Andamento" : "Finalizada";
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Status: ${statusText}`, 20, yPosition);
      yPosition += 15;

      // Estatísticas se solicitado
      if (options.includeStats) {
        const totalProdutos = produtos.length;
        const totalUnidades = produtos.reduce((acc, p) => acc + p.quantidade, 0);
        const estatisticasPorSetor = produtos.reduce((acc, produto) => {
          if (!acc[produto.setor]) {
            acc[produto.setor] = { produtos: 0, unidades: 0 };
          }
          acc[produto.setor].produtos++;
          acc[produto.setor].unidades += produto.quantidade;
          return acc;
        }, {} as Record<string, { produtos: number; unidades: number }>);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Estatísticas Gerais:", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total de produtos diferentes: ${totalProdutos}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Total de unidades: ${totalUnidades}`, 20, yPosition);
        yPosition += 10;

        // Estatísticas por setor
        Object.entries(estatisticasPorSetor).forEach(([setor, stats]) => {
          const setorNome = setor.charAt(0).toUpperCase() + setor.slice(1);
          doc.text(`${setorNome}: ${stats.produtos} produtos, ${stats.unidades} unidades`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Produtos
      if (options.groupBySetor) {
        // Agrupar por setor
        const produtosPorSetor = produtos.reduce((acc, produto) => {
          if (!acc[produto.setor]) {
            acc[produto.setor] = [];
          }
          acc[produto.setor].push(produto);
          return acc;
        }, {} as Record<string, Produto[]>);

        Object.entries(produtosPorSetor).forEach(([setor, produtosSetor]) => {
          // Verificar espaço na página
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          const setorNome = setor.charAt(0).toUpperCase() + setor.slice(1);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(`Setor ${setorNome}`, 20, yPosition);
          yPosition += 8;

          // Tabela de produtos do setor
          const tableData = produtosSetor.map(produto => [
            produto.codigo_produto,
            produto.quantidade.toString(),
            new Date(produto.created_at).toLocaleDateString('pt-BR')
          ]);

          (doc as any).autoTable({
            head: [['Código', 'Quantidade', 'Data Cadastro']],
            body: tableData,
            startY: yPosition,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [66, 139, 202] },
            margin: { left: 20, right: 20 }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        });
      } else {
        // Lista única
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Lista de Produtos", 20, yPosition);
        yPosition += 8;

        const tableData = produtos.map(produto => [
          produto.codigo_produto,
          produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1),
          produto.quantidade.toString(),
          new Date(produto.created_at).toLocaleDateString('pt-BR')
        ]);

        (doc as any).autoTable({
          head: [['Código', 'Setor', 'Quantidade', 'Data Cadastro']],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: 20, right: 20 }
        });
      }

      // Total no final se solicitado
      if (options.includeTotal) {
        const totalUnidades = produtos.reduce((acc, p) => acc + p.quantidade, 0);
        const currentY = (doc as any).lastAutoTable?.finalY || yPosition;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Geral: ${produtos.length} produtos, ${totalUnidades} unidades`, 20, currentY + 15);
      }

      // Salvar PDF
      const fileName = `contagem-estoque-${contagem.nome.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo "${fileName}" foi baixado.`,
      });

      return true;
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      
      // Verificar se é erro específico do jsPDF
      let errorMessage = "Não foi possível gerar o arquivo PDF. Tente novamente.";
      if (error instanceof Error) {
        if (error.message.includes("autoTable")) {
          errorMessage = "Erro na geração da tabela. Verifique se há produtos na contagem.";
        } else if (error.message.includes("font")) {
          errorMessage = "Erro na fonte do PDF. Tente novamente.";
        }
      }
      
      toast({
        title: "Erro na exportação",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  return { exportToPDF };
}