import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CameraCapture } from "./CameraCapture";
import { FreteItem, NotaFiscalData, Frete } from "@/types/frete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { useFileUpload } from "@/hooks/moveis/useFileUpload";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFreteCreated: () => void;
  editingFrete?: Frete | null;
}

export function FreteDialog({ open, onOpenChange, onFreteCreated, editingFrete }: FreteDialogProps) {
  const [formData, setFormData] = useState({
    cpf_cliente: "",
    nome_cliente: "",
    telefone: "",
    endereco_entrega: "",
    valor_total_nota: "",
    valor_frete: "",
    pago: false,
    status: "Pendente de Entrega",
  });
  const [itens, setItens] = useState<FreteItem[]>([]);
  const [notaFiscalUrl, setNotaFiscalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const { uploadFile } = useFileUpload();
  const { getMobileDialogProps } = useMobileDialog();

  const isEditing = !!editingFrete;

  // Preencher formulário quando for edição
  useEffect(() => {
    if (editingFrete && open) {
      let itensArray = [];
      try {
        itensArray = Array.isArray(editingFrete.itens) 
          ? editingFrete.itens 
          : JSON.parse(editingFrete.itens || '[]');
      } catch {
        itensArray = [];
      }

      setFormData({
        cpf_cliente: editingFrete.cpf_cliente || "",
        nome_cliente: editingFrete.nome_cliente || "",
        telefone: formatPhoneNumber(editingFrete.telefone || ""),
        endereco_entrega: editingFrete.endereco_entrega || "",
        valor_total_nota: editingFrete.valor_total_nota?.toString() || "",
        valor_frete: editingFrete.valor_frete?.toString() || "",
        pago: editingFrete.pago || false,
        status: editingFrete.status || "Pendente de Entrega",
      });
      
      setItens(itensArray);
      setNotaFiscalUrl(editingFrete.nota_fiscal_url || "");
    } else if (!editingFrete && open) {
      // Reset form para novo frete
      setFormData({
        cpf_cliente: "",
        nome_cliente: "",
        telefone: "",
        endereco_entrega: "",
        valor_total_nota: "",
        valor_frete: "",
        pago: false,
        status: "Pendente de Entrega",
      });
      setItens([]);
      setNotaFiscalUrl("");
    }
  }, [editingFrete, open]);

  const handleImageCaptured = async (imageUrl: string) => {
    setProcessingImage(true);
    try {
      console.log('Processing image with OpenAI...');
      
      const { data, error } = await supabase.functions.invoke('process-nota-fiscal', {
        body: { image: imageUrl }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        toast({
          title: "Erro",
          description: "Erro ao processar imagem da nota fiscal",
          variant: "destructive",
        });
        return;
      }

      console.log('Response from Edge Function:', data);
      
      if (data.success && data.data) {
        const notaData: NotaFiscalData = data.data;
        
        // Check if we got meaningful data
        const hasData = notaData.cpf_cliente || notaData.nome_cliente || notaData.valor_total_nota || (notaData.itens && notaData.itens.length > 0);
        
        setFormData(prev => ({
          ...prev,
          cpf_cliente: notaData.cpf_cliente || "",
          nome_cliente: notaData.nome_cliente || "",
          valor_total_nota: notaData.valor_total_nota || "",
        }));
        
        setItens(notaData.itens || []);
        setNotaFiscalUrl(imageUrl);
        
        if (hasData) {
          // Create detailed success message
          const extractedItems = notaData.itens?.length || 0;
          const totalValue = notaData.valor_total_nota;
          
          let description = "Dados da nota fiscal extraídos com sucesso!";
          if (extractedItems > 0 && totalValue) {
            description += ` Encontrados ${extractedItems} item(ns) com valor total de R$ ${parseFloat(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
          } else if (extractedItems > 0) {
            description += ` Encontrados ${extractedItems} item(ns).`;
          } else if (totalValue) {
            description += ` Valor total: R$ ${parseFloat(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
          }
          
          toast({
            title: "Sucesso",
            description: description,
          });
        } else {
          toast({
            title: "Aviso",
            description: "IA não conseguiu extrair dados da nota fiscal. Verifique a qualidade da imagem e preencha os dados manualmente.",
            variant: "default",
          });
        }
      } else if (data.fallback) {
        // Handle fallback response - service temporarily unavailable
        const notaData: NotaFiscalData = data.data || {
          cpf_cliente: "",
          nome_cliente: "",
          valor_total_nota: "",
          itens: []
        };
        
        setFormData(prev => ({
          ...prev,
          cpf_cliente: notaData.cpf_cliente || "",
          nome_cliente: notaData.nome_cliente || "",
          valor_total_nota: notaData.valor_total_nota || "",
        }));
        
        setItens(notaData.itens || []);
        setNotaFiscalUrl(imageUrl);
        
        toast({
          title: "Aviso",
          description: data.error || "Erro ao interpretar resposta da IA. Preencha os dados manualmente.",
          variant: "default",
        });
        
        // Log debug info if available
        if (data.debug) {
          console.error('Debug info:', data.debug);
        }
      } else {
        console.error('Unexpected response structure:', data);
        toast({
          title: "Erro",
          description: data.error || "Erro ao processar nota fiscal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar imagem",
        variant: "destructive",
      });
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome_cliente || !formData.telefone || !formData.endereco_entrega || !formData.valor_frete) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const freteData = {
        cpf_cliente: formData.cpf_cliente || null,
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        endereco_entrega: formData.endereco_entrega,
        valor_total_nota: formData.valor_total_nota ? parseFloat(formData.valor_total_nota) : null,
        valor_frete: parseFloat(formData.valor_frete),
        pago: formData.pago,
        status: formData.status,
        nota_fiscal_url: notaFiscalUrl || null,
        itens: JSON.stringify(itens),
      };

      let error;

      if (isEditing && editingFrete) {
        // Atualizar frete existente
        const result = await supabase
          .from('fretes')
          .update(freteData)
          .eq('id', editingFrete.id);
        error = result.error;
      } else {
        // Criar novo frete
        const { data: userData } = await supabase.auth.getUser();
        const result = await supabase
          .from('fretes')
          .insert({
            ...freteData,
            created_by: userData.user?.id,
          });
        error = result.error;
      }

      if (error) {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} frete:`, error);
        toast({
          title: "Erro",
          description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} frete`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Frete ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      });
      
      // Reset form
      setFormData({
        cpf_cliente: "",
        nome_cliente: "",
        telefone: "",
        endereco_entrega: "",
        valor_total_nota: "",
        valor_frete: "",
        pago: false,
        status: "Pendente de Entrega",
      });
      setItens([]);
      setNotaFiscalUrl("");
      
      onFreteCreated();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("large")}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Frete' : 'Novo Frete'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Captura da Nota Fiscal
            </Label>
            <CameraCapture onImageCaptured={handleImageCaptured} />
            {processingImage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Processando imagem...</span>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="cpf_cliente">CPF do Cliente</Label>
              <Input
                id="cpf_cliente"
                value={formData.cpf_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf_cliente: e.target.value }))}
                placeholder="Apenas números"
              />
            </div>

            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, telefone: formatted }));
                }}
                placeholder="(51) 99156-8395"
                required
              />
            </div>

            <div>
              <Label htmlFor="endereco_entrega">Endereço de Entrega *</Label>
              <Textarea
                id="endereco_entrega"
                value={formData.endereco_entrega}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco_entrega: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="valor_total_nota">Valor Total da Nota Fiscal</Label>
              <Input
                id="valor_total_nota"
                type="number"
                step="0.01"
                value={formData.valor_total_nota}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_total_nota: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="valor_frete">Valor do Frete *</Label>
              <Input
                id="valor_frete"
                type="number"
                step="0.01"
                value={formData.valor_frete}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_frete: e.target.value }))}
                required
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pago"
                checked={formData.pago}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pago: checked }))}
              />
              <Label htmlFor="pago">Pago</Label>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
      <Select
        value={formData.status}
        onValueChange={(value: string) => 
          setFormData(prev => ({ ...prev, status: value }))
        }
      >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente de Entrega">Pendente de Entrega</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {itens.length > 0 && (
            <div>
              <Label className="text-base font-medium mb-3 block">
                Itens da Nota Fiscal
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {itens.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Código: {item.codigo} | Qty: {item.quantidade} | Valor: R$ {item.valor_total_item}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Atualizar Frete' : 'Criar Frete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}