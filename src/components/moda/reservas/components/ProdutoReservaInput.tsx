
import { useState } from "react";
import { useFieldArray, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { PlusCircle, X, Package } from "lucide-react";
import { ReservaFormData } from "../types";

interface ProdutoReservaInputProps {
  control: Control<ReservaFormData>;
  register: UseFormRegister<ReservaFormData>;
  errors: FieldErrors<ReservaFormData>;
}

export function ProdutoReservaInput({
  control,
  register,
  errors,
}: ProdutoReservaInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "produtos",
  });

  const addProduto = () => {
    append({ nome: "", codigo: "", tamanho: "", quantidade: 1 });
  };

  const removeProduto = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <FormLabel className="text-sm font-medium">Produtos da Reserva</FormLabel>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduto}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Produto {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduto(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={control}
                name={`produtos.${index}.nome` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do produto"
                        {...field}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-xs">
                      {errors.produtos?.[index]?.nome?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`produtos.${index}.codigo` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Código do Produto *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código"
                        {...field}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-xs">
                      {errors.produtos?.[index]?.codigo?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={control}
                name={`produtos.${index}.tamanho` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tamanho</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: M, G, 42"
                        {...field}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-xs">
                      {errors.produtos?.[index]?.tamanho?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`produtos.${index}.quantidade` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "" : parseInt(value) || 1);
                        }}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-xs">
                      {errors.produtos?.[index]?.quantidade?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
