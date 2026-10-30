export function validarProduto(formulario) {
  const erros = {};
  const nome = formulario.name.trim();
  const precoTexto = String(formulario.price ?? "").replace(",", ".").trim();
  const promoTexto = String(formulario.promoPrice ?? "").replace(",", ".").trim();
  const estoqueTexto = String(formulario.stock ?? "").trim();
  const imagem = formulario.image.trim();

  const preco = precoTexto === "" ? NaN : Number(precoTexto);
  const precoPromocional = promoTexto === "" ? null : Number(promoTexto);
  const estoque = estoqueTexto === "" ? NaN : Number(estoqueTexto);

  if (nome.length < 3) {
    erros.name = "O nome é obrigatório e deve ter pelo menos 3 caracteres.";
  }
  if (!Number.isFinite(preco) || preco <= 0) {
    erros.price = "O preço deve ser maior que zero.";
  }
  if (!Number.isFinite(estoque) || !Number.isInteger(estoque) || estoque < 0) {
    erros.stock = "O estoque deve ser um número inteiro maior ou igual a zero.";
  }

  try {
    if (!imagem) throw new Error();
    const url = new URL(imagem);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    erros.image = "Informe uma URL de imagem válida (http ou https).";
  }

  if (promoTexto !== "") {
    if (!Number.isFinite(precoPromocional) || precoPromocional <= 0) {
      erros.promoPrice = "O preço promocional deve ser maior que zero.";
    } else if (Number.isFinite(preco) && precoPromocional >= preco) {
      erros.promoPrice = "O preço promocional deve ser menor que o preço normal.";
    }
  }

  return {
    erros,
    valido: Object.keys(erros).length === 0,
  };
}

export function converterParaCentavos(valor) {
  return Math.round(Number(String(valor ?? "").replace(",", ".")) * 100);
}
