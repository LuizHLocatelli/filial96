
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
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function QuickAccess() {
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
                  <div className="flex items-center gap-2 flex-wrap">
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
