
import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderArchive, Store } from "lucide-react";

interface MoveisOverviewProps {
  onNavigate: (tab: string) => void;
}

export function MoveisOverview({ onNavigate }: MoveisOverviewProps) {
  const handleNavigation = useCallback((tab: string) => {
    onNavigate(tab);
  }, [onNavigate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group" onClick={() => handleNavigation("orientacoes")}>
        <div className="bg-gradient-to-r from-green-500 to-emerald-700 h-2 w-full" />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Orientações</CardTitle>
            <FileText className="h-5 w-5 text-green-600 group-hover:text-green-800 transition-colors" />
          </div>
          <CardDescription>VM e Informativos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Acesse orientações de VM e informativos importantes para o setor de móveis.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group" onClick={() => handleNavigation("diretorio")}>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-700 h-2 w-full" />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Diretório</CardTitle>
            <FolderArchive className="h-5 w-5 text-blue-600 group-hover:text-blue-800 transition-colors" />
          </div>
          <CardDescription>Arquivos do setor</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Acesse documentos e arquivos importantes do setor de móveis.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group" onClick={() => handleNavigation("vendao")}>
        <div className="bg-gradient-to-r from-purple-500 to-violet-700 h-2 w-full" />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Venda O</CardTitle>
            <Store className="h-5 w-5 text-purple-600 group-hover:text-purple-800 transition-colors" />
          </div>
          <CardDescription>Vendas de outras filiais</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Gerencie vendas de outras filiais com entrega em nossa loja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
