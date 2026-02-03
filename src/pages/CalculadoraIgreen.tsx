import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Zap, CheckCircle, Info, Loader2, ArrowLeft, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, useReducedMotion } from "framer-motion";
import { CalculatorThemeToggle } from "@/components/theme/CalculatorThemeToggle";
import ondeverImage from "@/assets/onde-ver-tipo-fornecimento.png";
import "./CalculadoraIgreen-clean.css";

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
  const navigate = useNavigate();
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
const shouldReduceMotion = useReducedMotion();
const { toast } = useToast();
const isMobile = useIsMobile();

  const handleConsumoChange = useCallback((index: number, valor: string) => {
    const parsed = parseFloat(valor);
    const safeValue = Number.isFinite(parsed) ? parsed : 0;
    setDados(prev => {
      const novoConsumo = [...prev.consumoMeses];
      novoConsumo[index] = safeValue;
      return { ...prev, consumoMeses: novoConsumo };
    });
  }, []);

  const calcular = () => {
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
    // Simular processamento
    setTimeout(() => {
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

      setResultado({
        mediaConsumo,
        consumoElegivel,
        elegivel,
        percentualDesconto,
        economiaMensal
      });
      setCalculando(false);
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
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl relative z-10">
        {/* Header com Botão Voltar e Theme Toggle */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/painel-da-regiao')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Painel da Região
            </Button>
            <CalculatorThemeToggle />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Calculadora iGreen
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Calcule sua economia na conta de luz
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
        >
          {/* Formulário */}
          <div className="space-y-3 sm:space-y-4">
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
                    <DialogContent className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'max-w-3xl p-0'} overflow-hidden`} hideCloseButton>
                      <StandardDialogHeader
                        icon={Eye}
                        iconColor="primary"
                        title="Tipo de Fornecimento"
                        description="Veja onde encontrar esta informação na sua conta de luz"
                        onClose={() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))}
                      />
                      <StandardDialogContent className="p-4">
                        <img
                          src={ondeverImage}
                          alt="Onde encontrar o tipo de fornecimento na conta de luz"
                          className="w-full h-auto rounded-lg"
                        />
                      </StandardDialogContent>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {tiposFornecimento.map((tipo) => (
                    <div
                      key={tipo.value}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:scale-105 touch-target tipo-fornecimento-option ${
                        dados.tipoFornecimento === tipo.value
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      }`}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
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
                    <div className={`p-4 sm:p-6 rounded-lg border text-center transition-all ${resultado.elegivel
                      ? "bg-gradient-to-br from-green-50/90 to-emerald-50/90 border-green-300 dark:from-green-950/60 dark:to-emerald-950/60 dark:border-green-700"
                      : "bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-300 dark:from-amber-950/60 dark:to-orange-950/60 dark:border-amber-700"
                      }`}>
                      {resultado.elegivel ? (
                        <>
                          <div className="relative">
                            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4 animate-pulse" />
                            <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 mx-auto bg-green-400/20 rounded-full animate-ping"></div>
                          </div>
                          <h3 className="text-base sm:text-xl font-bold text-green-700 dark:text-green-300 mb-2">
                            🎉 Excelente Notícia! Seu Cliente é Elegível!
                          </h3>
                          <p className="text-sm sm:text-base text-green-600 dark:text-green-400 mb-3">
                            O consumo está perfeito para aderir ao iGreen Energy
                          </p>
                          <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 mt-3">
                            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                              💡 Cliente pode economizar na conta de luz com energia 100% limpa!
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <div className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500 mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full">
                              <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                          </div>
                          <h3 className="text-base sm:text-xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                            💭 Quase lá! Vamos Analisar as Opções
                          </h3>
                          <p className="text-sm sm:text-base text-amber-600 dark:text-amber-400 mb-3">
                            O consumo atual está um pouco abaixo do mínimo necessário
                          </p>
                          <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 mt-3 space-y-2">
                            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">
                              📋 <strong>Informações Adicionais:</strong>
                            </p>
                            <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 text-left space-y-1">
                              <p>• Consumo necessário: <strong>mínimo 100 kWh elegíveis</strong></p>
                              <p>• Consumo atual: <strong>{resultado.consumoElegivel.toFixed(1)} kWh elegíveis</strong></p>
                              <p>• Considere: unificar contas ou aguardar aumento no consumo</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Detalhes do Cálculo */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg p-3 sm:p-4 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          📊 Análise Detalhada do Consumo
                        </h4>

                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center p-2 sm:p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                            <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                              📈 Consumo médio mensal:
                            </span>
                            <Badge variant="secondary" className="text-xs sm:text-sm font-semibold">
                              {resultado.mediaConsumo.toFixed(1)} kWh
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center p-2 sm:p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                            <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                              ⚡ Consumo elegível:
                            </span>
                            <Badge
                              variant={resultado.elegivel ? "default" : "destructive"}
                              className="text-xs sm:text-sm font-semibold"
                            >
                              {resultado.consumoElegivel.toFixed(1)} kWh
                            </Badge>
                          </div>

                          {resultado.elegivel && (
                            <>
                              <div className="flex justify-between items-center p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                                  💰 Desconto aplicável:
                                </span>
                                <Badge className="bg-primary text-xs sm:text-sm font-semibold">
                                  {resultado.percentualDesconto}%
                                </Badge>
                              </div>

                            </>
                          )}
                        </div>
                      </div>
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
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: 0.2 }}
        >
          <div className="mt-6 sm:mt-8 lg:mt-10 glass-card rounded-lg p-4 sm:p-6 lg:p-8 shadow-soft">
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
    </div>
  );
}