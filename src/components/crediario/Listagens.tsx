
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Trash2, Eye, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useListagens } from "@/hooks/crediario/useListagens";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const indicatorOptions = [
  { value: "FPD", label: "FPD" },
  { value: "Pontual", label: "Pontual" },
  { value: "M1", label: "M1" },
  { value: "M2", label: "M2" },
  { value: "M3", label: "M3" },
];

export function Listagens() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [filterIndicator, setFilterIndicator] = useState<string | null>(null);
  const { listagens, isLoading, isUploading, addListagem, deleteListagem } = useListagens();
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

    const success = await addListagem(selectedFile, selectedIndicator);
    if (success) {
      setSelectedFile(null);
      setSelectedIndicator(null);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (selectedPdf === fileUrl) {
      setSelectedPdf(null);
    }
    await deleteListagem(id, fileUrl);
  };

  const handleView = (fileUrl: string) => {
    setSelectedPdf(fileUrl);
  };

  const filteredListagens = filterIndicator 
    ? listagens.filter(item => item.indicator === filterIndicator)
    : listagens;

  const getIndicatorColor = (indicator: string | null) => {
    switch(indicator) {
      case "FPD": return "bg-red-500";
      case "Pontual": return "bg-green-500";
      case "M1": return "bg-yellow-500";
      case "M2": return "bg-orange-500";
      case "M3": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
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

      <div className="md:col-span-2 flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Listagens Cadastradas</CardTitle>
                <CardDescription>
                  Visualize e gerencie suas listagens de cobrança
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterIndicator || "all"} onValueChange={(value) => setFilterIndicator(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos indicadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos indicadores</SelectItem>
                    {indicatorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredListagens.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {filterIndicator 
                    ? `Nenhuma listagem cadastrada para o indicador ${filterIndicator}`
                    : "Nenhuma listagem cadastrada"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListagens.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{item.nome}</p>
                          {item.indicator && (
                            <Badge className={`${getIndicatorColor(item.indicator)} text-white`}>
                              {item.indicator}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(item.createdAt, "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleView(item.fileUrl)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id, item.fileUrl)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPdf && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Visualizador de PDF</CardTitle>
              <CardDescription>
                Visualize o conteúdo da listagem selecionada
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-[400px]" : "h-[500px]"}>
              <iframe
                src={selectedPdf}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
