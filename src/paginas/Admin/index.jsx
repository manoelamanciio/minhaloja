import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./estilos.css";

const API_URL = "http://localhost:3000/products";

const formatarPreco = (preco) =>
  (Number(preco) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function Admin() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [removendoId, setRemovendoId] = useState(null);

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
        setProdutos(Array.isArray(dados) ? dados : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro("Não foi possível carregar os produtos.");
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    buscarProdutos();
    return () => controller.abort();
  }, [tentativa]);

  const removerProduto = async (produto) => {
    if (!window.confirm(`Remover "${produto.name}"?`)) return;

    setRemovendoId(produto.id);
    try {
      const resposta = await fetch(`${API_URL}/${produto.id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        throw new Error("Não foi possível remover o produto.");
      }
      setProdutos((atuais) => atuais.filter((item) => item.id !== produto.id));
    } catch {
      setErro("Não foi possível remover o produto.");
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <main className="admin-produtos">
      <div className="admin-produtos__cabecalho">
        <h1>Produtos</h1>
        <Link className="admin-produtos__novo" to="/admin/novo">
          Novo produto
        </Link>
      </div>

      {carregando && <p className="mensagem">Carregando...</p>}

      {!carregando && erro && (
        <div className="admin-produtos__erro">
          <p className="mensagem erro">{erro}</p>
          <button
            className="admin-produtos__tentar"
            type="button"
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && (
        <div className="admin-produtos__tabela-wrapper">
          <table className="admin-produtos__tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.name}</td>
                  <td>{formatarPreco(produto.price)}</td>
                  <td>{Number(produto.stock) || 0}</td>
                  <td>
                    <div className="admin-produtos__acoes">
                      <Link to={`/admin/${produto.id}/editar`}>Editar</Link>
                      <button
                        type="button"
                        onClick={() => removerProduto(produto)}
                        disabled={removendoId === produto.id}
                      >
                        {removendoId === produto.id ? "Removendo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {produtos.length === 0 && (
            <p className="mensagem">Nenhum produto encontrado.</p>
          )}
        </div>
      )}
    </main>
  );
}

export default Admin;
