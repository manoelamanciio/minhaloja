import "./ProdutoCard.css";

const ProdutoCard = ({ produto, onComprar, quantidadeNoCarrinho = 0 }) => {
  const temPromocao = Number.isFinite(produto.promoPrice);
  const precoEfetivo = temPromocao ? produto.promoPrice : produto.price;
  const estoque = Number(produto.stock);
  const quantidade = Number(quantidadeNoCarrinho) || 0;
  const esgotado = Number.isFinite(estoque) && estoque === 0;
  const atingiuEstoque = Number.isFinite(estoque) && quantidade >= estoque;
  const disponivel = Number.isFinite(estoque) && estoque > 0 && !atingiuEstoque;

  const formatarPreco = (preco) => (preco / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const precoOriginalFormatado = formatarPreco(produto.price);
  const precoEfetivoFormatado = formatarPreco(precoEfetivo);

  const comprar = () => {
    if (!disponivel || quantidade >= estoque) return;
    onComprar?.({ ...produto, price: precoEfetivo }, precoEfetivo);
  };

  return (
    <div className="produto-card">
      {esgotado && (
        <span className="produto-card__selo-esgotado">Esgotado</span>
      )}
      <img src={produto.image} alt={produto.name} />
      <div className="produto-info">
        <h2>{produto.name}</h2>
        <p>{produto.description}</p>

        <div className="precos">
          {temPromocao && (
            <span className="preco-original">{precoOriginalFormatado}</span>
          )}
          <span className={temPromocao ? "preco promocional" : "preco"}>
            {precoEfetivoFormatado}
          </span>
        </div>
        <button
          className="produto-card__botao"
          onClick={comprar}
          type="button"
          disabled={!disponivel}
        >
          {disponivel ? "Comprar" : "Indisponível"}
        </button>
      </div>
    </div>
  );
};

export default ProdutoCard;