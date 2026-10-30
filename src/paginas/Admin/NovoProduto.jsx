import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./estilos.css";

const API_URL = "http://localhost:3000/products";

const estadoInicial = {
  name: "",
  category: "",
  description: "",
  price: "",
  promoPrice: "",
  stock: "",
  image: "",
};

function NovoProduto() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const atualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const salvarProduto = async (evento) => {
    evento.preventDefault();
    setErro("");

    const preco = Math.round(Number(formulario.price.replace(",", ".")) * 100);
    const precoPromocionalTexto = formulario.promoPrice.trim();
    const precoPromocional = precoPromocionalTexto
      ? Math.round(Number(precoPromocionalTexto.replace(",", ".")) * 100)
      : undefined;
    const estoque = Number.parseInt(formulario.stock, 10);

    if (!formulario.name.trim() || !Number.isFinite(preco) || preco < 0 ||
        !Number.isInteger(estoque) || estoque < 0) {
      setErro("Preencha nome, preço válido e estoque válido.");
      return;
    }

    if (precoPromocional !== undefined && (!Number.isFinite(precoPromocional) || precoPromocional < 0)) {
      setErro("Informe um preço promocional válido.");
      return;
    }

    const produto = {
      name: formulario.name.trim(),
      category: formulario.category.trim(),
      description: formulario.description.trim(),
      price: preco,
      stock: estoque,
      image: formulario.image.trim(),
    };

    if (precoPromocional !== undefined) {
      produto.promoPrice = precoPromocional;
    }

    setSalvando(true);
    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível cadastrar o produto.");
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="admin-produtos">
      <div className="admin-produtos__cabecalho">
        <h1>Novo produto</h1>
        <Link className="admin-produtos__novo" to="/admin">
          Voltar ao painel
        </Link>
      </div>

      <form className="produto-formulario" onSubmit={salvarProduto}>
        <label>
          Nome
          <input
            name="name"
            value={formulario.name}
            onChange={atualizarCampo}
            required
          />
        </label>

        <label>
          Categoria
          <input
            name="category"
            value={formulario.category}
            onChange={atualizarCampo}
          />
        </label>

        <label>
          Descrição
          <textarea
            name="description"
            value={formulario.description}
            onChange={atualizarCampo}
            rows="4"
          />
        </label>

        <div className="produto-formulario__linha">
          <label>
            Preço (R$)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formulario.price}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label>
            Preço promocional (R$)
            <input
              name="promoPrice"
              type="number"
              min="0"
              step="0.01"
              value={formulario.promoPrice}
              onChange={atualizarCampo}
            />
          </label>

          <label>
            Estoque
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formulario.stock}
              onChange={atualizarCampo}
              required
            />
          </label>
        </div>

        <label>
          URL da imagem
          <input
            name="image"
            type="url"
            value={formulario.image}
            onChange={atualizarCampo}
          />
        </label>

        {erro && <p className="mensagem erro">{erro}</p>}

        <button className="produto-formulario__salvar" type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar produto"}
        </button>
      </form>
    </main>
  );
}

export default NovoProduto;
