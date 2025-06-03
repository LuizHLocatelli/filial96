import { Link, useLocation } from "react-router-dom";
import { Building2, CreditCard, Image, User, ChevronRight, Activity, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "Hub de Produtividade",
    href: "/",
    icon: Activity,
    description: "Central de rotinas e tarefas"
  },
  {
    title: "Móveis",
    href: "/moveis",
    icon: Building2,
    description: "Gestão do setor de móveis"
  },
  {
    title: "Moda",
    href: "/moda",
    icon: Shirt,
    description: "Gestão do setor de moda"
  },
  {
    title: "Crediário",
    href: "/crediario",
    icon: CreditCard,
    description: "Gestão de crediário"
  },
  {
    title: "Cards Promocionais",
    href: "/cards-promocionais",
    icon: Image,
    description: "Materiais promocionais"
  },
  {
    title: "Perfil",
    href: "/perfil",
    icon: User,
    description: "Configurações da conta"
  }
];

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="border-t bg-background/95 backdrop-blur-lg">
      <div className="container py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
