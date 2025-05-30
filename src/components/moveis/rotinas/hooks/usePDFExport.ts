
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { RotinaWithStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export function usePDFExport() {
  const { toast } = useToast();

  const exportToPDF = useCallback((rotinas: RotinaWithStatus[]) => {
    try {
      const doc = new jsPDF();
      
      // Configurações iniciais
      doc.setFont('helvetica');
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      
      // Título do documento
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Rotinas - Móveis', 20, yPosition);
      yPosition += 15;
      
      // Data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
      doc.text(`Gerado em: ${dataAtual}`, 20, yPosition);
      yPosition += 20;
      
      // Estatísticas gerais
      const totalRotinas = rotinas.length;
      const concluidas = rotinas.filter(r => r.status === 'concluida').length;
      const pendentes = rotinas.filter(r => r.status === 'pendente').length;
      const atrasadas = rotinas.filter(r => r.status === 'atrasada').length;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Geral', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de rotinas: ${totalRotinas}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Concluídas: ${concluidas}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Pendentes: ${pendentes}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Atrasadas: ${atrasadas}`, 25, yPosition);
      yPosition += 20;
      
      // Agrupar rotinas por categoria
      const rotinasPorCategoria = rotinas.reduce((acc, rotina) => {
        if (!acc[rotina.categoria]) {
          acc[rotina.categoria] = [];
        }
        acc[rotina.categoria].push(rotina);
        return acc;
      }, {} as Record<string, RotinaWithStatus[]>);
      
      // Listar rotinas por categoria
      Object.entries(rotinasPorCategoria).forEach(([categoria, rotinasCategoria]) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - marginBottom - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Categoria: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`, 20, yPosition);
        yPosition += 10;
        
        rotinasCategoria.forEach((rotina) => {
          // Verificar se precisa de nova página
          if (yPosition > pageHeight - marginBottom - 40) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Status da rotina
          let statusText = '';
          let statusColor: [number, number, number] = [0, 0, 0];
          
          switch (rotina.status) {
            case 'concluida':
              statusText = '✓ Concluída';
              statusColor = [0, 128, 0];
              break;
            case 'atrasada':
              statusText = '⚠ Atrasada';
              statusColor = [255, 0, 0];
              break;
            default:
              statusText = '○ Pendente';
              statusColor = [128, 128, 128];
              break;
          }
          
          // Nome da rotina
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(rotina.nome, 25, yPosition);
          
          // Status
          doc.setTextColor(...statusColor);
          doc.text(statusText, 140, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 6;
          
          // Descrição
          if (rotina.descricao) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const descricaoLines = doc.splitTextToSize(rotina.descricao, 160);
            doc.text(descricaoLines, 30, yPosition);
            yPosition += descricaoLines.length * 4;
          }
          
          // Periodicidade e horário
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          let detalhes = `Periodicidade: ${rotina.periodicidade}`;
          if (rotina.horario_preferencial) {
            detalhes += ` | Horário: ${rotina.horario_preferencial}`;
          }
          doc.text(detalhes, 30, yPosition);
          yPosition += 8;
          
          // Linha separadora
          doc.setDrawColor(200, 200, 200);
          doc.line(25, yPosition, 185, yPosition);
          yPosition += 8;
        });
        
        yPosition += 5;
      });
      
      // Salvar o PDF
      const fileName = `rotinas-moveis-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    exportToPDF,
  };
}
