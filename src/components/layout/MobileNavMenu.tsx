import { Link, useLocation } from "react-router-dom";
import { Building2, CreditCard, Image, User, ChevronRight, Activity, Shirt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

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

const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const location = useLocation();

  // Fechar menu com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={menuVariants}
          className="border-t bg-background/98 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          {/* Header do menu com botão de fechar */}
          <motion.div 
            className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent"
            variants={itemVariants}
          >
            <div>
              <h3 className="font-semibold text-sm text-foreground">Navegação</h3>
              <p className="text-xs text-muted-foreground">Escolha uma seção</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Lista de navegação melhorada */}
          <div className="container py-3">
            <nav className="space-y-1">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <motion.div
                    key={item.href}
                    variants={itemVariants}
                    custom={index}
                  >
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl transition-all duration-300",
                        "hover:shadow-md active:scale-[0.98]",
                        isActive 
                          ? cn("border border-primary/20 shadow-sm", "bg-primary/10")
                          : "hover:bg-accent/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Ícone com background padrão */}
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
                          isActive 
                            ? "scale-110 bg-primary/10" 
                            : "bg-muted group-hover:bg-accent"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                        </div>
                        
                        {/* Texto com melhor tipografia */}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium text-sm truncate transition-colors duration-300",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {/* Indicador visual melhorado */}
                      <div className="flex items-center space-x-2">
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-primary rounded-full"
                          />
                        )}
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all duration-300",
                          isActive 
                            ? "text-primary translate-x-1" 
                            : "text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5"
                        )} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Footer decorativo */}
          <motion.div 
            className="h-2 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
            variants={itemVariants}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
