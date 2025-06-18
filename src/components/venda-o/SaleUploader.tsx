import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ShoppingCart, FileText, User, Calendar, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { entregaOptions, statusOptions } from "@/types/vendaO";
import { ProductListInput } from "./ProductListInput";
import { FileInputZone } from "./FileInputZone";
import { ObservacoesField } from "./ObservacoesField";
import { Separator } from "@/components/ui/separator";

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
  status: z.enum(["aguardando_produto", "aguardando_cliente", "pendente", "concluida"]),
  observacoes: z.string().optional()
});

export type FormValues = z.infer<typeof formSchema>;

interface SaleUploaderProps {
  isUploading: boolean;
  progress: number;
  onUpload: (data: FormValues, file: File) => Promise<boolean>;
}

export function SaleUploader({ isUploading, progress, onUpload }: SaleUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

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
      status: "aguardando_produto",
      observacoes: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setFormSubmitError(null);
    
    if (!selectedFile) {
      setFormSubmitError("Selecione um arquivo de cupom fiscal.");
      return;
    }

    try {
      const success = await onUpload(data, selectedFile);
      if (success) {
        form.reset();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Erro durante o upload:", error);
      setFormSubmitError("Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header melhorado */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Nova Venda O</h2>
            <p className="text-sm text-muted-foreground">
              Registre uma venda de outra filial com entrega ou retirada na nossa loja
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Informações da Venda</CardTitle>
          </div>
          <CardDescription>
            Preencha os dados da venda e anexe o cupom fiscal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {formSubmitError && !selectedFile && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formSubmitError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção: Dados da Venda */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Calendar className="h-4 w-4" />
                  <span>Dados da Venda</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Filial da Venda *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 001, 002, 003..." 
                            {...field} 
                            className="h-10 border-border/60 focus:border-primary bg-muted/40"
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
                        <FormLabel className="text-sm font-medium">Data da Venda *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="h-10 border-border/60 focus:border-primary bg-muted/40"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-border/60" />
              
              {/* Seção: Dados do Cliente */}
              <div className="stack-md">
                <div className="inline-md text-sm font-medium text-primary">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Dados do Cliente</span>
                </div>
                
                <div className="grid-responsive-wide">
                  <FormField
                    control={form.control}
                    name="nome_cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome do Cliente *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome completo do cliente" 
                            {...field} 
                            className="h-10 border-border/60 focus:border-primary bg-muted/40"
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
                        <FormLabel className="text-sm font-medium">
                          Telefone <span className="text-xs text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(11) 99999-9999" 
                            {...field} 
                            className="h-10 border-border/60 focus:border-primary bg-muted/40"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-border/60" />
              
              {/* Seção: Produtos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Produtos</span>
                </div>
                
                <ProductListInput 
                  control={form.control}
                  register={form.register}
                  errors={form.formState.errors}
                  setValue={form.setValue}
                  getValues={form.getValues}
                />
              </div>

              <Separator className="bg-border/60" />
              
              {/* Seção: Entrega e Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Truck className="h-4 w-4" />
                  <span>Entrega e Status</span>
                </div>
                
                <div className="grid-responsive-cards">
                  <FormField
                    control={form.control}
                    name="previsao_chegada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Previsão de Chegada <span className="text-xs text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="h-10 border-border/60 focus:border-primary bg-muted/40"
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
                        <FormLabel className="text-sm font-medium">Tipo de Entrega *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 border-border/60 focus:border-primary bg-muted/40">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {entregaOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
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
                        <FormLabel className="text-sm font-medium">Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 border-border/60 focus:border-primary bg-muted/40">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
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
              </div>

              <Separator className="bg-border/60" />
              
              {/* Seção: Observações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FileText className="h-4 w-4" />
                  <span>Informações Adicionais</span>
                </div>
                
                <ObservacoesField control={form.control} />
              </div>

              <Separator className="bg-border/60" />

              {/* Seção: Upload do Cupom */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FileText className="h-4 w-4" />
                  <span>Cupom Fiscal</span>
                </div>
                
                <FileInputZone
                  onFileSelect={setSelectedFile}
                  isUploading={isUploading}
                  progress={progress}
                  externalError={formSubmitError && !selectedFile ? formSubmitError : null}
                  clearExternalError={() => setFormSubmitError(null)}
                />
              </div>
              
              <CardFooter className="px-0 pt-6">
                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar Venda
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
