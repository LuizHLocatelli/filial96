import { ExternalLink } from "lucide-react";
import { ExternalLink as ExternalLinkType } from "@/types/painel-regiao";
import { LinkCard } from "./LinkCard";

interface QuickAccessSectionProps {
  links: ExternalLinkType[];
}

export const QuickAccessSection = ({ links }: QuickAccessSectionProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Acesso Rápido
        </h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
};
