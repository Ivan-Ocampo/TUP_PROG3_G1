// assets/js/detalle.js
import { getProductById } from "./data.js";
import { cartManager, addCartIconToSubpage } from "./cart.js";

const contenedor = document.querySelector("#detalleProducto");
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

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

function renderizar(prod) {
  if (!prod) {
    contenedor.innerHTML = `<p>Producto no encontrado.</p>`;
    return;
  }

  const stockDisponible = prod.stock > 0;
  
  contenedor.innerHTML = `
    <div class="card-detalle">
      <h2>${prod.nombre}</h2>
      <img src="${prod.img}" alt="${prod.alt}">
      <p>${prod.descripcion}</p>
      <p>Categoría: ${prod.categoria}</p>
      <p><strong>Precio: $${prod.precio.toLocaleString("es-AR")}</strong></p>
      <p>Stock disponible: <span id="stock-display">${stockDisponible ? prod.stock : 0}</span></p>
      <div class="cantidad-selector" ${!stockDisponible ? 'style="display: none;"' : ''}>
        <label for="cantidad">Cantidad:</label>
        <select id="cantidad" aria-label="Menú despleable para seleccionar la cantidad de productos">
          ${Array.from({length: Math.min(prod.stock, 10)}, (_, i) => 
            `<option value="${i + 1}">${i + 1}</option>`
          ).join('')}
        </select>
      </div>
      <button id="btnCarrito" aria-label="Botón para agregar producto al carrito" ${!stockDisponible ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        ${stockDisponible ? 'Agregar al carrito' : 'Sin stock'}
      </button>
      <div id="mensaje" style="margin-top: 10px; font-weight: bold;"></div>
    </div>
  `;

  const btn = document.querySelector("#btnCarrito");
  const cantidadSelect = document.querySelector("#cantidad");
  const mensaje = document.querySelector("#mensaje");

  if (btn && stockDisponible) {
    btn.addEventListener("click", () => {
      try {
        const cantidad = parseInt(cantidadSelect.value);
        cartManager.addToCart(prod, cantidad);
        
        // Mostrar notificación de éxito
        if (window.showCartNotification) {
          window.showCartNotification(`${cantidad} ${prod.nombre}(s) agregado(s) al carrito`, 'success');
        } else {
          // Fallback para mensaje local
          mensaje.style.color = "#27ae60";
          mensaje.textContent = `${cantidad} ${prod.nombre}(s) agregado(s) al carrito`;
        }
        
        // Actualizar vista después de un pequeño delay
        setTimeout(() => {
          const productoActualizado = getProductById(id);
          renderizar(productoActualizado);
          if (!window.showCartNotification) {
            mensaje.textContent = "";
          }
        }, 1500);
        
      } catch (error) {
        // Mostrar notificación de error
        if (window.showCartNotification) {
          window.showCartNotification(error.message, 'error');
        } else {
          // Fallback para mensaje local
          mensaje.style.color = "#e74c3c";
          mensaje.textContent = error.message;
        }
        
        if (!window.showCartNotification) {
          setTimeout(() => {
            mensaje.textContent = "";
          }, 3000);
        }
      }
    });
  }
}

// Cargar producto inicial
const producto = getProductById(id);
renderizar(producto);

// Escuchar cambios en el carrito para actualizar la vista
window.addEventListener('cartUpdated', () => {
  const productoActualizado = getProductById(id);
  renderizar(productoActualizado);
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
    const productoActualizado = getProductById(id);
    renderizar(productoActualizado);
  }
});