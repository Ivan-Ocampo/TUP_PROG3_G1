// assets/js/index.js
import { getProductosWithCurrentStock } from "./data.js";
import { addCartIconToPage } from "./cart.js";

const contenedor = document.querySelector("#destacados");

// Agregar carrito a la página principal
addCartIconToPage();

// Asegurar que el contador se actualice cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
  // Múltiples intentos para asegurar actualización
  const updateCounter = () => {
    if (cartManager) {
      cartManager.updateCartCounter();
    }
  };
  
  setTimeout(updateCounter, 50);
  setTimeout(updateCounter, 150);
  setTimeout(updateCounter, 300);
});

// También actualizar cuando la ventana recupere el focus
window.addEventListener('focus', () => {
  if (cartManager) {
    cartManager.updateCartCounter();
  }
});

// Actualizar en visibilitychange
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && cartManager) {
    cartManager.updateCartCounter();
  }
});

function renderizar(lista) {
  contenedor.innerHTML = "";
  lista.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    
    // Determinar si hay stock disponible
    const stockDisponible = prod.stock > 0;
    const stockMessage = stockDisponible ? 
      `Stock: ${prod.stock}` : 
      '<span style="color: #e74c3c;">Sin stock</span>';
    
    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <img src="${prod.img}" alt="${prod.alt}">
      <p><strong>Precio: $${prod.precio.toLocaleString("es-AR")}</strong></p>
      <p>${prod.descripcion}</p>
      <p>Categoría: ${prod.categoria} • ${stockMessage}</p>
      <a href="./pages/producto.html?id=${prod.id}">
        <button aria-label="Botón para ver detalles del producto" ${!stockDisponible ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          Ver detalles
        </button>
      </a>
    `;
    contenedor.appendChild(div);
  });
}

// Cargar productos con stock actualizado
function loadDestacados() {
  const productosConStock = getProductosWithCurrentStock();
  const destacados = productosConStock.slice(0, 3);
  renderizar(destacados);
}

// Cargar productos inicialmente
loadDestacados();

// Escuchar cambios en el carrito para actualizar stock
window.addEventListener('cartUpdated', () => {
  loadDestacados();
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
    loadDestacados();
  }
});