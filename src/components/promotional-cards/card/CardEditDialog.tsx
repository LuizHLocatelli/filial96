import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit3, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CardEditDialogProps {
  card: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  isSubmitting: boolean;
}

export function CardEditDialog({ 
  card, 
  open, 
  onOpenChange, 
  onSave, 
  isSubmitting 
}: CardEditDialogProps) {
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    title: card?.title || '',
    content: card?.content || '',
    status: card?.status || 'rascunho',
    valid_from: card?.valid_from ? new Date(card.valid_from) : undefined,
    valid_until: card?.valid_until ? new Date(card.valid_until) : undefined,
    sector: card?.sector || ''
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      
      setNewImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleSave = () => {
    if (formData.title.trim()) {
      const submitData = {
        ...formData,
        ...(newImage && { image: newImage })
      };
      onSave(submitData);
    }
  };

  const getCurrentImageUrl = () => {
    if (previewUrl) return previewUrl;
    return card?.image_url || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[600px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit3}
          iconColor="primary"
          title="Editar Card"
          description="Modifique as informações do card promocional"
          onClose={() => onOpenChange(false)}
          loading={isSubmitting}
        />

        <StandardDialogContent>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título do card"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status do card" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Setor do card" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Móveis</SelectItem>
                      <SelectItem value="fashion">Moda</SelectItem>
                      <SelectItem value="loan">Crediário</SelectItem>
                      <SelectItem value="service">Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Conteúdo do card promocional"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Período de Validade */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Período de Validade</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.valid_from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_from ? format(formData.valid_from, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.valid_from}
                        onSelect={(date) => handleInputChange('valid_from', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.valid_until && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_until ? format(formData.valid_until, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until}
                        onSelect={(date) => handleInputChange('valid_until', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imagem</h3>
              
              {getCurrentImageUrl() ? (
                <div className="relative max-w-md">
                  <img
                    src={getCurrentImageUrl()}
                    alt="Preview do card"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  {newImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeNewImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : null}

              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {getCurrentImageUrl() ? 'Alterar imagem' : 'Selecionar imagem'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG até 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </StandardDialogContent>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim() || isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
