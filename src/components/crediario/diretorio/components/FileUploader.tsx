
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DirectoryCategory } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileUploaderProps {
  isUploading: boolean;
  onUpload: (file: File, categoryId: string | null, isFeatured: boolean) => Promise<boolean>;
  categories: DirectoryCategory[];
}

export function FileUploader({ isUploading, onUpload, categories }: FileUploaderProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("O tamanho do arquivo não pode exceder 10MB.");
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho do arquivo não pode exceder 10MB.",
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
    setUploadError(null);
    
    if (!selectedFile) {
      setUploadError("Nenhum arquivo selecionado");
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para fazer o upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await onUpload(selectedFile, selectedCategory, isFeatured);
      if (success) {
        setSelectedFile(null);
        setSelectedCategory(null);
        setIsFeatured(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Erro durante o upload:", error);
      setUploadError("Erro ao fazer upload do arquivo. Por favor, tente novamente.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
        <CardDescription>
          Faça upload de arquivos para o diretório
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        <div 
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
          onClick={triggerFileInput}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            {isMobile ? "Toque para selecionar um arquivo" : "Clique para selecionar ou arraste um arquivo"}
          </p>
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
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
              <p className="text-sm font-medium">Categoria:</p>
              <Select 
                value={selectedCategory || "none"} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Destacar este arquivo
              </label>
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
