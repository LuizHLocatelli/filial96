import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { Building2, ImagePlus, X, Trash2, Loader2 } from "@/components/ui/emoji-icons";
import { useCompanyLogo } from "@/hooks/useCompanyLogo";
import { cn } from "@/lib/utils";

interface CompanyLogoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyLogoDialog({ open, onOpenChange }: CompanyLogoDialogProps) {
  const { logoUrl, isLoading, isSaving, uploadLogo, removeLogo } = useCompanyLogo();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    const success = await uploadLogo(selectedFile);
    if (success) {
      setPreviewImage(null);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const handleRemove = async () => {
    const success = await removeLogo();
    if (success) {
      setPreviewImage(null);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    onOpenChange(false);
  };

  const currentLogo = previewImage || logoUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0" hideCloseButton>
        <StandardDialogHeader
          icon={Building2}
          iconColor="primary"
          title="Logo da Empresa"
          description="Configure o logo padrão que será adicionado automaticamente em todos os cards gerados por IA."
          onClose={handleClose}
        />

        <DialogScrollableContainer>
          <div className="space-y-4">
            {/* Current/Preview Logo */}
            {currentLogo ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {previewImage ? "Nova imagem selecionada" : "Logo atual"}
                  </span>
                  {previewImage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 p-4">
                  <img
                    src={currentLogo}
                    alt="Logo da empresa"
                    className="w-full max-h-48 object-contain mx-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum logo configurado</p>
                <p className="text-xs mt-1">Adicione um logo para ser usado nos cards de IA</p>
              </div>
            )}

            {/* Upload Area */}
            {!previewImage && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">{logoUrl ? "Substituir logo" : "Adicionar logo"}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isSaving}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors",
                    "border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-sm">Clique para selecionar imagem</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Formatos aceitos: PNG, JPG, JPEG (máx. 5MB)
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Como funciona:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>O logo será posicionado no <strong>topo centralizado</strong> do card</li>
                <li>Todos os cards gerados por IA incluirão automaticamente este logo</li>
                <li>Apenas gerentes podem alterar esta configuração</li>
              </ul>
            </div>
          </div>
        </DialogScrollableContainer>

        <StandardDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          
          {logoUrl && !previewImage && (
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removendo...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" /> Remover Logo</>
              )}
            </Button>
          )}
          
          {previewImage && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                "Salvar Logo"
              )}
            </Button>
          )}
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
