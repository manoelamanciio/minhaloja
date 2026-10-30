
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Loja from './paginas/Loja';
import Carrinho from './paginas/Carrinho';
import Admin from './paginas/Admin';
import NovoProduto from './paginas/Admin/NovoProduto';
import EditarProduto from './paginas/Admin/EditarProduto';
import MenuNavegacao from "./componentes/ProdutoCard/MenuNavegacao";
import { useState } from "react";

function PaginaProvisoria({ titulo }) {
  return <h1>{titulo}</h1>;
}

function NaoEncontrado() {
  return (
    <main>
      <h1>404 - Página não encontrada</h1>
      <p>A página que você procura não existe.</p>
      <Link to="/">Voltar para a loja</Link>
    </main>
  );
}

export default function App() {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const quantidadeItensCarrinho = itensCarrinho.reduce(
    (total, item) => total + (Number(item.quantidade) || 0),
    0,
  );

  const adicionarAoCarrinho = (produto) => {
    const estoque = Number(produto.stock);
    if (!Number.isFinite(estoque) || estoque <= 0) return;

    setItensCarrinho((itens) => {
      const existente = itens.find((item) => item.id === produto.id);
      if (existente) {
        return itens.map((item) => {
          if (item.id !== produto.id) return item;
          const quantidadeAtual = Number(item.quantidade) || 0;
          return quantidadeAtual >= estoque
            ? item
            : { ...item, quantidade: quantidadeAtual + 1 };
        });
      }
      return [...itens, { ...produto, quantidade: 1 }];
    });
  };

  const incrementarQuantidade = (produtoId) => {
    setItensCarrinho((itens) =>
      itens.map((item) => {
        if (item.id !== produtoId) return item;
        const estoque = Number(item.stock);
        const quantidadeAtual = Number(item.quantidade) || 0;
        if (!Number.isFinite(estoque) || quantidadeAtual >= estoque) return item;
        return { ...item, quantidade: quantidadeAtual + 1 };
      }),
    );
  };

  const diminuirQuantidade = (produtoId) => {
    setItensCarrinho((itens) =>
      itens.map((item) => {
        if (item.id !== produtoId) return item;
        const quantidadeAtual = Number(item.quantidade) || 1;
        return { ...item, quantidade: Math.max(1, quantidadeAtual - 1) };
      }),
    );
  };

  const removerItem = (produtoId) => {
    setItensCarrinho((itens) => itens.filter((item) => item.id !== produtoId));
  };

  return (
    <BrowserRouter>
      <MenuNavegacao quantidadeItens={quantidadeItensCarrinho} />
      <header>
        <nav>
          <Link to="/">Loja</Link>{" | "}
          <Link to="/carrinho">Carrinho</Link>{" | "}
          <Link to="/admin">Admin</Link>{" | "}
          <Link to="/admin/novo">Novo produto</Link>
        </nav>
      </header>

      <Routes>
        {/* Página inicial: loja */}
        <Route
          path="/"
          element={
            <Loja
              onComprar={adicionarAoCarrinho}
              itensCarrinho={itensCarrinho}
            />
          }
        />

        {/* Detalhes do produto */}
        <Route
          path="/produtos/:id"
          element={<PaginaProvisoria titulo="Detalhes do produto" />}
        />

        {/* Carrinho */}
        <Route
          path="/carrinho"
          element={
            <Carrinho
              itens={itensCarrinho}
              onIncrementar={incrementarQuantidade}
              onDiminuir={diminuirQuantidade}
              onRemover={removerItem}
            />
          }
        />

        {/* Painel administrativo */}
        <Route path="/admin" element={<Admin />} />

        {/* Cadastro de produto */}
        <Route path="/admin/novo" element={<NovoProduto />} />

        {/* Edição de produto */}
        <Route path="/admin/:id/editar" element={<EditarProduto />} />

        {/* Qualquer rota não definida */}
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </BrowserRouter>
  );
}
