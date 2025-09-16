import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Zap, CheckCircle, XCircle, Info, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const handleConsumoChange = (index: number, valor: string) => {
    const novoConsumo = [...dados.consumoMeses];
    novoConsumo[index] = parseFloat(valor) || 0;
    setDados({ ...dados, consumoMeses: novoConsumo });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Calculadora Igreen - Desconto na Conta de Luz</h1>
        <p>Calcule se você é elegível para economia de 8% a 12% na sua conta de luz com iGreen Energy</p>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center calculadora-header">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="calculadora-icon-container p-2 md:p-3 bg-green-500 rounded-xl text-white">
              <Zap className="calculadora-icon" />
            </div>
            <h1 className="calculadora-title text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Calculadora iGreen
            </h1>
          </div>
          <p className="calculadora-subtitle text-base md:text-xl text-gray-600 dark:text-gray-300">
            Descubra se você é elegível para economia na sua conta de luz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            {/* Dados da Distribuidora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Distribuidora de Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distribuidora">Distribuidora de Energia *</Label>
                  <Select value={dados.distribuidora} onValueChange={(value) => setDados({ ...dados, distribuidora: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua distribuidora" />
                    </SelectTrigger>
                    <SelectContent>
                      {distribuidoras.map((dist) => (
                        <SelectItem key={dist.value} value={dist.value}>
                          {dist.label} ({dist.desconto}% de desconto)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Fornecimento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Tipo de Fornecimento *
                </CardTitle>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      Não sabe qual é o seu tipo de fornecimento?
                    </span>
                  </div>
                  <div className="mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 w-full sm:w-auto">
                          <Info className="h-4 w-4 mr-2" />
                          Clique aqui para ver onde encontrar na sua conta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img 
                          src={ondeverImage} 
                          alt="Onde encontrar o tipo de fornecimento na conta de luz" 
                          className="w-full h-auto rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tiposFornecimento.map((tipo) => (
                    <div
                      key={tipo.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        dados.tipoFornecimento === tipo.value
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                      onClick={() => setDados({ ...dados, tipoFornecimento: tipo.value as any })}
                    >
                      <div className="text-center">
                        <h3 className="font-semibold">{tipo.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Taxa: {tipo.taxa} kWh
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Consumo */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Consumo (últimos 12 meses)</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Insira o consumo em kWh de cada mês
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {dados.consumoMeses.map((valor, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-xs">Mês {index + 1}</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={valor || ""}
                        onChange={(e) => handleConsumoChange(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex gap-4">
              <Button 
                onClick={calcular} 
                className="flex-1"
                disabled={calculando}
              >
                {calculando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={limparFormulario}>
                Limpar
              </Button>
            </div>
          </div>

          {/* Resultado */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Resultado do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                {resultado ? (
                  <div className="space-y-6">
                    {/* Status de Elegibilidade */}
                    <div className={`p-6 rounded-lg border text-center ${
                      resultado.elegivel 
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}>
                      {resultado.elegivel ? (
                        <>
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                            Parabéns! Você é elegível ao iGreen Energy
                          </h3>
                          <p className="text-green-600 dark:text-green-300">
                            Seu consumo atende aos critérios do programa
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                            Infelizmente você não atende aos critérios
                          </h3>
                          <p className="text-red-600 dark:text-red-300">
                            É necessário consumo médio acima de 100 kWh
                          </p>
                        </>
                      )}
                    </div>

                    {/* Detalhes do Cálculo */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span>Consumo médio mensal:</span>
                        <Badge variant="secondary">
                          {resultado.mediaConsumo.toFixed(1)} kWh
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span>Consumo elegível:</span>
                        <Badge variant={resultado.elegivel ? "default" : "destructive"}>
                          {resultado.consumoElegivel.toFixed(1)} kWh
                        </Badge>
                      </div>

                      {resultado.elegivel && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <span>Desconto aplicável:</span>
                            <Badge className="bg-green-500">
                              {resultado.percentualDesconto}%
                            </Badge>
                          </div>
                          
                          
                        </>
                      )}
                    </div>

                    
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Preencha os dados para ver o resultado do cálculo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sobre o iGreen Energy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              O iGreen Energy é um programa de energia limpa que permite economia de 8% a 12% na sua conta de luz, 
              contribuindo para um futuro mais sustentável enquanto você economiza dinheiro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">8% - 12%</div>
              <p className="text-gray-600 dark:text-gray-300">Desconto na conta de luz</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-gray-600 dark:text-gray-300">Energia limpa</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <p className="text-gray-600 dark:text-gray-300">Taxa de adesão</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}