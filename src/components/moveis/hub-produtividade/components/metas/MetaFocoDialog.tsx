import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetaCategoria, MetaFocoForm } from "../../types/metasTypes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface MetaFocoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: MetaCategoria[];
  onSubmit: (data: MetaFocoForm) => Promise<boolean>;
  isLoading: boolean;
}

export function MetaFocoDialog({ 
  open, 
  onOpenChange, 
  categorias, 
  onSubmit, 
  isLoading 
}: MetaFocoDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [formData, setFormData] = useState<MetaFocoForm>({
    data_foco: format(new Date(), 'yyyy-MM-dd'),
    categoria_id: '',
    valor_meta: 0,
    titulo: '',
    descricao: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onSubmit(formData);
    if (success) {
      onOpenChange(false);
      // Reset form
      setFormData({
        data_foco: format(new Date(), 'yyyy-MM-dd'),
        categoria_id: '',
        valor_meta: 0,
        titulo: '',
        descricao: ''
      });
      setSelectedDate(new Date());
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        data_foco: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("medium")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Criar Meta Foco
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Defina uma meta específica para impulsionar os resultados em um dia determinado
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Meta Foco *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Meta especial de vendas"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Data da Meta *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_meta">Valor da Meta *</Label>
              <Input
                id="valor_meta"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_meta}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_meta: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select 
              value={formData.categoria_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da meta foco..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div {...getMobileFooterProps()}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.titulo.trim() || !formData.categoria_id || formData.valor_meta <= 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
            >
              {isLoading ? "Criando..." : "Criar Meta Foco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
