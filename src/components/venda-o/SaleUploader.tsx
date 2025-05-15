
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, AlertCircle, PlusCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { entregaOptions, statusOptions, VendaOProduct } from "@/types/vendaO";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  filial: z.string().min(1, "A filial é obrigatória"),
  data_venda: z.string().min(1, "A data da venda é obrigatória"),
  nome_cliente: z.string().min(1, "O nome do cliente é obrigatório"),
  telefone: z.string().optional(),
  produtos: z.array(
    z.object({
      nome: z.string().min(1, "Nome do produto é obrigatório"),
      codigo: z.string().min(6, "Código deve ter 6 dígitos").max(6, "Código deve ter 6 dígitos")
    })
  ).min(1, "Adicione pelo menos um produto"),
  previsao_chegada: z.string().optional(),
  tipo_entrega: z.enum(["frete", "retirada"]),
  status: z.enum(["aguardando_produto", "aguardando_cliente", "pendente", "concluida"])
});

type FormValues = z.infer<typeof formSchema>;

interface SaleUploaderProps {
  isUploading: boolean;
  progress: number;
  onUpload: (data: FormValues, file: File) => Promise<boolean>;
}

export function SaleUploader({ isUploading, progress, onUpload }: SaleUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Add state to force re-render when products change
  const [productsKey, setProductsKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filial: "",
      data_venda: format(new Date(), "yyyy-MM-dd"),
      nome_cliente: "",
      telefone: "",
      produtos: [{ nome: "", codigo: "" }],
      previsao_chegada: format(new Date(), "yyyy-MM-dd"),
      tipo_entrega: "frete",
      status: "aguardando_produto"
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type (allow PDF and images)
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        setUploadError("Selecione um arquivo PDF ou uma imagem.");
        setSelectedFile(null);
        return;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("O arquivo não pode exceder 10MB.");
        setSelectedFile(null);
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

  const addProduct = () => {
    const currentProducts = form.getValues("produtos") || [];
    form.setValue("produtos", [...currentProducts, { nome: "", codigo: "" }]);
    // Force re-render by updating the key
    setProductsKey(prev => prev + 1);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getValues("produtos");
    if (currentProducts.length > 1) {
      const updatedProducts = currentProducts.filter((_, i) => i !== index);
      form.setValue("produtos", updatedProducts);
      // Force re-render by updating the key
      setProductsKey(prev => prev + 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setUploadError(null);
    
    if (!selectedFile) {
      setUploadError("Selecione um arquivo de cupom fiscal.");
      return;
    }

    try {
      await onUpload(data, selectedFile);
      form.reset();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Erro durante o upload:", error);
      setUploadError("Erro ao enviar. Tente novamente.");
    }
  };

  // Get current products for rendering
  const products = form.watch("produtos");

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Nova Venda O</CardTitle>
        <CardDescription>
          Adicione uma nova venda de outra filial com entrega/retirada na nossa loja
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {uploadError && (
          <Alert variant="destructive" className="mb-4 text-xs sm:text-sm">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="filial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Filial da Venda</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Número da filial" 
                        {...field} 
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="data_venda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Data da Venda</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="nome_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome completo" 
                        {...field} 
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(XX) XXXXX-XXXX" 
                        {...field} 
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <div key={productsKey}>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs sm:text-sm">Produtos</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addProduct}
                  className="flex items-center text-xs sm:text-sm h-7 sm:h-8"
                >
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Adicionar Produto
                </Button>
              </div>
              
              {products.map((_, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`produtos.${index}.nome`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Nome do produto" 
                              {...field} 
                              className="text-xs sm:text-sm h-8 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-20 sm:w-24">
                    <FormField
                      control={form.control}
                      name={`produtos.${index}.codigo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Código" 
                              {...field} 
                              maxLength={6} 
                              className="text-xs sm:text-sm h-8 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  {products.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeProduct(index)}
                      className="h-8 sm:h-10 w-8 sm:w-10"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="previsao_chegada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Previsão de Chegada</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo_entrega"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Tipo de Entrega</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entregaOptions.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-xs sm:text-sm"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-xs sm:text-sm"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Cupom Fiscal (PDF ou Imagem)</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer"
                onClick={triggerFileInput}
              >
                <UploadCloud className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-center text-muted-foreground mb-2">
                  {isMobile 
                    ? "Toque para selecionar um arquivo" 
                    : "Clique para selecionar ou arraste um arquivo"}
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="cursor-pointer w-full sm:w-auto text-xs sm:text-sm h-7 sm:h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  type="button"
                >
                  Selecionar arquivo
                </Button>
              </div>
              
              {selectedFile && (
                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-medium">Arquivo selecionado:</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedFile.name}</p>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs sm:text-sm font-medium">Progresso: {progress}%</p>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
            
            <CardFooter className="px-0 pt-2">
              <Button 
                type="submit" 
                disabled={isUploading} 
                className="w-full sm:h-10 text-xs sm:text-sm"
              >
                {isUploading ? "Enviando..." : "Adicionar Venda"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
