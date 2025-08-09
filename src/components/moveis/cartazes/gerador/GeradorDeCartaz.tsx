import { useState, useMemo } from "react";
import "./GeradorDeCartaz.css";
import { Button } from "@/components/ui/button";

export default function GeradorDeCartaz() {
  // Estados para armazenar os dados do formulário
  const [desconto, setDesconto] = useState("R$ 600 de Desconto!");
  const [nomeProduto, setNomeProduto] = useState("Lavadora Consul 13KG");
  const [codigoProduto, setCodigoProduto] = useState("860079 - 860080 (544)");
  const [valorDe, setValorDe] = useState("2.499,90");
  const [valorPor, setValorPor] = useState("1.899,90");
  const [qtdeParcelas, setQtdeParcelas] = useState("17");
  const [valorParcela, setValorParcela] = useState("181,00");
  const [validade, setValidade] = useState(
    "Promoção válida de 06 a 12/05/2025 ou enquanto durarem os estoques."
  );

  // Lógica segura para separar o valor da parcela (ex: 181,00 -> 181 e 00)
  const { parteInteira, parteDecimal } = useMemo(() => {
    const [inteira, decimal] = (valorParcela || "").split(",");
    return {
      parteInteira: inteira || "0",
      parteDecimal: (decimal ?? "00").padEnd(2, "0").slice(0, 2),
    };
  }, [valorParcela]);

  return (
    <div className="app-container">
      {/* Formulário (oculto na impressão) */}
      <div className="formulario-container">
        <h3>Preencha os dados do Cartaz</h3>

        <label>Desconto</label>
        <input
          type="text"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
        />

        <label>Nome do Produto</label>
        <input
          type="text"
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)}
        />

        <label>Código do Produto</label>
        <input
          type="text"
          value={codigoProduto}
          onChange={(e) => setCodigoProduto(e.target.value)}
        />

        <label>Valor "De" (à vista)</label>
        <input
          type="text"
          value={valorDe}
          onChange={(e) => setValorDe(e.target.value)}
        />

        <label>Valor "Por" (à vista)</label>
        <input
          type="text"
          value={valorPor}
          onChange={(e) => setValorPor(e.target.value)}
        />

        <label>Quantidade de Parcelas</label>
        <input
          type="text"
          value={qtdeParcelas}
          onChange={(e) => setQtdeParcelas(e.target.value)}
        />

        <label>Valor da Parcela</label>
        <input
          type="text"
          value={valorParcela}
          onChange={(e) => setValorParcela(e.target.value)}
        />

        <label>Validade/Observação</label>
        <textarea
          rows={3}
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
        />

        <Button onClick={() => window.print()} className="botao-imprimir" variant="success">
          Gerar PDF e Imprimir
        </Button>
      </div>

      {/* Pré-visualização do Cartaz */}
      <div className="preview-area">
        <div className="cartaz-a4" role="img" aria-label="Pré-visualização do cartaz A4">
          <div className="desconto-banner">{desconto}</div>
          <div className="produto-nome">{nomeProduto}</div>
          <div className="produto-codigo">{codigoProduto}</div>
          <div className="preco-de">de R$ {valorDe} à vista</div>
          <div className="preco-por">por R$ {valorPor} à vista</div>

          <div className="parcelamento-container">
            <div className="info-parcelas">
              <span className="qtde-parcelas">{qtdeParcelas}x</span>
              <span className="simbolo-rs">R$</span>
            </div>
            <div className="valor-parcela-grande">
              <span className="parcela-inteiro">{parteInteira}</span>
              <span className="parcela-decimal">,{parteDecimal}</span>
            </div>
            <div className="texto-crediario">no Crediário Lebes</div>
          </div>

          <div className="info-cartao">
            também em 10x de R$ 189,99 nos Cartões de Crédito!
          </div>
          <div className="validade-promocao">{validade}</div>
        </div>
      </div>
    </div>
  );
}
