import { useEffect, useState } from "react";
import ProdutoCard from "../../componentes/ProdutoCard";
import "./estilos.css";

const API_URL = "/db.json";

function Loja({ onComprar, itensCarrinho = [] }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function buscarProdutos() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(API_URL, { signal: controller.signal });

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os produtos.");
        }

        const dados = await resposta.json();
        setProdutos(Array.isArray(dados.products) ? dados.products : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro("Não foi possível carregar os produtos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    buscarProdutos();

    return () => controller.abort();
  }, [tentativa]);

  if (carregando) {
    return <p className="mensagem">Carregando...</p>;
  }

  if (erro) {
    return (
      <main className="loja">
        <p className="mensagem erro">{erro}</p>
        <button
          className="mensagem__tentar-novamente"
          type="button"
          onClick={() => setTentativa((valorAtual) => valorAtual + 1)}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return (
    <main className="loja">
      <h1>Nossa Loja</h1>

      {produtos.length === 0 ? (
        <p className="mensagem">Nenhum produto encontrado.</p>
      ) : (
        <div className="grade-produtos">
          {produtos.map((produto) => {
            const itemNoCarrinho = itensCarrinho.find(
              (item) => item.id === produto.id,
            );
            return (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onComprar={onComprar}
                quantidadeNoCarrinho={itemNoCarrinho?.quantidade || 0}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Loja;