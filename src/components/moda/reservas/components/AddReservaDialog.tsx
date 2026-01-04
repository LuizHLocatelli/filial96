
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReservaFormData) => void;
  isSubmitting: boolean;
}

export function AddReservaDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: AddReservaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
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
    onSubmit(data);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")} className="flex flex-col max-h-[85vh]">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Nova Reserva
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Registre uma nova reserva de produto para o cliente
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-4">
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

            <div {...getMobileFooterProps()}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="success"
              >
                {isSubmitting ? "Criando..." : "Criar Reserva"}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
