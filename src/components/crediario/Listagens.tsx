
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Trash2, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Listagem {
  id: string;
  name: string;
  createdAt: Date;
  fileUrl: string;
}

export function Listagens() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [listagens, setListagens] = useState<Listagem[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

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

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo PDF para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulating upload
    setTimeout(() => {
      const newListagem: Listagem = {
        id: Math.random().toString(36).substr(2, 9),
        name: selectedFile.name,
        createdAt: new Date(),
        fileUrl: URL.createObjectURL(selectedFile),
      };

      setListagens([newListagem, ...listagens]);
      setSelectedFile(null);
      setIsUploading(false);

      toast({
        title: "Upload concluído",
        description: "Sua listagem foi adicionada com sucesso.",
      });
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setListagens(listagens.filter(item => item.id !== id));
    if (selectedPdf) {
      setSelectedPdf(null);
    }
    toast({
      title: "Listagem removida",
      description: "A listagem foi excluída com sucesso."
    });
  };

  const handleView = (fileUrl: string) => {
    setSelectedPdf(fileUrl);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Upload de Listagens</CardTitle>
          <CardDescription>
            Faça upload de arquivos PDF de listagens de cobrança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Clique para selecionar ou arraste um arquivo PDF
            </p>
            <Input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload">
              <Button variant="outline" className="cursor-pointer">
                Selecionar arquivo
              </Button>
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm font-medium">Arquivo selecionado:</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
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
            <CardTitle>Listagens Cadastradas</CardTitle>
            <CardDescription>
              Visualize e gerencie suas listagens de cobrança
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listagens.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma listagem cadastrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listagens.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleView(item.fileUrl)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
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
            <CardHeader>
              <CardTitle>Visualizador de PDF</CardTitle>
              <CardDescription>
                Visualize o conteúdo da listagem selecionada
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
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
