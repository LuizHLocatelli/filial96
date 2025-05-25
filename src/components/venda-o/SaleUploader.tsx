import { useState, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { entregaOptions, statusOptions } from "@/types/vendaO";
import { ProductListInput } from "./ProductListInput";
import { FileInputZone } from "./FileInputZone";

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
      status: "aguardando_produto"
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
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Nova Venda O</CardTitle>
        <CardDescription>
          Adicione uma nova venda de outra filial com entrega/retirada na nossa loja
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {formSubmitError && !selectedFile && (
          <Alert variant="destructive" className="mb-4 text-xs sm:text-sm">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription>{formSubmitError}</AlertDescription>
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
            
            <ProductListInput 
              control={form.control}
              register={form.register}
              errors={form.formState.errors}
              setValue={form.setValue}
              getValues={form.getValues}
            />
            
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

            <FileInputZone
              onFileSelect={setSelectedFile}
              isUploading={isUploading}
              progress={progress}
              externalError={formSubmitError && !selectedFile ? formSubmitError : null}
              clearExternalError={() => setFormSubmitError(null)}
            />
            
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
