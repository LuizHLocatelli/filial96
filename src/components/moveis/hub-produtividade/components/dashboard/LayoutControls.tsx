import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Layout, 
  Settings2, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useLayoutPreferences, LayoutDensity } from '../../hooks/useLayoutPreferences';
import { useResponsive } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';

interface LayoutControlsProps {
  className?: string;
  showFullControls?: boolean;
}

export function LayoutControls({ className, showFullControls = false }: LayoutControlsProps) {
  const { 
    preferences, 
    layoutConfig,
    setDensity, 
    toggleResumoRapido,
    setStatsPerRow,
    resetPreferences,
    exportPreferences,
    importPreferences
  } = useLayoutPreferences();
  
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const densityOptions: Array<{ value: LayoutDensity; label: string; icon: React.ComponentType<any>; description: string }> = [
    { 
      value: 'compact', 
      label: 'Compacto', 
      icon: Minimize2, 
      description: 'Máxima densidade de informação' 
    },
    { 
      value: 'normal', 
      label: 'Normal', 
      icon: Layout, 
      description: 'Equilibrio entre espaço e informação' 
    },
    { 
      value: 'comfortable', 
      label: 'Confortável', 
      icon: Maximize2, 
      description: 'Mais espaçoso e respirável' 
    }
  ];

  const getCurrentDeviceIcon = () => {
    if (isMobile) return Smartphone;
    if (isTablet) return Tablet;
    return Monitor;
  };

  const handleExportSettings = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub-produtividade-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importPreferences(content)) {
        // Sucesso - poderia mostrar toast
        console.log('Preferências importadas com sucesso');
      } else {
        // Erro - poderia mostrar toast de erro
        console.error('Erro ao importar preferências');
      }
    };
    reader.readAsText(file);
  };

  // Controle simples (apenas dropdown de densidade)
  if (!showFullControls) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("flex items-center gap-2", className)}>
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Densidade</span>
            <Badge variant="secondary" className="hidden md:inline-flex text-xs">
              {densityOptions.find(d => d.value === preferences.density)?.label}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Densidade do Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {densityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setDensity(option.value)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  preferences.density === option.value && "bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {preferences.density === option.value && (
                  <Badge variant="default" className="text-xs">Ativo</Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Controles avançados (modal completo)
  return (
    <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("flex items-center gap-2", className)}>
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Layout</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Preferências de Layout
          </DialogTitle>
          <DialogDescription>
            Personalize a aparência e comportamento do Hub de Produtividade
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Densidade */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Densidade do Layout</Label>
            <div className="grid grid-cols-1 gap-2">
              {densityOptions.map((option) => {
                const Icon = option.icon;
                const DeviceIcon = getCurrentDeviceIcon();
                return (
                  <button
                    key={option.value}
                    onClick={() => setDensity(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg text-left transition-colors",
                      preferences.density === option.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="h-3 w-3 text-muted-foreground" />
                      {preferences.density === option.value && (
                        <Badge variant="default" className="text-xs">Ativo</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opções Específicas */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Opções de Exibição</Label>
            
            {/* Mostrar Resumo Rápido */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="resumo-rapido" className="text-sm">
                  Mostrar Resumo do Dia
                </Label>
                <p className="text-xs text-muted-foreground">
                  Exibe um card com resumo das atividades diárias
                </p>
              </div>
              <Switch
                id="resumo-rapido"
                checked={preferences.showResumoRapido}
                onCheckedChange={toggleResumoRapido}
              />
            </div>

            {/* Cards por linha */}
            <div className="space-y-2">
              <Label className="text-sm">
                Cards de estatística por linha: {preferences.statsPerRow}
              </Label>
              <Slider
                value={[preferences.statsPerRow]}
                onValueChange={([value]) => setStatsPerRow(value)}
                max={8}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Menos</span>
                <span>Mais</span>
              </div>
            </div>
          </div>

          {/* Configuração Atual */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Configuração Atual</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Espaçamento: {layoutConfig.spacing}</div>
              <div>Padding: {layoutConfig.cardPadding}</div>
              <div>Grid: {layoutConfig.statsGrid}</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={resetPreferences}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Resetar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSettings}
              className="flex items-center gap-2"
            >
              <Download className="h-3 w-3" />
              Exportar
            </Button>
            
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                type="button"
              >
                <Upload className="h-3 w-3" />
                Importar
              </Button>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 