import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { OrientacaoFormValues } from "../schemas/orientacaoSchema";
import { FileInputField } from "./FileInputField";
import { UploadProgress } from "./UploadProgress";
import { SubmitButton } from "./SubmitButton";

interface OrientacaoFormProps {
  form: UseFormReturn<OrientacaoFormValues>;
  arquivo: File | null;
  isUploading: boolean;
  progress: number;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (data: OrientacaoFormValues) => Promise<void>;
}

export function OrientacaoForm({
  form,
  arquivo,
  isUploading,
  progress,
  handleFileChange,
  onSubmit
}: OrientacaoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título da orientação" {...field} className="bg-muted/40" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-muted/40">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vm">Visual Merchandising</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva esta orientação"
                  className="min-h-[120px] bg-muted/40"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileInputField 
          form={form} 
          arquivo={arquivo} 
          onFileChange={handleFileChange} 
        />

        <UploadProgress isUploading={isUploading} progress={progress} />

        <div className="pt-2">
          <SubmitButton isUploading={isUploading} />
        </div>
      </form>
    </Form>
  );
}
