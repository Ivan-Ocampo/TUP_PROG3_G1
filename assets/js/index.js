// assets/js/index.js

import { addCartIconToPage, cartManager } from "./cart.js";

const contenedor = document.querySelector("#destacados");

// Agregar carrito a la página principal
addCartIconToPage();

//Para guardar los productos
let originalProductos = [];

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
      <img src="${prod.imgIndex}" alt="${prod.alt}">
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
function cargarDestacados() {

  const productosConStock = cartManager.updateProductsWithCurrentStock(originalProductos);
  const destacados = productosConStock.slice(0, 3);
  renderizar(destacados);
}

//Función 'main' asíncrona para cargar datos
async function initializeApp() {
  try {
    //Cargar los datos del JSON
    const response = await fetch('./assets/data/data.json');
    if (!response.ok) {
      throw new Error(`Error al cargar productos.json: ${response.statusText}`);
    }
    originalProductos = await response.json();

  
    //Configurar cartManager para que sepa de dónde sacar el stock original
    cartManager.getOriginalStock = function (productId) {
      const producto = originalProductos.find(p => p.id === productId);
      return producto ? producto.stock : 0;
    };


    cartManager.initializeStock(originalProductos);


    cargarDestacados();

  } catch (error) {
    console.error("No se pudo inicializar la aplicación:", error);
    contenedor.innerHTML = "<p>Hubo un error al cargar los productos. Por favor, intente más tarde.</p>";
  }
}

// Escuchar cambios en el carrito para actualizar stock
window.addEventListener('cartUpdated', () => {
  cargarDestacados();
});

//Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
    cargarDestacados();
  }
});


initializeApp();