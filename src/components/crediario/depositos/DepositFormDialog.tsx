import React, { useState, useEffect, useRef, useCallback } from "react";
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

// ============================================================================
// Subcomponente para renderizar um item de depósito
// ============================================================================
const DepositoItem = ({
  deposito,
  isMobile,
  deletingId,
  onViewDeposito,
  onDeleteDeposito,
  getStatusBadge,
  isAfterDeadline,
  handleDeleteConfirm,
}: {
  deposito: Deposito;
  isMobile: boolean;
  deletingId: string | null;
  onViewDeposito: (deposito: Deposito) => void;
  onDeleteDeposito?: (depositoId: string) => void;
  getStatusBadge: (deposito: Deposito) => React.ReactNode;
  isAfterDeadline: (deposito: Deposito) => boolean;
  handleDeleteConfirm: (depositoId: string) => void;
}) => {
  const handleDeleteTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const commonProps = {
    key: deposito.id,
    className: `border rounded-lg bg-gradient-to-r from-background to-muted/20 
                hover:from-muted/20 hover:to-muted/30 transition-all cursor-pointer 
                ${isMobile ? 'p-3' : 'p-4'}`,
    onClick: () => onViewDeposito(deposito),
  };

  if (isMobile) {
    return (
      <div {...commonProps}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center shrink-0"><CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" /></div>
              <div className="text-sm font-medium">{format(deposito.data, "dd/MM")}</div>
              <div className="text-xs text-muted-foreground">{format(deposito.data, "HH:mm")}</div>
            </div>
            {isAfterDeadline(deposito) && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800 text-xs px-2 py-1">Atraso</Badge>}
          </div>
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-1 flex-wrap">
              {getStatusBadge(deposito)}
              {deposito.comprovante && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs px-2 py-1"><FileText className="h-3 w-3 mr-1" />Anexo</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); onViewDeposito(deposito); }}><Edit3 className="h-3 w-3 mr-1" />Editar</Button>
            {onDeleteDeposito && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700" disabled={deletingId === deposito.id} onClick={handleDeleteTriggerClick}>
                    {deletingId === deposito.id ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-md rounded-xl m-2 dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" />Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">Excluir depósito de <strong>{format(deposito.data, "dd/MM/yyyy 'às' HH:mm")}</strong>?<br /><span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span></AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row"><AlertDialogCancel className="w-full sm:w-auto rounded-lg">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteConfirm(deposito.id)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 rounded-lg">Excluir</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...commonProps}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center shrink-0"><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium">{format(deposito.data, "dd/MM/yyyy")}</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" /><span>{format(deposito.data, "HH:mm")}</span>{isAfterDeadline(deposito) && <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800 text-xs px-2 py-1">Com atraso</Badge>}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(deposito)}
              {deposito.comprovante && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 text-xs px-2 py-1"><FileText className="h-3 w-3 mr-1" />Anexo</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-700" onClick={(e) => { e.stopPropagation(); onViewDeposito(deposito); }}><Edit3 className="h-4 w-4 mr-1" />Editar</Button>
          {onDeleteDeposito && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-red-100 hover:text-red-700" disabled={deletingId === deposito.id} onClick={handleDeleteTriggerClick}>
                  {deletingId === deposito.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>Tem certeza de que deseja excluir este depósito de <strong>{format(deposito.data, "dd/MM/yyyy 'às' HH:mm")}</strong>?<br /><span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span></AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteConfirm(deposito.id)} className="bg-red-600 hover:bg-red-700 rounded-lg">Excluir Depósito</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [jaIncluido, setJaIncluido] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  useEffect(() => {
    if (depositoId && depositosForDay.length > 0) {
      const depositoAtual = depositosForDay.find(d => d.id === depositoId);
      if (depositoAtual) {
        setJaIncluido(depositoAtual.ja_incluido);
      }
    } else {
      setJaIncluido(false);
    }
  }, [depositoId, depositosForDay]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleDeleteConfirm = useCallback(async (depositoIdToDelete: string) => {
    if (onDeleteDeposito) {
      setDeletingId(depositoIdToDelete);
      await onDeleteDeposito(depositoIdToDelete);
      setDeletingId(null);
    }
  }, [onDeleteDeposito]);

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

  const handleZoomIn = () => setImageScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setImageRotation(prev => (prev + 90) % 360);

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

  // Depósitos são considerados em atraso se registrados após o meio-dia.
  const isAfterDepositDeadline = (deposito: Deposito) => new Date(deposito.data).getHours() >= 12;

  // O formulário é exibido se não houver depósitos para o dia
  // ou se um depósito existente estiver sendo editado (depositoId está presente).
  const showForm = depositosForDay.length === 0 || depositoId;
  
  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className={`dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10
          ${isMobile 
            ? 'w-[95vw] max-w-md rounded-2xl mx-auto' 
            : `max-w-4xl ${showForm ? '' : 'sm:max-w-2xl'}`
          }
          ${!showForm && depositosForDay.length > 4 ? 'h-[90vh]' : ''}
        `}>
          <DialogHeader className={`
            ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} 
            bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-b shrink-0 rounded-t-xl
          `}>
            <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold flex items-center gap-2`}>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center`}>
                <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 dark:text-green-400`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate">Depósito Bancário</div>
                {selectedDay && (
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-normal text-muted-foreground truncate`}>
                    {format(selectedDay, isMobile ? "dd/MM/yyyy" : "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
              
              {depositosForDay.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center`}>
                      <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600 dark:text-green-400`} />
                    </div>
                    <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold`}>
                      Depósitos Registrados
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {depositosForDay.map(deposito => (
                      <DepositoItem
                        key={deposito.id}
                        deposito={deposito}
                        isMobile={isMobile}
                        deletingId={deletingId}
                        onViewDeposito={onViewDeposito}
                        onDeleteDeposito={onDeleteDeposito}
                        getStatusBadge={getStatusBadge}
                        isAfterDeadline={isAfterDepositDeadline}
                        handleDeleteConfirm={handleDeleteConfirm}
                      />
                    ))}
                  </div>

                  {!showForm && (
                     <Button onClick={onAddNewDeposito} variant="outline" className="w-full border-dashed border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/50 dark:hover:border-green-400 dark:hover:text-green-400 py-2 h-10 text-sm">
                        <Upload className="h-3 w-3 mr-2" />
                        Registrar Novo Depósito
                      </Button>
                  )}

                </div>
              )}
              
              {showForm && (
                <div className="space-y-4">
                   {depositosForDay.length > 0 && <Separator />}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center`}>
                        <Upload className={`h-4 w-4 text-green-600 dark:text-green-400`} />
                      </div>
                      <Label className={`text-base font-semibold`}>
                        {depositoId ? 'Editar Comprovante' : 'Novo Comprovante'}
                      </Label>
                    </div>
                    
                    {previewUrl ? (
                      <div className="relative">
                        <div className="border rounded-xl p-2 bg-muted/30 cursor-pointer group" onClick={handleOpenImageModal}>
                          <img src={previewUrl} alt="Comprovante" className={`max-h-48 max-w-full object-contain mx-auto rounded-lg`} />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl"><div className="bg-white/90 dark:bg-black/90 rounded-full p-2"><ZoomIn className="h-4 w-4 text-green-600" /></div></div>
                        </div>
                        <Button variant="destructive" size="sm" className="absolute top-1 right-1 rounded-full h-7 w-7 p-0" onClick={handleRemoveFile} aria-label="Remover imagem"><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/30 p-4 text-center transition-colors">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mb-3">
                          <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-semibold mb-1">Adicionar Comprovante</h3>
                        <p className="text-xs text-muted-foreground">Toque para selecionar ou arraste aqui</p>
                        <Input id="file-upload" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  
                  <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-xl border border-amber-200 dark:border-amber-800 p-3 md:p-4`}>
                    <div className="flex items-start space-x-3">
                      <Checkbox id="ja-incluido" checked={jaIncluido} onCheckedChange={(checked) => setJaIncluido(checked === true)} className="mt-1 data-[state=checked]:bg-amber-600" />
                      <div className="grid gap-1 leading-none">
                        <label htmlFor="ja-incluido" className="text-sm font-semibold cursor-pointer text-amber-800 dark:text-amber-200">
                          Este depósito já foi incluído na Tesouraria/P2K?
                        </label>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Marque esta opção se o depósito já foi processado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {showForm && (
            <DialogFooter className={`
              bg-gradient-to-r from-muted/30 to-muted/50 dark:from-muted/20 dark:to-muted/40 border-t shrink-0 rounded-b-xl
              ${isMobile ? 'p-3 flex-col gap-2' : 'px-6 py-4 flex-row gap-3'}
            `}>
              <Button 
                variant="outline" 
                onClick={() => onCloseDialog ? onCloseDialog() : setOpenDialog(false)}
                className={`${isMobile ? "w-full order-2 h-11" : "h-10"} rounded-lg`}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleSubmit(jaIncluido)} 
                disabled={!previewUrl || isUploading}
                className={`${isMobile ? "w-full order-1 h-12 text-base" : "h-10"} rounded-lg bg-green-600 hover:bg-green-700 shadow-lg`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div><span>Salvando...</span></div>
                ) : (
                  <div className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /><span>{depositoId ? "Atualizar" : "Registrar"}</span></div>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {previewUrl && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="w-[98vw] h-[98vh] max-w-none m-1 p-0 bg-black/95 border-none rounded-2xl">
            <DialogTitle className="sr-only">Visualização do Comprovante</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <h3 className="text-white text-sm font-medium">Comprovante de Depósito</h3>
                  {selectedDay && <p className="text-white/70 text-xs">{format(selectedDay, "dd/MM/yyyy", { locale: ptBR })}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleZoomOut} disabled={imageScale <= 0.5}><ZoomOut className="h-4 w-4" /></Button>
                    <span className="text-white text-xs px-2 min-w-[50px] text-center">{Math.round(imageScale * 100)}%</span>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleZoomIn} disabled={imageScale >= 3}><ZoomIn className="h-4 w-4" /></Button>
                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleRotate}><RotateCw className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 bg-black/50 backdrop-blur-sm rounded-lg" onClick={handleCloseImageModal}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <img
                src={previewUrl}
                alt="Comprovante de depósito em tela cheia"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `scale(${imageScale}) rotate(${imageRotation}deg)` }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

