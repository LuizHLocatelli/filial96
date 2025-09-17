import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Zap, CheckCircle, XCircle, Info, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { initializeProtection, useCodeProtection } from "@/utils/codeProtection";
import ondeverImage from "@/assets/onde-ver-tipo-fornecimento.png";
import "./CalculadoraIgreen.css";

interface CalculadoraData {
  distribuidora: string;
  tipoFornecimento: "monofasico" | "bifasico" | "trifasico" | "";
  consumoMeses: number[];
}

const distribuidoras = [
  { value: "ceee", label: "CEEE", desconto: 10 },
  { value: "rge", label: "RGE", desconto: 8 },
  { value: "celesc", label: "Celesc", desconto: 12 }
];

const tiposFornecimento = [
  { value: "monofasico", label: "Monofásico", taxa: 30 },
  { value: "bifasico", label: "Bifásico", taxa: 50 },
  { value: "trifasico", label: "Trifásico", taxa: 100 }
];

export default function CalculadoraIgreen() {
  const [dados, setDados] = useState<CalculadoraData>({
    distribuidora: "",
    tipoFornecimento: "",
    consumoMeses: Array(12).fill(0)
  });
  const [resultado, setResultado] = useState<{
    mediaConsumo: number;
    consumoElegivel: number;
    elegivel: boolean;
    percentualDesconto: number;
    economiaMensal: number;
  } | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [protectionActive, setProtectionActive] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isSecure, canExecute } = useCodeProtection();

  // Effect para inicializar proteção
  useEffect(() => {
    const initProtection = async () => {
      try {
        initializeProtection();
        
        // Proteção ativa apenas em produção
        const isProduction = process.env.NODE_ENV === 'production';
        setProtectionActive(isProduction);
        
        // Adiciona proteção específica para a calculadora
        const protectCalculatorData = () => {
          // Ofusca dados sensíveis apenas em produção
          if (isProduction) {
            Object.freeze(distribuidoras);
            Object.freeze(tiposFornecimento);
            
            // Protege variáveis globais
            (window as any).calculadoraData = undefined;
            (window as any).iGreenConfig = undefined;
          }
        };
        
        protectCalculatorData();
        
        // Log de desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Proteções configuradas para ativação em produção');
        }
      } catch (error) {
        console.error('Erro ao configurar proteção:', error);
      }
    };

    initProtection();
  }, []);

  // Effect para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect para detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para calcular padding-top responsivo
  const getResponsivePadding = () => {
    if (screenWidth <= 380) return '130px';
    if (screenWidth <= 480) return '140px';
    if (screenWidth <= 640) return '150px';
    if (screenWidth <= 768) return '160px';
    return '140px';
  };

  const handleConsumoChange = (index: number, valor: string) => {
    const novoConsumo = [...dados.consumoMeses];
    novoConsumo[index] = parseFloat(valor) || 0;
    setDados({ ...dados, consumoMeses: novoConsumo });
  };

  const calcular = () => {
    // Verifica proteção antes de executar (apenas em produção)
    if (process.env.NODE_ENV === 'production' && (!isSecure || !canExecute())) {
      toast({
        title: "Acesso negado",
        description: "Sistema de segurança ativado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!dados.distribuidora || !dados.tipoFornecimento) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const consumoValido = dados.consumoMeses.filter(valor => valor > 0);
    if (consumoValido.length === 0) {
      toast({
        title: "Consumo inválido",
        description: "Por favor, insira pelo menos um valor de consumo válido.",
        variant: "destructive",
      });
      return;
    }

    setCalculando(true);
    
    // Simular processamento com verificação de segurança
    setTimeout(() => {
      // Verificação adicional durante o cálculo (apenas em produção)
      if (process.env.NODE_ENV === 'production' && !canExecute()) {
        setCalculando(false);
        return;
      }

      // Algoritmo de cálculo protegido
      const calcularResultadoSeguro = () => {
        const soma = dados.consumoMeses.reduce((acc, valor) => acc + valor, 0);
        const mediaConsumo = soma / 12;
        
        const tipoSelecionado = tiposFornecimento.find(t => t.value === dados.tipoFornecimento);
        const taxaDesconto = tipoSelecionado?.taxa || 0;
        
        const consumoElegivel = mediaConsumo - taxaDesconto;
        const elegivel = consumoElegivel >= 100;
        
        const distribuidoraSelecionada = distribuidoras.find(d => d.value === dados.distribuidora);
        const percentualDesconto = distribuidoraSelecionada?.desconto || 0;
        
        // Estimativa de economia (baseada em R$ 0,75 por kWh)
        const economiaMensal = elegivel ? (consumoElegivel * 0.75 * percentualDesconto) / 100 : 0;

        return {
          mediaConsumo,
          consumoElegivel,
          elegivel,
          percentualDesconto,
          economiaMensal
        };
      };

      try {
        const resultado = calcularResultadoSeguro();
        setResultado(resultado);
      } catch (error) {
        toast({
          title: "Erro no cálculo",
          description: "Ocorreu um erro durante o processamento.",
          variant: "destructive",
        });
      } finally {
        setCalculando(false);
      }
    }, 1500);
  };

  const limparFormulario = () => {
    setDados({
      distribuidora: "",
      tipoFornecimento: "",
      consumoMeses: Array(12).fill(0)
    });
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-background calculadora-protected">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Calculadora Igreen - Desconto na Conta de Luz</h1>
        <p>Calcule se você é elegível para economia de 8% a 12% na sua conta de luz com iGreen Energy</p>
      </div>
      
      {/* Background Pattern Consistency */}
      <div className="fixed inset-0 opacity-30 pointer-events-none dark:opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      {/* Header Flutuante Fixo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-6 left-0 right-0 z-40 flex justify-center px-4"
      >
        <div className={cn(
          "glass-card calculadora-header-flutuante p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 transition-all duration-300 w-full max-w-xl",
          scrolled && "calculadora-header-scrolled"
        )}>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Ícone */}
            <div className="p-3 sm:p-3.5 bg-primary rounded-xl text-primary-foreground shadow-lg flex-shrink-0 transition-all duration-300 flex items-center justify-center relative">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
              {protectionActive && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1" title="Sistema protegido">
                  <Shield className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            
            {/* Título Centralizado */}
            <div className="flex-1 text-center min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">
                Calculadora iGreen
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate opacity-80">
                Economia na conta de luz
              </p>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex-shrink-0">
              <div className="calculadora-theme-toggle-header p-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl relative z-10 calculadora-main-container" style={{ paddingTop: getResponsivePadding() }}>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
        >
          {/* Formulário */}
          <div className="space-y-4 sm:space-y-6">
            {/* Dados da Distribuidora */}
            <Card className="glass-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                  Distribuidora de Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distribuidora" className="text-sm font-medium">
                    Distribuidora de Energia *
                  </Label>
                  <Select value={dados.distribuidora} onValueChange={(value) => setDados({ ...dados, distribuidora: value })}>
                    <SelectTrigger className="h-10 sm:h-11 calculadora-select focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Selecione sua distribuidora" />
                    </SelectTrigger>
                    <SelectContent>
                      {distribuidoras.map((dist) => (
                        <SelectItem key={dist.value} value={dist.value}>
                          <span className="flex items-center justify-between w-full">
                            <span>{dist.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {dist.desconto}% desconto
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Fornecimento */}
            <Card className="glass-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  Tipo de Fornecimento *
                </CardTitle>
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-950/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 leading-tight">
                      Não sabe qual é o seu tipo de fornecimento?
                    </span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/80 dark:bg-gray-800/80 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 w-full text-xs sm:text-sm h-8 sm:h-9 calculadora-button focus:ring-0 focus:ring-offset-0"
                      >
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Ver onde encontrar na conta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs sm:max-w-3xl">
                      <img 
                        src={ondeverImage} 
                        alt="Onde encontrar o tipo de fornecimento na conta de luz" 
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {tiposFornecimento.map((tipo) => (
                    <div
                      key={tipo.value}
                      className={cn(
                        "p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:scale-105 touch-target tipo-fornecimento-option",
                        dados.tipoFornecimento === tipo.value
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      )}
                      onClick={() => setDados({ ...dados, tipoFornecimento: tipo.value as any })}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setDados({ ...dados, tipoFornecimento: tipo.value as any });
                        }
                      }}
                    >
                      <div className="text-center">
                        <h3 className="text-sm sm:text-base font-semibold mb-1">{tipo.label}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Taxa: {tipo.taxa} kWh
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Consumo */}
            <Card className="glass-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Histórico de Consumo (últimos 12 meses)</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Insira o consumo em kWh de cada mês
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 grid-responsive">
                  {dados.consumoMeses.map((valor, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground text-responsive">
                        Mês {index + 1}
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={valor || ""}
                        onChange={(e) => handleConsumoChange(index, e.target.value)}
                        className="text-xs sm:text-sm h-8 sm:h-9 touch-target calculadora-input focus:ring-0 focus:ring-offset-0"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button 
                onClick={calcular} 
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base calculadora-button focus:ring-0 focus:ring-offset-0"
                disabled={calculando}
                size="lg"
              >
                {calculando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Elegibilidade
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={limparFormulario}
                className="h-10 sm:h-11 text-sm sm:text-base sm:min-w-[120px] calculadora-button focus:ring-0 focus:ring-offset-0"
                size="lg"
              >
                Limpar
              </Button>
            </div>
          </div>

          {/* Resultado */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit glass-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Resultado do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                {resultado ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Status de Elegibilidade */}
                    <div className={`p-4 sm:p-6 rounded-lg border text-center transition-all ${
                      resultado.elegivel 
                        ? "bg-green-50/80 border-green-200 dark:bg-green-950/50 dark:border-green-800"
                        : "bg-red-50/80 border-red-200 dark:bg-red-950/50 dark:border-red-800"
                    }`}>
                      {resultado.elegivel ? (
                        <>
                          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                            Parabéns! Você é elegível ao iGreen Energy
                          </h3>
                          <p className="text-sm sm:text-base text-green-600 dark:text-green-300">
                            Seu consumo atende aos critérios do programa
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                            Infelizmente você não atende aos critérios
                          </h3>
                          <p className="text-sm sm:text-base text-red-600 dark:text-red-300">
                            É necessário consumo médio acima de 100 kWh
                          </p>
                        </>
                      )}
                    </div>

                    {/* Detalhes do Cálculo */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium">Consumo médio mensal:</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {resultado.mediaConsumo.toFixed(1)} kWh
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium">Consumo elegível:</span>
                        <Badge 
                          variant={resultado.elegivel ? "default" : "destructive"}
                          className="text-xs sm:text-sm"
                        >
                          {resultado.consumoElegivel.toFixed(1)} kWh
                        </Badge>
                      </div>

                      {resultado.elegivel && (
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-primary/5 rounded-lg">
                          <span className="text-xs sm:text-sm font-medium">Desconto aplicável:</span>
                          <Badge className="bg-primary text-xs sm:text-sm">
                            {resultado.percentualDesconto}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Preencha os dados para ver o resultado do cálculo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Footer Informativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
        <div className="mt-8 sm:mt-12 lg:mt-16 glass-card rounded-lg p-4 sm:p-6 lg:p-8 shadow-soft">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              Sobre o iGreen Energy
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              O iGreen Energy é um programa de energia limpa que permite economia de 8% a 12% na sua conta de luz, 
              contribuindo para um futuro mais sustentável enquanto você economiza dinheiro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">8% - 12%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Desconto na conta de luz</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">100%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Energia limpa</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">0</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Taxa de adesão</p>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
      
      {/* Indicador de Proteção */}
      {protectionActive && (
        <div className="protection-indicator" title="Sistema de proteção ativo">
          <Shield className="h-3 w-3" />
        </div>
      )}
      
      {/* Detector de DevTools (invisível) */}
      <div className="devtools-detector" />
    </div>
  );
}