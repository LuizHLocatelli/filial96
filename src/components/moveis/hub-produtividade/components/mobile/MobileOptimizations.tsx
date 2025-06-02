import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ProductivityStats } from '../../types';
import { cn } from '@/lib/utils';

interface MobileStatsCardProps {
  title: string;
  icon: React.ElementType;
  stats: any;
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function MobileStatsCard({
  title,
  icon: Icon,
  stats,
  color,
  isExpanded,
  onToggle
}: MobileStatsCardProps) {
  return (
    <Card className="transition-all duration-200">
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`mobile-stats-${title.toLowerCase()}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", `bg-${color}-50`)}>
              <Icon className={cn("h-4 w-4", `text-${color}-600`)} />
            </div>
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {stats.total}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <div
        id={`mobile-stats-${title.toLowerCase()}`}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0">
          {/* Conteúdo específico baseado no tipo */}
          {title === 'Rotinas' || title === 'Tarefas' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-700">{stats.concluidas}</div>
                  <div className="text-green-600">Concluídas</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-semibold text-yellow-700">{stats.pendentes}</div>
                  <div className="text-yellow-600">Pendentes</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-semibold text-red-700">{stats.atrasadas}</div>
                  <div className="text-red-600">Atrasadas</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{stats.percentualConclusao}%</div>
                <div className="text-xs text-muted-foreground">Taxa de conclusão</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold text-orange-700">{stats.naoLidas}</div>
                  <div className="text-orange-600">Não Lidas</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-700">{stats.recentes}</div>
                  <div className="text-blue-600">Recentes</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

interface MobileStatsOverviewProps {
  stats: ProductivityStats;
  isLoading: boolean;
}

export function MobileStatsOverview({ stats, isLoading }: MobileStatsOverviewProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(false);

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-6 bg-muted rounded w-8"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'rotinas',
      title: 'Rotinas',
      stats: stats.rotinas,
      color: 'blue',
      icon: require('lucide-react').CheckSquare
    },
    {
      id: 'orientacoes',
      title: 'Orientações',
      stats: stats.orientacoes,
      color: 'green',
      icon: require('lucide-react').FileText
    },
    {
      id: 'tarefas',
      title: 'Tarefas',
      stats: stats.tarefas,
      color: 'purple',
      icon: require('lucide-react').List
    }
  ];

  return (
    <div className="space-y-4">
      {/* Controles Mobile */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Estatísticas</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactMode(!compactMode)}
            className="flex items-center gap-1"
          >
            {compactMode ? (
              <>
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Expandir</span>
              </>
            ) : (
              <>
                <Minimize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Compacto</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {compactMode ? (
        /* Modo Compacto - Cards menores */
        <div className="grid grid-cols-3 gap-2">
          {cards.map((card) => (
            <Card key={card.id} className="p-3">
              <div className="text-center space-y-1">
                <card.icon className={cn("h-4 w-4 mx-auto", `text-${card.color}-600`)} />
                <div className="text-lg font-bold">{card.stats.total}</div>
                <div className="text-xs text-muted-foreground">{card.title}</div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Modo Normal - Cards expansíveis */
        <div className="space-y-3">
          {cards.map((card) => (
            <MobileStatsCard
              key={card.id}
              title={card.title}
              icon={card.icon}
              stats={card.stats}
              color={card.color}
              isExpanded={expandedCard === card.id}
              onToggle={() => handleCardToggle(card.id)}
            />
          ))}
        </div>
      )}

      {/* Resumo rápido sempre visível */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-700">
                {stats.rotinas.concluidas + stats.tarefas.concluidas}
              </div>
              <div className="text-xs text-green-600">Total Concluído</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-700">
                {stats.rotinas.atrasadas + stats.tarefas.atrasadas}
              </div>
              <div className="text-xs text-red-600">Total Atrasado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MobileTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    badge?: number;
    icon?: React.ElementType;
  }>;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function MobileTabs({ tabs, activeTab, onTabChange }: MobileTabsProps) {
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 sm:grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-1 py-2 px-1 relative text-xs"
            >
              <div className="flex items-center gap-1">
                {tab.icon && <tab.icon className="h-3 w-3" />}
                <span className="truncate max-w-[60px]">{tab.label}</span>
              </div>
              {tab.badge && tab.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                >
                  {tab.badge > 9 ? '9+' : tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
} 