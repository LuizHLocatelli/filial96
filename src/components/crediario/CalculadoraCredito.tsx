import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign } from "lucide-react";

interface ParcelaOption {
  value: string;
  label: string;
  parcelas: number;
  taxa: number;
}

const parcelasOptions: ParcelaOption[] = [
  { value: "1+2", label: "1+2x (Taxa de 5%)", parcelas: 3, taxa: 5 },
  { value: "1+4", label: "1+4x (Taxa de 5%)", parcelas: 5, taxa: 5 },
  { value: "1+9", label: "1+9x (Taxa de 7%)", parcelas: 10, taxa: 7 },
  { value: "1+14", label: "1+14x (Taxa de 8%)", parcelas: 15, taxa: 8 },
  { value: "1+19", label: "1+19x (Taxa de 10%)", parcelas: 20, taxa: 10 },
  { value: "1+24", label: "1+24x (Taxa de 12%)", parcelas: 25, taxa: 12 }
];

export function CalculadoraCredito() {
  const [valorDivida, setValorDivida] = useState("");
  const [parcelaSelecionada, setParcelaSelecionada] = useState("");
  const [resultado, setResultado] = useState<{
    valorTotal: number;
    valorParcela: number;
    detalhes: string;
  } | null>(null);

  const calcularParcela = () => {
    if (!valorDivida || !parcelaSelecionada) return;

    const valor = parseFloat(valorDivida.replace(/[^\d,]/g, "").replace(",", "."));
    if (isNaN(valor) || valor <= 0) return;

    const opcaoSelecionada = parcelasOptions.find(opt => opt.value === parcelaSelecionada);
    if (!opcaoSelecionada) return;

    // Cálculo: Valor + 8% seguro + taxa da opção selecionada
    const taxaSeguro = 8;
    const valorComSeguro = valor * (1 + taxaSeguro / 100);
    const valorTotal = valorComSeguro * (1 + opcaoSelecionada.taxa / 100);
    const valorParcela = valorTotal / opcaoSelecionada.parcelas;

    setResultado({
      valorTotal,
      valorParcela,
      detalhes: `${opcaoSelecionada.parcelas}x de R$ ${valorParcela.toFixed(2).replace(".", ",")}`
    });
  };

  const formatarMoeda = (valor: string) => {
    // Remove tudo que não é dígito
    const digits = valor.replace(/\D/g, "");
    
    // Converte para formato monetário
    const numero = parseFloat(digits) / 100;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const valorFormatado = formatarMoeda(valor);
    setValorDivida(valorFormatado);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Calculadora de Renegociação</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor-divida">Valor da Dívida</Label>
              <Input
                id="valor-divida"
                placeholder="R$ 0,00"
                value={valorDivida}
                onChange={handleValorChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcelas">Opção de Parcelamento</Label>
              <Select value={parcelaSelecionada} onValueChange={setParcelaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parcelamento" />
                </SelectTrigger>
                <SelectContent>
                  {parcelasOptions.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Taxa do Seguro:</strong> 8% (aplicada automaticamente)
              </p>
            </div>

            <Button 
              onClick={calcularParcela} 
              className="w-full"
              disabled={!valorDivida || !parcelaSelecionada}
            >
              Calcular Parcela
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado do Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            {resultado ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-primary/5 rounded-lg border">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Valor da Parcela
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    R$ {resultado.valorParcela.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {resultado.detalhes}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor Original:</span>
                    <span>R$ {valorDivida}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa do Seguro (8%):</span>
                    <span className="text-orange-600">+ R$ {((parseFloat(valorDivida.replace(/[^\d,]/g, "").replace(",", ".")) * 0.08)).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa do Parcelamento:</span>
                    <span className="text-orange-600">+ {parcelasOptions.find(opt => opt.value === parcelaSelecionada)?.taxa}%</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Valor Total:</span>
                    <span>R$ {resultado.valorTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados para calcular a parcela</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}