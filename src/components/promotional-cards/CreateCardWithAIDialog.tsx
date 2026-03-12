import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Sparkles, Loader2, ImagePlus, X, RefreshCw, Save, Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface CreateCardWithAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
  onSuccess: () => void;
}

const STYLE_PRESETS = [
  { label: "Moderno", value: "moderno, minimalista, fontes sans-serif, cores vibrantes" },
  { label: "Elegante", value: "elegante, luxuoso, cores escuras com dourado, fontes serifadas" },
  { label: "Divertido", value: "divertido, colorido, formas arredondadas, estilo pop" },
  { label: "Promoção", value: "estilo promoção agressiva, splash de preço, urgência, vermelho e amarelo" },
  { label: "Clean", value: "clean, branco e azul, espaçoso, tipografia forte" },
  { label: "Natalino", value: "tema natalino, vermelho e verde, flocos de neve, festivo" },
];

export function CreateCardWithAIDialog({ open, onOpenChange, sector, folderId, onSuccess }: CreateCardWithAIDialogProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [promoDetails, setPromoDetails] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5">("4:5");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  const resetState = () => {
    setProductName("");
    setProductDescription("");
    setPromoDetails("");
    setSelectedStyle("");
    setCustomStyle("");
    setAspectRatio("4:5");
    setReferenceImage(null);
    setReferenceFileName("");
    setGeneratedImage(null);
    setIsGenerating(false);
    setIsSaving(false);
    setCardTitle("");
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleReferenceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione um arquivo de imagem", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "Imagem muito grande (máx. 5MB)", variant: "destructive" });
      return;
    }
    setReferenceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setReferenceImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o nome do produto", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const style = customStyle || selectedStyle;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-card-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            productName: productName.trim(),
            productDescription: productDescription.trim() || undefined,
            promoDetails: promoDetails.trim() || undefined,
            style: style || undefined,
            aspectRatio,
            referenceImageBase64: referenceImage || undefined,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      setGeneratedImage(data.imageBase64);
      setCardTitle(productName.trim());

      toast({ title: "Card gerado!", description: "Revise o resultado e salve ou gere novamente." });
    } catch (error: Error | unknown) {
      console.error("Erro ao gerar card:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível gerar o card";
      toast({ title: "Erro na geração", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage || !user) return;

    setIsSaving(true);
    try {
      // Convert base64 to blob
      const res = await fetch(generatedImage);
      const blob = await res.blob();

      const filePath = `${sector}/${uuidv4()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("promotional_cards")
        .upload(filePath, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("promotional_cards")
        .getPublicUrl(filePath);

      const { data: positionData } = await supabase
        .from("promotional_cards")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);

      const position = positionData?.[0]?.position != null ? positionData[0].position + 1 : 0;

      const { error: insertError } = await supabase.from("promotional_cards").insert({
        title: cardTitle || productName.trim(),
        image_url: publicUrlData.publicUrl,
        folder_id: folderId,
        aspect_ratio: aspectRatio,
        sector,
        created_by: user.id,
        position,
      });

      if (insertError) throw insertError;

      toast({ title: "Salvo!", description: "Card promocional criado com sucesso via IA" });
      handleClose();
      onSuccess();
    } catch (error: Error | unknown) {
      console.error("Erro ao salvar card:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar o card";
      toast({ title: "Erro ao salvar", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? "w-[calc(100%-2rem)] max-w-full p-0" : "sm:max-w-3xl p-0"} max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Sparkles}
          iconColor="primary"
          title="Criar Card com IA"
          description="Gere materiais promocionais automaticamente com inteligência artificial"
          onClose={handleClose}
        />

        <div className="flex-1 min-h-0 overflow-y-auto touch-pan-y overscroll-contain relative z-20 p-4 sm:p-6" data-scroll-lock-ignore>
          <div className={cn("gap-6", generatedImage && !isMobile ? "grid grid-cols-2" : "space-y-5")}>
            {/* Form section */}
            <div className="space-y-4">
              {/* Product name */}
              <div className="space-y-1.5">
                <Label htmlFor="ai-product-name" className="text-sm font-medium">
                  Nome do Produto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ai-product-name"
                  placeholder="Ex: Sofá Retrátil 3 Lugares"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="ai-description" className="text-sm font-medium">Descrição do Produto</Label>
                <Textarea
                  id="ai-description"
                  placeholder="Ex: Tecido suede, cor cinza, com chaise..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Promo details */}
              <div className="space-y-1.5">
                <Label htmlFor="ai-promo" className="text-sm font-medium">Promoção / Preço</Label>
                <Input
                  id="ai-promo"
                  placeholder="Ex: De R$ 2.499 por R$ 1.899 - 24% OFF"
                  value={promoDetails}
                  onChange={(e) => setPromoDetails(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              {/* Style presets */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Estilo Visual</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setSelectedStyle(preset.value); setCustomStyle(""); }}
                      disabled={isGenerating}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selectedStyle === preset.value && !customStyle
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Ou descreva um estilo personalizado..."
                  value={customStyle}
                  onChange={(e) => { setCustomStyle(e.target.value); if (e.target.value) setSelectedStyle(""); }}
                  disabled={isGenerating}
                  className="mt-1.5"
                />
              </div>

              {/* Aspect ratio */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Formato</Label>
                <div className="flex gap-3">
                  {(["4:5", "1:1"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={isGenerating}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium",
                        aspectRatio === ratio
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "border-2 rounded-sm",
                        aspectRatio === ratio ? "border-primary-foreground" : "border-muted-foreground/50",
                        ratio === "4:5" ? "w-4 h-5" : "w-4 h-4"
                      )} />
                      {ratio === "4:5" ? "Retrato (4:5)" : "Quadrado (1:1)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference image */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Imagem de Referência (opcional)</Label>
                <p className="text-xs text-muted-foreground">Envie uma foto do produto para a IA usar como base</p>
                {referenceImage ? (
                  <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30">
                    <img src={referenceImage} alt="Referência" className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate text-foreground">{referenceFileName}</p>
                      <p className="text-xs text-muted-foreground">Imagem de referência</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setReferenceImage(null); setReferenceFileName(""); }}
                      disabled={isGenerating}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-sm">Adicionar foto do produto</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImage}
                  className="hidden"
                />
              </div>
            </div>

            {/* Preview section */}
            {generatedImage && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Resultado</Label>
                <div className={cn(
                  "rounded-lg overflow-hidden border border-border shadow-sm bg-muted/20",
                  aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]"
                )}>
                  <img
                    src={generatedImage}
                    alt="Card gerado por IA"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ai-card-title" className="text-xs font-medium">Título do Card</Label>
                  <Input
                    id="ai-card-title"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    placeholder="Título para salvar..."
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? "flex-col gap-2" : "flex-row gap-3"}>
          {generatedImage && (
            <>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
                className={isMobile ? "w-full h-10" : ""}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                Gerar Novamente
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !cardTitle.trim()}
                className={isMobile ? "w-full h-10" : ""}
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Salvar Card</>
                )}
              </Button>
            </>
          )}
          {!generatedImage && (
            <>
              <Button variant="outline" onClick={handleClose} className={isMobile ? "w-full h-10" : ""}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !productName.trim()}
                className={cn(isMobile ? "w-full h-10" : "", "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90")}
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando com IA...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Gerar Card com IA</>
                )}
              </Button>
            </>
          )}
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
