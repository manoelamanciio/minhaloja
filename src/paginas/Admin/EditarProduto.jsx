import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./estilos.css";

const API_URL = "http://localhost:3000/products";

function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function buscarProduto() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await fetch(`${API_URL}/${id}`, {
          signal: controller.signal,
        });
        if (!resposta.ok) throw new Error("Não foi possível carregar o produto.");

        const produto = await resposta.json();
        setFormulario({
          name: produto.name || "",
          category: produto.category || "",
          description: produto.description || "",
          price: ((Number(produto.price) || 0) / 100).toFixed(2),
          promoPrice: Number.isFinite(produto.promoPrice)
            ? (produto.promoPrice / 100).toFixed(2)
            : "",
          stock: String(Number(produto.stock) || 0),
          image: produto.image || "",
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    buscarProduto();
    return () => controller.abort();
  }, [id, tentativa]);

  const atualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const salvarProduto = async (evento) => {
    evento.preventDefault();
    setErro("");

    const preco = Math.round(Number(formulario.price.replace(",", ".")) * 100);
    const estoque = Number.parseInt(formulario.stock, 10);
    const promoTexto = formulario.promoPrice.trim();
    const precoPromocional = promoTexto
      ? Math.round(Number(promoTexto.replace(",", ".")) * 100)
      : null;

    if (!formulario.name.trim() || !Number.isFinite(preco) || preco < 0 ||
        !Number.isInteger(estoque) || estoque < 0) {
      setErro("Preencha nome, preço válido e estoque válido.");
      return;
    }
    if (precoPromocional !== null && (!Number.isFinite(precoPromocional) || precoPromocional < 0)) {
      setErro("Informe um preço promocional válido.");
      return;
    }

    const alteracoes = {
      name: formulario.name.trim(),
      category: formulario.category.trim(),
      description: formulario.description.trim(),
      price: preco,
      promoPrice: precoPromocional,
      stock: estoque,
      image: formulario.image.trim(),
    };

    setSalvando(true);
    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alteracoes),
      });
      if (!resposta.ok) throw new Error("Não foi possível salvar as alterações.");
      navigate("/", { replace: true });
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="admin-produtos">
      <div className="admin-produtos__cabecalho">
        <h1>Editar produto</h1>
        <Link className="admin-produtos__novo" to="/admin">Voltar ao painel</Link>
      </div>

      {carregando && <p className="mensagem">Carregando...</p>}

      {!carregando && erro && !formulario && (
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

      {!carregando && formulario && (
        <form className="produto-formulario" onSubmit={salvarProduto}>
          <label>
            Nome
            <input name="name" value={formulario.name} onChange={atualizarCampo} required />
          </label>
          <label>
            Categoria
            <input name="category" value={formulario.category} onChange={atualizarCampo} />
          </label>
          <label>
            Descrição
            <textarea name="description" value={formulario.description} onChange={atualizarCampo} rows="4" />
          </label>
          <div className="produto-formulario__linha">
            <label>
              Preço (R$)
              <input name="price" type="number" min="0" step="0.01" value={formulario.price} onChange={atualizarCampo} required />
            </label>
            <label>
              Preço promocional (R$)
              <input name="promoPrice" type="number" min="0" step="0.01" value={formulario.promoPrice} onChange={atualizarCampo} />
            </label>
            <label>
              Estoque
              <input name="stock" type="number" min="0" step="1" value={formulario.stock} onChange={atualizarCampo} required />
            </label>
          </div>
          <label>
            URL da imagem
            <input name="image" type="url" value={formulario.image} onChange={atualizarCampo} />
          </label>

          {erro && <p className="mensagem erro">{erro}</p>}
          <button className="produto-formulario__salvar" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
    </main>
  );
}

export default EditarProduto;
