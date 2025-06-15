
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderArchive, 
  ShoppingCart, 
  Star, 
  Calendar,
  Package,
  TrendingUp,
  Users,
  FileText,
  ArrowRight
} from "lucide-react";

interface MoveisOverviewProps {
  onNavigate: (tab: string) => void;
}

export function MoveisOverview({ onNavigate }: MoveisOverviewProps) {
  const quickActions = [
    {
      title: "Diretório",
      description: "Organize e acesse seus arquivos",
      icon: FolderArchive,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
      action: () => onNavigate("diretorio")
    },
    {
      title: "Venda O",
      description: "Vendas de outras filiais",
      icon: ShoppingCart,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30",
      action: () => onNavigate("vendao")
    },
    {
      title: "Produto Foco",
      description: "Produtos prioritários do mês",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/30",
      action: () => onNavigate("produto-foco")
    },
    {
      title: "Descontinuados",
      description: "Oportunidades especiais com desconto",
      icon: Package,
      color: "from-red-500 to-orange-600",
      bgColor: "from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/30",
      action: () => onNavigate("descontinuados"),
      badge: "PROMOÇÃO",
      badgeColor: "bg-gradient-to-r from-red-500 to-orange-500"
    },
    {
      title: "Folgas",
      description: "Controle de folgas da equipe",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30",
      action: () => onNavigate("folgas")
    }
  ];

  const stats = [
    {
      title: "Produtos Ativos",
      value: "847",
      change: "+12%",
      icon: Package,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Vendas do Mês",
      value: "R$ 89.4K",
      change: "+23%",
      icon: TrendingUp,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Equipe Ativa",
      value: "15",
      change: "100%",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Documentos",
      value: "124",
      change: "+8%",
      icon: FileText,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header de Boas-vindas */}
      <Card className="border-0 bg-gradient-to-r from-green-500/10 via-green-600/5 to-green-500/10 dark:from-green-900/20 dark:via-green-800/10 dark:to-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Bem-vindo ao Setor de Móveis
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie produtos, vendas e sua equipe de forma eficiente
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-0 bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className={`border-0 bg-gradient-to-br ${action.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                <CardContent className="p-6" onClick={action.action}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    {action.badge && (
                      <Badge className={`${action.badgeColor} text-white font-bold text-xs px-2 py-1 shadow-sm`}>
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end mt-4">
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Novidades */}
      <Card className="border-0 bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            Novidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/30">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Nova seção: Produtos Descontinuados
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Catálogo especial com produtos em promoção para aumentar suas vendas
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Metas atualizadas para este mês
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confira suas metas individuais e da equipe na seção Produto Foco
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
