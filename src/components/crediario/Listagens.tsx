
import { useState } from "react";
import { useListagens } from "@/hooks/crediario/useListagens";
import { ListagemUploader } from "./listagens/ListagemUploader";
import { ListagemList } from "./listagens/ListagemList";
import { PdfViewer } from "./listagens/PdfViewer";

export function Listagens() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const { listagens, isLoading, isUploading, addListagem, deleteListagem } = useListagens();

  const handleUpload = async (file: File, indicator: string | null) => {
    return await addListagem(file, indicator);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (selectedPdf === fileUrl) {
      setSelectedPdf(null);
      setPdfName(null);
    }
    await deleteListagem(id, fileUrl);
  };

  const handleView = (fileUrl: string, nome: string) => {
    setSelectedPdf(fileUrl);
    setPdfName(nome);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ListagemUploader 
          isUploading={isUploading} 
          onUpload={handleUpload} 
        />
      </div>

      <div className="md:col-span-2 flex flex-col space-y-6">
        <ListagemList 
          listagens={listagens}
          isLoading={isLoading}
          onView={handleView}
          onDelete={handleDelete}
        />

        {selectedPdf && (
          <PdfViewer 
            pdfUrl={selectedPdf}
            pdfName={pdfName}
          />
        )}
      </div>
    </div>
  );
}
