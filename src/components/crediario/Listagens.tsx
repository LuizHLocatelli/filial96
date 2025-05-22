
import { useState } from "react";
import { useListagens } from "@/hooks/crediario/useListagens";
import { ListagemUploader } from "./listagens/ListagemUploader";
import { ListagemList } from "./listagens/ListagemList";

export function Listagens() {
  const { listagens, isLoading, isUploading, addListagem, deleteListagem } = useListagens();

  // Update the handler to return a boolean as expected
  const handleUpload = async (file: File, indicator: string | null) => {
    const result = await addListagem(file, indicator);
    return !!result; // Convert to boolean
  };

  // Update the handler to match expected signature
  const handleDelete = async (id: string, fileUrl: string) => {
    return await deleteListagem(id);
  };

  // View handler
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
