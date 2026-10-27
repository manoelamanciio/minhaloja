import "./estilos.css";
import { NUMERO_WHATSAPP_LOJISTA } from "../../config";

const formatarPreco = (preco) => (Number(preco) / 100).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function Carrinho({ itens = [], onIncrementar, onDiminuir, onRemover }) {
  const totalItens = itens.reduce(
    (soma, item) => soma + (Number(item.quantidade) || 0),
    0,
  );
  const totalCentavos = itens.reduce((soma, item) => {
    const precoCentavos = Number(item.price) || 0;
    const quantidade = Number(item.quantidade) || 0;
    return soma + precoCentavos * quantidade;
  }, 0);

  const finalizarPedido = () => {
    if (itens.length === 0) return;

    const linhasPedido = itens.map((item) => {
      const quantidade = Number(item.quantidade) || 0;
      const precoCentavos = Number(item.price) || 0;
      const subtotalCentavos = precoCentavos * quantidade;
      return `${item.name} — ${quantidade} x ${formatarPreco(precoCentavos)} — Subtotal: ${formatarPreco(subtotalCentavos)}`;
    });

    const mensagem = [
      "Olá! Gostaria de finalizar meu pedido:",
      "",
      ...linhasPedido,
      "",
      `Total de itens: ${totalItens}`,
      `Total: ${formatarPreco(totalCentavos)}`,
    ].join("\n");

    const url = `https://wa.me/${NUMERO_WHATSAPP_LOJISTA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="carrinho">
      <h1>Carrinho de compras</h1>

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="carrinho__lista">
            {itens.map((item) => {
              const estoque = Number(item.stock);
              const quantidade = Number(item.quantidade) || 0;
              const precoCentavos = Number(item.price) || 0;
              const subtotalCentavos = precoCentavos * quantidade;
              const atingiuEstoque = Number.isFinite(estoque) && quantidade >= estoque;

              return (
                <li className="carrinho__item" key={item.id}>
                  <span className="carrinho__nome">{item.name}</span>
                  <span className="carrinho__quantidade-preco">
                    {quantidade} x {formatarPreco(precoCentavos)}
                  </span>
                  <span className="carrinho__subtotal">
                    Subtotal: {formatarPreco(subtotalCentavos)}
                  </span>
                  <div className="carrinho__controles">
                    <button
                      className="carrinho__botao-quantidade"
                      type="button"
                      onClick={() => onDiminuir?.(item.id)}
                      disabled={quantidade <= 1}
                      aria-label={`Diminuir quantidade de ${item.name}`}
                    >
                      −
                    </button>
                    <button
                      className="carrinho__botao-quantidade"
                      type="button"
                      onClick={() => onIncrementar?.(item.id)}
                      disabled={atingiuEstoque}
                      aria-label={`Adicionar mais uma unidade de ${item.name}`}
                    >
                      +
                    </button>
                    <button
                      className="carrinho__botao-remover"
                      type="button"
                      onClick={() => onRemover?.(item.id)}
                      aria-label={`Remover ${item.name} do carrinho`}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="carrinho__resumo">
            <strong>Total de itens: {totalItens}</strong>
            <strong className="carrinho__total">
              Total: {formatarPreco(totalCentavos)}
            </strong>
          </div>
          <button
            className="carrinho__botao-whatsapp"
            type="button"
            onClick={finalizarPedido}
          >
            Finalizar pelo WhatsApp
          </button>
        </>
      )}
    </main>
  );
}

export default Carrinho;
