
import { OrientacaoCard } from "./OrientacaoCard";
import { Orientacao } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacoesGridProps {
  orientacoes: Orientacao[];
  viewMode: "grid" | "list";
  onViewOrientacao: (orientacao: Orientacao) => void;
}

export function OrientacoesGrid({ orientacoes, viewMode, onViewOrientacao }: OrientacoesGridProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`grid gap-3 w-full ${
      viewMode === "grid" 
        ? (isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
        : 'grid-cols-1'
    }`}>
      {orientacoes.map((orientacao, index) => (
        <div
          key={orientacao.id}
          className="animate-fade-in w-full"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <OrientacaoCard 
            orientacao={orientacao} 
            onView={onViewOrientacao}
          />
        </div>
      ))}
    </div>
  );
}
