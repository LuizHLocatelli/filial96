import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, CheckCircle, Clock, FileText, Trash2, AlertTriangle, Edit3, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ptBR } from "date-fns/locale";
import type { Deposito } from "@/hooks/crediario/useDepositos";

interface DepositFormDialogProps {
  openDialog: boolean;
  selectedDay: Date | null;
  previewUrl: string | null;
  isUploading: boolean;
  depositoId: string | null;
  depositosForDay: Deposito[];
  setOpenDialog: (open: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleSubmit: (jaIncluido: boolean) => void;
  onAddNewDeposito: () => void;
  onViewDeposito: (deposito: Deposito) => void;
  onDeleteDeposito?: (depositoId: string) => void;
  onCloseDialog?: () => void;
}

export function DepositFormDialog({
  openDialog,
  selectedDay,
  previewUrl,
  isUploading,
  depositoId,
  depositosForDay = [],
  setOpenDialog,
  handleFileChange,
  handleRemoveFile,
  handleSubmit,
  onAddNewDeposito,
  onViewDeposito,
  onDeleteDeposito,
  onCloseDialog
}: DepositFormDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [jaIncluido, setJaIncluido] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Estados para o modal de visualização da imagem
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Efeito para carregar os dados do depósito quando editando
  useEffect(() => {
    if (depositoId && depositosForDay.length > 0) {
      const depositoAtual = depositosForDay.find(d => d.id === depositoId);
      if (depositoAtual) {
        setJaIncluido(depositoAtual.ja_incluido);
      }
    } else {
      // Reset para novo depósito
      setJaIncluido(false);
    }
  }, [depositoId, depositosForDay]);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteConfirm = async (depositoIdToDelete: string) => {
    if (onDeleteDeposito) {
      setDeletingId(depositoIdToDelete);
      await onDeleteDeposito(depositoIdToDelete);
      setDeletingId(null);
    }
  };

  // Funções para o modal de visualização da imagem
  const handleOpenImageModal = () => {
    setShowImageModal(true);
    setImageScale(1);
    setImageRotation(0);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageScale(1);
    setImageRotation(0);
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  // Efeito para fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        handleCloseImageModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  const getStatusBadge = (deposito: Deposito) => {
    if (deposito.comprovante && deposito.ja_incluido) {
      return <Badge variant="default" className="bg-green-50 text-green-800 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs">Completo</Badge>;
    } else if (deposito.comprovante && !deposito.ja_incluido) {
      return <Badge variant="secondary" className="bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800 text-xs">Pendente</Badge>;
    } else {
      return <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800 text-xs">Incompleto</Badge>;
    }
  };

  const isAfterDeadline = (deposito: Deposito) => {
    return deposito.data.getHours() >= 12;
  };

  const showForm = depositosForDay.length === 0 || depositoId;

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 rounded-xl shadow-2xl border bg-background overflow-hidden">
          <DialogHeader className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-b shrink-0 rounded-t-xl">
            <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate">Depósito Bancário</div>
                {selectedDay && (
                  <div className="text-xs md:text-sm font-normal text-muted-foreground truncate">
                    {format(
                      selectedDay,
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </div>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-1">
              {depositosForDay.length > 0
                ? `${depositosForDay.length} depósito${
                    depositosForDay.length > 1 ? "s" : ""
                  } registrado${depositosForDay.length > 1 ? "s" : ""}`
                : "Registre seu depósito bancário diário"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div
                className={`p-3 md:p-6 grid gap-4 md:gap-6 ${
                  showForm && depositosForDay.length > 0
                    ? "md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {depositosForDay.length > 0 && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                          <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold">Depósitos Registrados</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {depositosForDay.map(deposito => (
                          <div key={deposito.id} className="border rounded-lg bg-gradient-to-r from-background to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-all p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="text-sm font-medium">{format(deposito.data, "dd/MM")}</div>
                                  <div className="text-xs text-muted-foreground">{format(deposito.data, "HH:mm")}</div>
                                </div>
                                {isAfterDeadline(deposito) && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800 text-xs px-2 py-1">Atraso</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {getStatusBadge(deposito)}
                                  {deposito.comprovante && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs px-2 py-1">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Anexo
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-1">
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/50 dark:hover:text-green-400" onClick={() => onViewDeposito(deposito)}>
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                                
                                {onDeleteDeposito && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-400" disabled={deletingId === deposito.id}>
                                        {deletingId === deposito.id ? (
                                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                                        ) : (
                                          <Trash2 className="h-3 w-3 mr-1" />
                                        )}
                                        Excluir
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="w-[95vw] max-w-md rounded-xl m-2">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-base">
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                          Confirmar Exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                          Excluir depósito de <strong>{format(deposito.data, "dd/MM/yyyy 'às' HH:mm")}</strong>?<br />
                                          <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                        <AlertDialogCancel className="w-full sm:w-auto rounded-lg">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteConfirm(deposito.id)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 rounded-lg">
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button onClick={onAddNewDeposito} variant="outline" className="w-full border-dashed border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/50 dark:hover:border-green-400 dark:hover:text-green-400 py-2 h-10 text-sm">
                        <Upload className="h-3 w-3 mr-2" />
                        Adicionar Novo
                      </Button>
                      
                      <Separator className="my-4" />
                    </div>
                  </div>
                )}
                
                {showForm && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center">
                          <Upload className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Label className="text-sm font-semibold">Comprovante de Depósito</Label>
                        </div>
                      </div>
                      
                      {previewUrl ? (
                        <div className="relative">
                          <div className="border rounded-xl p-2 bg-muted/30 cursor-pointer hover:bg-muted/40 transition-colors group" onClick={handleOpenImageModal}>
                            <img src={previewUrl} alt="Comprovante" className="max-h-40 max-w-full object-contain mx-auto rounded-lg" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                              <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                                <ZoomIn className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 rounded-full h-6 w-6 md:h-8 md:w-8 p-0"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/30 dark:hover:border-green-400 transition-colors p-4 md:p-6"
                          onClick={triggerFileInput}
                        >
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-sm md:text-base font-semibold mb-2 text-center">
                            Adicionar Comprovante
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-3 text-center">
                            Toque ou arraste para selecionar a imagem
                          </p>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs md:text-sm h-8 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerFileInput();
                            }}
                          >
                            Selecionar Arquivo
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-xl border border-amber-200 dark:border-amber-800 p-3 md:p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="ja-incluido"
                          checked={jaIncluido}
                          onCheckedChange={(checked) =>
                            setJaIncluido(checked === true)
                          }
                          className="mt-1 data-[state=checked]:bg-amber-600 dark:data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-600 dark:data-[state=checked]:border-amber-500"
                        />
                        <div className="grid gap-1 leading-none">
                          <label
                            htmlFor="ja-incluido"
                            className="text-sm font-semibold cursor-pointer text-amber-800 dark:text-amber-200"
                          >
                            Já incluído na Tesouraria/P2K?
                          </label>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Marque se o depósito já foi processado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <DialogFooter className="bg-gradient-to-r from-muted/30 to-muted/50 dark:from-muted/20 dark:to-muted/40 border-t shrink-0 rounded-b-xl px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
            <Button
              variant="outline"
              onClick={() =>
                onCloseDialog ? onCloseDialog() : setOpenDialog(false)
              }
              className="w-full sm:w-auto order-2 sm:order-1 h-10 rounded-lg border-border/50 hover:bg-background"
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleSubmit(jaIncluido)}
              disabled={isUploading}
              className="w-full sm:w-auto order-1 sm:order-2 h-10 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-lg"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>{depositoId ? "Atualizar" : "Registrar"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Visualização em Tela Cheia */}
      {previewUrl && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="w-[98vw] h-[98vh] max-w-none m-1 p-0 bg-black/95 border-none">
            {/* Título para acessibilidade - oculto visualmente */}
            <DialogTitle className="sr-only">
              Visualização em Tela Cheia do Comprovante de Depósito
            </DialogTitle>
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Botões de Controle - Header */}
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <h3 className="text-white text-sm font-medium">Comprovante de Depósito</h3>
                  {selectedDay && (
                    <p className="text-white/70 text-xs">
                      {format(selectedDay, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Controles de Zoom e Rotação */}
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={handleZoomOut}
                      disabled={imageScale <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-white text-xs px-2 min-w-[50px] text-center">
                      {Math.round(imageScale * 100)}%
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={handleZoomIn}
                      disabled={imageScale >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Botão Fechar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-8 w-8 bg-black/50 backdrop-blur-sm rounded-lg"
                    onClick={handleCloseImageModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Imagem Principal */}
              <div
                className="transition-transform duration-300 ease-in-out flex items-center justify-center"
                style={{
                  transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                  width: '100%',
                  height: '100%'
                }}
              >
                <img
                  src={previewUrl}
                  alt="Comprovante de depósito em tela cheia"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Instruções - Footer */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                  <p className="text-white/70 text-xs">
                    Toque na imagem ou pressione ESC para fechar
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

