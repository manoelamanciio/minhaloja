import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./estilos.css";
import { converterParaCentavos, validarProduto } from "./validacao";

const API_URL = "http://localhost:3000/products";

function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [errosCampos, setErrosCampos] = useState({});
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
    setErrosCampos((atuais) => ({ ...atuais, [name]: undefined }));
  };

  const salvarProduto = async (evento) => {
    evento.preventDefault();
    setErro("");

    const { erros, valido } = validarProduto(formulario);
    setErrosCampos(erros);
    if (!valido) return;

    const preco = converterParaCentavos(formulario.price);
    const estoque = Number(formulario.stock);
    const promoTexto = formulario.promoPrice.trim();
    const precoPromocional = promoTexto
      ? converterParaCentavos(promoTexto)
      : null;

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
        <form className="produto-formulario" onSubmit={salvarProduto} noValidate>
          <label>
            Nome
            <input name="name" value={formulario.name} onChange={atualizarCampo} aria-invalid={Boolean(errosCampos.name)} aria-describedby="erro-nome" />
            {errosCampos.name && <span id="erro-nome" className="produto-formulario__erro-campo">{errosCampos.name}</span>}
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
              <input name="price" type="number" step="0.01" value={formulario.price} onChange={atualizarCampo} aria-invalid={Boolean(errosCampos.price)} aria-describedby="erro-preco" />
              {errosCampos.price && <span id="erro-preco" className="produto-formulario__erro-campo">{errosCampos.price}</span>}
            </label>
            <label>
              Preço promocional (R$)
              <input name="promoPrice" type="number" step="0.01" value={formulario.promoPrice} onChange={atualizarCampo} aria-invalid={Boolean(errosCampos.promoPrice)} aria-describedby="erro-promocao" />
              {errosCampos.promoPrice && <span id="erro-promocao" className="produto-formulario__erro-campo">{errosCampos.promoPrice}</span>}
            </label>
            <label>
              Estoque
              <input name="stock" type="number" step="1" value={formulario.stock} onChange={atualizarCampo} aria-invalid={Boolean(errosCampos.stock)} aria-describedby="erro-estoque" />
              {errosCampos.stock && <span id="erro-estoque" className="produto-formulario__erro-campo">{errosCampos.stock}</span>}
            </label>
          </div>
          <label>
            URL da imagem
            <input name="image" type="url" value={formulario.image} onChange={atualizarCampo} aria-invalid={Boolean(errosCampos.image)} aria-describedby="erro-imagem" />
            {errosCampos.image && <span id="erro-imagem" className="produto-formulario__erro-campo">{errosCampos.image}</span>}
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
