
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReservas } from "../hooks/useReservas";
import { ReservaFormData } from "../types";
import { ProdutoReservaInput } from "./ProdutoReservaInput";

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
  forma_pagamento: z.enum(['crediario', 'cartao_credito', 'cartao_debito', 'pix']),
  observacoes: z.string().optional()
});

export function AddReservaDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createReserva } = useReservas();

  const form = useForm<ReservaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produtos: [{ nome: '', codigo: '', tamanho: '', quantidade: 1 }],
      cliente_nome: '',
      cliente_cpf: '',
      forma_pagamento: 'crediario',
      observacoes: ''
    }
  });

  const handleSubmit = async (data: ReservaFormData) => {
    setIsSubmitting(true);

    const success = await createReserva(data);
    
    if (success) {
      setOpen(false);
      form.reset();
    }
    
    setIsSubmitting(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Reserva</DialogTitle>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Reserva'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
