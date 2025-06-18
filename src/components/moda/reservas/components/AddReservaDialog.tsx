import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Plus, Crown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReservas } from "../hooks/useReservas";
import { ReservaFormData } from "../types";
import { ProdutoReservaInput } from "./ProdutoReservaInput";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  produtos: z.array(
    z.object({
      nome: z.string().min(1, "Nome do produto é obrigatório"),
      codigo: z.string().min(1, "Código do produto é obrigatório"),
      tamanho: z.string().optional(),
      quantidade: z.number().min(1, "Quantidade deve ser pelo menos 1")
    })
  ).min(1, "Adicione pelo menos um produto"),
  cliente_nome: z.string().min(1, "Nome do cliente é obrigatório"),
  cliente_cpf: z.string().min(1, "CPF do cliente é obrigatório"),
  cliente_vip: z.boolean().default(false),
  forma_pagamento: z.enum(['crediario', 'cartao_credito', 'cartao_debito', 'pix']),
  observacoes: z.string().optional()
});

interface AddReservaDialogProps {
  variant?: 'default' | 'floating' | 'prominent';
  className?: string;
}

export function AddReservaDialog({ variant = 'default', className = '' }: AddReservaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createReserva } = useReservas();
  const isMobile = useIsMobile();

  const form = useForm<ReservaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produtos: [{ nome: '', codigo: '', tamanho: '', quantidade: 1 }],
      cliente_nome: '',
      cliente_cpf: '',
      cliente_vip: false,
      forma_pagamento: 'crediario',
      observacoes: ''
    }
  });

  const handleSubmit = async (data: ReservaFormData) => {
    setIsSubmitting(true);

    const success = await createReserva(data);
    
    if (success) {
      setOpen(false);
      form.reset({
        produtos: [{ nome: '', codigo: '', tamanho: '', quantidade: 1 }],
        cliente_nome: '',
        cliente_cpf: '',
        cliente_vip: false,
        forma_pagamento: 'crediario',
        observacoes: ''
      });
    }
    
    setIsSubmitting(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 font-medium";
    
    switch (variant) {
      case 'floating':
        return `${baseStyles} fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 justify-center hover:scale-110 shadow-2xl hover:shadow-green-500/25 ${isMobile ? 'bottom-20 right-4' : ''}`;
      case 'prominent':
        return `${baseStyles} h-12 px-8 text-base rounded-xl hover:scale-105 shadow-green-500/20 ${
          isMobile ? 'w-full justify-center h-11' : ''
        }`;
      default:
        return `${baseStyles} h-12 px-6 text-base rounded-xl hover:scale-105 ${
          isMobile ? 'w-full justify-center' : ''
        }`;
    }
  };

  const getButtonContent = () => {
    if (variant === 'floating') {
      return <Plus className="h-6 w-6" />;
    }
    return (
      <>
        <Plus className="h-4 w-4" />
        Nova Reserva
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${getButtonStyles()} ${className}`}>
          {getButtonContent()}
        </Button>
      </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Criar Nova Reserva
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Produtos */}
            <ProdutoReservaInput
              control={form.control}
              register={form.register}
              errors={form.formState.errors}
            />

            {/* Dados do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Cliente *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        onChange={(e) => field.onChange(formatCPF(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cliente VIP */}
            <FormField
              control={form.control}
              name="cliente_vip"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      Cliente VIP
                    </FormLabel>
                    <FormDescription>
                      Clientes VIP não possuem limite de tempo para reservas (padrão é 3 dias)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="crediario">Crediário</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informações adicionais sobre a reserva..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
              >
                {isSubmitting ? 'Criando...' : 'Criar Reserva'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
