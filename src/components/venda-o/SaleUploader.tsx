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
import { formatPhoneNumber } from "@/utils/phoneFormatter";

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Padronizado */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Nova Venda O
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre uma venda de outra filial com entrega ou retirada na nossa loja
          </p>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Informações da Venda
          </CardTitle>
          <CardDescription>
            Preencha os dados da venda e anexe o cupom fiscal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {formSubmitError && !selectedFile && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formSubmitError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção: Dados da Venda */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Calendar className="h-4 w-4" />
                  <span>Dados da Venda</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="filial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filial da Venda *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 001, 002, 003..." 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="data_venda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Venda *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />
              
              {/* Seção: Dados do Cliente */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <User className="h-4 w-4" />
                  <span>Dados do Cliente</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome_cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome completo do cliente" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(51) 99156-8395" 
                            {...field}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />
              
              {/* Seção: Produtos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
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

              <Separator />
              
              {/* Seção: Entrega e Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Truck className="h-4 w-4" />
                  <span>Entrega e Status</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="previsao_chegada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previsão de Chegada (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tipo_entrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Entrega *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />
              
              {/* Seção: Observações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>Informações Adicionais</span>
                </div>
                
                <ObservacoesField control={form.control} />
              </div>

              <Separator />

              {/* Seção: Upload do Cupom */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
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
              
              <div className="flex justify-end pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  variant="success"
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
