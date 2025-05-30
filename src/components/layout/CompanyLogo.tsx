
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export function CompanyLogo() {
  return (
    <Link to="/" className="flex items-center space-x-3 group">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-sm group-hover:blur-none transition-all duration-300" />
        <div className="relative bg-gradient-to-r from-primary to-primary/80 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Filial 96
        </span>
        <span className="text-xs text-muted-foreground hidden sm:block leading-none">
          Sistema de Gestão
        </span>
      </div>
    </Link>
  );
}
