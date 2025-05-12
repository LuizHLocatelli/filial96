
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { indicatorOptions } from "@/components/crediario/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ListagemUploaderProps {
  isUploading: boolean;
  onUpload: (file: File, indicator: string | null) => Promise<boolean>;
}

export function ListagemUploader({ isUploading, onUpload }: ListagemUploaderProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo PDF para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    const success = await onUpload(selectedFile, selectedIndicator);
    if (success) {
      setSelectedFile(null);
      setSelectedIndicator(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Listagens</CardTitle>
        <CardDescription>
          Faça upload de arquivos PDF de listagens de cobrança
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
          onClick={triggerFileInput}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            {isMobile ? "Toque para selecionar um PDF" : "Clique para selecionar ou arraste um arquivo PDF"}
          </p>
          <Input
            id="pdf-upload"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="cursor-pointer w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            Selecionar arquivo
          </Button>
        </div>
        
        {selectedFile && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Arquivo selecionado:</p>
              <p className="text-sm text-muted-foreground truncate">{selectedFile.name}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Indicador:</p>
              <Select value={selectedIndicator || "none"} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um indicador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading} 
          className="w-full"
        >
          {isUploading ? "Enviando..." : "Fazer Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}
