import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./estilos.css";

const API_URL = "http://localhost:3000/products";

function ProdutoDetalhe({ onComprar, itensCarrinho = [] }) {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function buscarProduto() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await fetch(`${API_URL}/${id}`, { signal: controller.signal });
        if (resposta.status === 404) {
          setErro("Produto não encontrado");
          setProduto(null);
          setCarregando(false);
          return;
        }
        if (!resposta.ok) throw new Error("Não foi possível carregar este produto.");
        setProduto(await resposta.json());
      } catch (error) {
        if (error.name !== "AbortError") setErro("Não foi possível carregar este produto.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    buscarProduto();
    return () => controller.abort();
  }, [id]);

  if (carregando) return <p className="mensagem">Carregando...</p>;
  if (erro || !produto) {
    return (
      <main className="produto-detalhe produto-detalhe--erro">
        <p className="mensagem erro">{erro || "Produto não encontrado."}</p>
        <Link className="produto-detalhe__voltar" to="/">Voltar para a loja</Link>
      </main>
    );
  }

  const preco = Number(produto.price) || 0;
  const precoPromocional = Number.isFinite(produto.promoPrice) ? produto.promoPrice : null;
  const precoEfetivo = precoPromocional ?? preco;
  const estoque = Number(produto.stock) || 0;
  const quantidade = itensCarrinho.find((item) => item.id === produto.id)?.quantidade || 0;
  const esgotado = estoque === 0;
  const atingiuEstoque = quantidade >= estoque;
  const formatarPreco = (valor) =>
    (valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <main className="produto-detalhe">
      <Link className="produto-detalhe__voltar" to="/">← Voltar para a loja</Link>
      <article className="produto-detalhe__conteudo">
        <div className="produto-detalhe__imagem">
          {esgotado && <span className="produto-card__selo-esgotado">Esgotado</span>}
          <img src={produto.image} alt={produto.name} />
        </div>
        <div className="produto-detalhe__info">
          <h1>{produto.name}</h1>
          {produto.category && <p className="produto-detalhe__categoria">{produto.category}</p>}
          <p>{produto.description}</p>
          <div className="precos">
            {precoPromocional !== null && <span className="preco-original">{formatarPreco(preco)}</span>}
            <span className={precoPromocional !== null ? "preco promocional" : "preco"}>{formatarPreco(precoEfetivo)}</span>
          </div>
          <p><strong>Estoque:</strong> {estoque}</p>
          <button
            className="produto-detalhe__comprar"
            type="button"
            onClick={() => onComprar?.({ ...produto, price: precoEfetivo }, precoEfetivo)}
            disabled={esgotado || atingiuEstoque}
          >
            {esgotado || atingiuEstoque ? "Indisponível" : "Comprar"}
          </button>
        </div>
      </article>
    </main>
  );
}

export default ProdutoDetalhe;
