// assets/js/catalogo.js
import { getProductosWithCurrentStock } from "./data.js";
import { cartManager, addCartIconToSubpage } from "./cart.js";

const contenedor = document.querySelector("#catalogo");
const filtro = document.querySelector("#categorias");

// Agregar carrito a la página
addCartIconToSubpage();

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
      <a href="producto.html?id=${prod.id}">
        <button aria-label="Ver detalles producto" ${!stockDisponible ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          Ver detalles
        </button>
      </a>
    `;
    contenedor.appendChild(div);
  });
}

// Cargar productos con stock actualizado
function loadProductos() {
  const productosConStock = getProductosWithCurrentStock();
  renderizar(productosConStock);
}

// Cargar productos inicialmente
loadProductos();

// Manejar filtro por categorías con persistencia
filtro.addEventListener("change", () => {
  const cat = filtro.value;
  
  // Guardar filtro seleccionado
  cartManager.saveFiltersToStorage({ categoria: cat });
  
  const productosConStock = getProductosWithCurrentStock();
  const filtrados = cat ? productosConStock.filter(p => p.categoria === cat) : productosConStock;
  renderizar(filtrados);
});

// Cargar filtro desde localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedFilters = cartManager.getFiltersFromStorage();
  if (savedFilters.categoria) {
    filtro.value = savedFilters.categoria;
    // Disparar evento change para aplicar el filtro
    filtro.dispatchEvent(new Event('change'));
  }
});

// Escuchar cambios en el carrito para actualizar stock
window.addEventListener('cartUpdated', () => {
  loadProductos();
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
    loadProductos();
  }
});