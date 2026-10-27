
import { Link } from "react-router-dom";
import "./estilo.css";

function MenuNavegacao() {
  return (
    <header className="menu-navegacao">
      {/* Logo */}
      <Link to="/" className="menu-logo">
        MinhaLoja
      </Link>

      {/* Links de navegação */}
      <nav className="menu-links">
        <Link to="/">Loja</Link>
        <Link to="/admin/novo">Painel</Link>
      </nav>

      {/* Carrinho de compras */}
      <Link
        to="/carrinho"
        className="menu-carrinho"
        aria-label="Carrinho de compras"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="27"
          height="27"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

      </Link>
    </header>
  );
}

export default MenuNavegacao;
