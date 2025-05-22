
import { useState } from "react";
import { useListagens } from "@/hooks/crediario/useListagens";
import { ListagemUploader } from "./listagens/ListagemUploader";
import { ListagemList } from "./listagens/ListagemList";

export function Listagens() {
  const { listagens, isLoading, isUploading, addListagem, deleteListagem } = useListagens();

  const handleUpload = async (file: File, indicator: string | null) => {
    const result = await addListagem(file, indicator);
    return !!result; // Convert to boolean
  };

  const handleDelete = async (id: string) => {
    return await deleteListagem(id);
  };

  const handleView = (fileUrl: string, nome: string) => {
    // This function is kept for compatibility, but we now navigate via the ListagemItem component
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="md:col-span-1">
        <ListagemUploader 
          isUploading={isUploading} 
          onUpload={handleUpload} 
        />
      </div>

      <div className="flex flex-col space-y-6">
        <ListagemList 
          listagens={listagens}
          isLoading={isLoading}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
