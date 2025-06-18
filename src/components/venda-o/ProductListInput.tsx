import { useFieldArray, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { PlusCircle, X } from "lucide-react";
import { FormValues } from "./SaleUploader"; // Assumindo que FormValues está em SaleUploader

interface ProductListInputProps {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  setValue: (name: any, value: any, options?: Object) => void;
  getValues: (name?: any) => any;
}

export function ProductListInput({
  control,
  register,
  errors,
  setValue,
  getValues,
}: ProductListInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "produtos",
  });

  const addProduct = () => {
    append({ nome: "", codigo: "" });
  };

  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <FormLabel className="text-xs sm:text-sm">Produtos</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduct}
          className="flex items-center text-xs sm:text-sm h-7 sm:h-8"
        >
          <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Adicionar Produto
        </Button>
      </div>

      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2 mb-2 items-start">
          <div className="flex-1">
            <FormField
              control={control}
              name={`produtos.${index}.nome` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Nome do produto"
                      {...field}
                      className="text-xs sm:text-sm h-8 sm:h-10 bg-muted/40"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {errors.produtos?.[index]?.nome?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className="w-20 sm:w-24">
            <FormField
              control={control}
              name={`produtos.${index}.codigo` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Código"
                      {...field}
                      maxLength={6}
                      className="text-xs sm:text-sm h-8 sm:h-10 bg-muted/40"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {errors.produtos?.[index]?.codigo?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeProduct(index)}
              className="touch-friendly mt-0" // Ajuste de alinhamento
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
} 