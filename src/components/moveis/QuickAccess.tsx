import { 
  FileText, 
  FolderOpen, 
  Target, 
  Calendar,
  Plus,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickAccessProps {
  variant?: "default" | "horizontal" | "minimal" | "compact";
}

export function QuickAccess({ variant = "horizontal" }: QuickAccessProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const sections = [
    {
      title: "Orientações",
      description: "Gerencie orientações e tarefas",
      icon: FileText,
      path: "/moveis/orientacoes",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      stats: { active: 12, pending: 3 }
    },
    {
      title: "Diretório",
      description: "Arquivos e documentos",
      icon: FolderOpen,
      path: "/moveis/diretorio",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      stats: { files: 48, recent: 5 }
    },
    {
      title: "Produto Foco",
      description: "Produtos em destaque",
      icon: Target,
      path: "/moveis/produto-foco",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      stats: { products: 3, sales: 24 }
    },
    {
      title: "Folgas",
      description: "Calendário de folgas",
      icon: Calendar,
      path: "/moveis/folgas",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      stats: { thisMonth: 8, pending: 2 }
    }
  ];

  // Variante Horizontal Compacta
  if (variant === "horizontal") {
    return (
      <div className="w-full p-2 bg-background border rounded-lg">
        <ScrollArea className="w-full">
          <div className="flex items-center space-x-2 px-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <TooltipProvider key={section.title} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 flex items-center gap-2 whitespace-nowrap"
                        onClick={() => navigate(section.path)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{section.title}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{section.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Variante Mínima (apenas ícones)
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center gap-1 p-2 bg-background border rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <TooltipProvider key={section.title} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md"
                    onClick={() => navigate(section.path)}
                    aria-label={section.title}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-center">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  // Variante Compacta (cards menores)
  if (variant === "compact") {
    return (
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.title}
              className={`hover-lift cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium group ${section.bgColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(section.path)}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                    <div className="flex gap-1">
                      {section.title === "Orientações" && (
                        <>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {section.stats.active}
                          </Badge>
                        </>
                      )}
                      {section.title === "Diretório" && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {section.stats.files}
                        </Badge>
                      )}
                      {section.title === "Produto Foco" && (
                        <Badge variant="outline" className="text-xs px-1 py-0 text-green-600">
                          {section.stats.sales}
                        </Badge>
                      )}
                      {section.title === "Folgas" && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {section.stats.thisMonth}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Variante Default (original)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className={`font-bold gradient-text ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Setor Móveis
        </h1>
        <p className="text-muted-foreground">
          Acesso rápido às principais funcionalidades
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.title}
              className={`hover-lift cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium group ${section.bgColor}`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => navigate(section.path)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.path);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    {section.title === "Orientações" && (
                      <>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.active} Ativas
                        </Badge>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.pending} Pendentes
                        </Badge>
                      </>
                    )}
                    {section.title === "Diretório" && (
                      <>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.files} Arquivos
                        </Badge>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.recent} Recentes
                        </Badge>
                      </>
                    )}
                    {section.title === "Produto Foco" && (
                      <>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.products} Produtos
                        </Badge>
                        <Badge variant="outline" className="bg-background/50 text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {section.stats.sales} Vendas
                        </Badge>
                      </>
                    )}
                    {section.title === "Folgas" && (
                      <>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.thisMonth} Este Mês
                        </Badge>
                        <Badge variant="outline" className="bg-background/50">
                          {section.stats.pending} Pendentes
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
