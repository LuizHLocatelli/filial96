import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Plus, FileText, Brain } from "lucide-react";

import { ImageCapture } from "./ImageCapture";
import { useImageProcessing } from "@/hooks/moveis/useImageProcessing";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { parseBrazilianNumber, formatForInput } from "@/utils/numberFormatter";
import { toast } from "@/hooks/use-toast";

import { Frete, FreteFormData, FreteItemFormData, FreteValidationErrors } from "@/types/frete";

interface FreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFreteCreated: (formData: FreteFormData, notaFiscalUrl?: string) => Promise<boolean>;
  editingFrete?: Frete | null;
  onFreteUpdated?: (id: string, formData: Partial<FreteFormData>) => Promise<boolean>;
}

const STATUS_OPTIONS = [
  'Pendente de Entrega',
  'Em Transporte',
  'Entregue',
  'Cancelado'
] as const;

export function FreteDialog({
  open,
  onOpenChange,
  onFreteCreated,
  editingFrete,
  onFreteUpdated
}: FreteDialogProps) {
  const [formData, setFormData] = useState<FreteFormData>({
    cpf_cliente: "",
    nome_cliente: "",
    telefone: "",
    endereco_entrega: "",
    valor_total_nota: "",
    valor_frete: "",
    pago: false,
    status: "Pendente de Entrega",
    items: [],
  });

  const [notaFiscalUrl, setNotaFiscalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FreteValidationErrors>({});
  const [iaConfidence, setIaConfidence] = useState<number | null>(null);

  const { processing, processImage } = useImageProcessing();
  const { getMobileDialogProps } = useMobileDialog();

  const isEditing = !!editingFrete;

  // Preencher formulário quando for edição
  useEffect(() => {
    if (editingFrete && open) {
      setFormData({
        cpf_cliente: editingFrete.cpf_cliente || "",
        nome_cliente: editingFrete.nome_cliente || "",
        telefone: formatPhoneNumber(editingFrete.telefone || ""),
        endereco_entrega: editingFrete.endereco_entrega || "",
        valor_total_nota: editingFrete.valor_total_nota ? formatForInput(editingFrete.valor_total_nota) : "",
        valor_frete: editingFrete.valor_frete ? formatForInput(editingFrete.valor_frete) : "",
        pago: editingFrete.pago || false,
        status: editingFrete.status || "Pendente de Entrega",
        items: editingFrete.items?.map(item => ({
          codigo: item.codigo || "",
          descricao: item.descricao || "",
          quantidade: item.quantidade ? formatForInput(item.quantidade) : "1",
          valor_unitario: item.valor_unitario ? formatForInput(item.valor_unitario) : "0",
          valor_total_item: item.valor_total_item ? formatForInput(item.valor_total_item) : "0",
        })) || [],
      });

      setNotaFiscalUrl(editingFrete.nota_fiscal_url || "");
      setIaConfidence(editingFrete.processamento_ia_confidence || null);
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
        items: [],
      });
      setNotaFiscalUrl("");
      setIaConfidence(null);
    }
  }, [editingFrete, open]);

  const validateForm = (): boolean => {
    const errors: FreteValidationErrors = {};

    if (!formData.nome_cliente.trim()) {
      errors.nome_cliente = "Nome do cliente é obrigatório";
    }

    if (!formData.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    }

    if (!formData.endereco_entrega.trim()) {
      errors.endereco_entrega = "Endereço de entrega é obrigatório";
    }

    if (!formData.valor_frete || parseBrazilianNumber(formData.valor_frete) <= 0) {
      errors.valor_frete = "Valor do frete deve ser maior que zero";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageCaptured = async (imageUrl: string) => {
    setNotaFiscalUrl(imageUrl);

    const result = await processImage(imageUrl);
    if (result?.success && result.data) {
      const notaData = result.data;

      setFormData(prev => ({
        ...prev,
        cpf_cliente: notaData.cpf_cliente || prev.cpf_cliente,
        nome_cliente: notaData.nome_cliente || prev.nome_cliente,
        // Converter valor total para formato brasileiro de input
        valor_total_nota: notaData.valor_total_nota ?
          formatForInput(parseBrazilianNumber(notaData.valor_total_nota)) :
          prev.valor_total_nota,
        items: notaData.itens?.map(item => ({
          codigo: item.codigo || "",
          descricao: item.descricao || "",
          quantidade: item.quantidade || "1",
          // Converter valores monetários para formato brasileiro
          valor_unitario: item.valor_unitario ?
            formatForInput(parseBrazilianNumber(item.valor_unitario)) : "0",
          valor_total_item: item.valor_total_item ?
            formatForInput(parseBrazilianNumber(item.valor_total_item)) : "0",
        })) || prev.items,
      }));

      setIaConfidence(result.confidence || null);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let success = false;

      if (isEditing && editingFrete && onFreteUpdated) {
        success = await onFreteUpdated(editingFrete.id!, formData);
      } else {
        success = await onFreteCreated(formData, notaFiscalUrl);
      }

      if (success) {
        onOpenChange(false);
        // Reset form apenas se não estiver editando
        if (!isEditing) {
          setFormData({
            cpf_cliente: "",
            nome_cliente: "",
            telefone: "",
            endereco_entrega: "",
            valor_total_nota: "",
            valor_frete: "",
            pago: false,
            status: "Pendente de Entrega",
            items: [],
          });
          setNotaFiscalUrl("");
          setIaConfidence(null);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar frete:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        codigo: "",
        descricao: "",
        quantidade: "1",
        valor_unitario: "0",
        valor_total_item: "0",
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof FreteItemFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calcular valor total do item
          if (field === 'quantidade' || field === 'valor_unitario') {
            const quantidade = parseBrazilianNumber(field === 'quantidade' ? value : updatedItem.quantidade) || 0;
            const valorUnitario = parseBrazilianNumber(field === 'valor_unitario' ? value : updatedItem.valor_unitario) || 0;
            const total = quantidade * valorUnitario;
            updatedItem.valor_total_item = formatForInput(total);
          }

          return updatedItem;
        }
        return item;
      })
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...getMobileDialogProps("large")}
        className="max-h-[95vh] overflow-y-auto w-[95vw] max-w-4xl p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Editar Frete' : 'Novo Frete'}
            {iaConfidence !== null && (
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                IA: {iaConfidence}%
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Captura de Imagem */}
          <div>
            <Label className="text-sm sm:text-base font-medium mb-2 sm:mb-3 block">
              Nota Fiscal
            </Label>
            <ImageCapture
              onImageCaptured={handleImageCaptured}
              disabled={processing}
            />
            {processing && (
              <div className="flex items-center justify-center py-3 sm:py-4">
                <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Processando imagem com IA...</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Dados do Cliente */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-medium">Dados do Cliente</Label>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cpf_cliente">CPF do Cliente</Label>
                <Input
                  id="cpf_cliente"
                  value={formData.cpf_cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf_cliente: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
                <Input
                  id="nome_cliente"
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                  required
                  error={validationErrors.nome_cliente}
                />
                {validationErrors.nome_cliente && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.nome_cliente}</p>
                )}
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
                  placeholder="(11) 99999-9999"
                  required
                  error={validationErrors.telefone}
                />
                {validationErrors.telefone && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.telefone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco_entrega">Endereço de Entrega *</Label>
              <Textarea
                id="endereco_entrega"
                value={formData.endereco_entrega}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco_entrega: e.target.value }))}
                required
                error={validationErrors.endereco_entrega}
                rows={3}
              />
              {validationErrors.endereco_entrega && (
                <p className="text-sm text-destructive mt-1">{validationErrors.endereco_entrega}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Dados Financeiros */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-medium">Dados Financeiros</Label>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="valor_total_nota">Valor Total da Nota Fiscal</Label>
                <CurrencyInput
                  id="valor_total_nota"
                  value={formData.valor_total_nota}
                  onChange={(value) => setFormData(prev => ({ ...prev, valor_total_nota: value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="valor_frete">Valor do Frete *</Label>
                <CurrencyInput
                  id="valor_frete"
                  value={formData.valor_frete}
                  onChange={(value) => setFormData(prev => ({ ...prev, valor_frete: value }))}
                  required
                  placeholder="0,00"
                  className={validationErrors.valor_frete ? "border-destructive" : ""}
                />
                {validationErrors.valor_frete && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.valor_frete}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pago"
                checked={formData.pago}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pago: checked }))}
              />
              <Label htmlFor="pago">Frete Pago</Label>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Itens da Nota Fiscal */}
          {formData.items.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label className="text-sm sm:text-base font-medium">
                    Itens da Nota Fiscal ({formData.items.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`codigo-${index}`} className="text-xs sm:text-sm">Código</Label>
                          <Input
                            id={`codigo-${index}`}
                            value={item.codigo}
                            onChange={(e) => updateItem(index, 'codigo', e.target.value)}
                            placeholder="Código do produto"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`descricao-${index}`} className="text-xs sm:text-sm">Descrição</Label>
                          <Input
                            id={`descricao-${index}`}
                            value={item.descricao}
                            onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                            placeholder="Descrição do produto"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`quantidade-${index}`} className="text-xs sm:text-sm">Quantidade</Label>
                          <CurrencyInput
                            id={`quantidade-${index}`}
                            value={item.quantidade}
                            onChange={(value) => updateItem(index, 'quantidade', value)}
                            placeholder="1"
                            allowDecimal={true}
                            maxLength={10}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`valor_unitario-${index}`} className="text-xs sm:text-sm">Valor Unitário</Label>
                          <CurrencyInput
                            id={`valor_unitario-${index}`}
                            value={item.valor_unitario}
                            onChange={(value) => updateItem(index, 'valor_unitario', value)}
                            placeholder="0,00"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Label htmlFor={`valor_total-${index}`} className="text-xs sm:text-sm">Valor Total</Label>
                          <CurrencyInput
                            id={`valor_total-${index}`}
                            value={item.valor_total_item}
                            onChange={(value) => updateItem(index, 'valor_total_item', value)}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {formData.items.length === 0 && (
            <div className="text-center py-4">
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item da Nota Fiscal
              </Button>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 order-2 sm:order-1"
              disabled={loading}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 order-1 sm:order-2"
              size="sm"
            >
              {loading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />}
              <span className="text-sm sm:text-base">
                {isEditing ? 'Atualizar Frete' : 'Criar Frete'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}