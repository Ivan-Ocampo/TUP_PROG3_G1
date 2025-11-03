import { cartManager, addCartIconToSubpage } from "./cart.js";

const contenedor = document.querySelector("#detalleProducto");
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

//Guarda todos los productos aquí
let originalProductos = []; 

// Agregar carrito a la página
addCartIconToSubpage();

//Actualizar contador
document.addEventListener('DOMContentLoaded', () => {
  const updateCounter = () => {
    if (cartManager) {
      cartManager.updateCartCounter();
    }
  };
  setTimeout(updateCounter, 50);
  setTimeout(updateCounter, 150);
  setTimeout(updateCounter, 300);
});
window.addEventListener('focus', () => {
  if (cartManager) {
    cartManager.updateCartCounter();
  }
});
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
 ${Array.from({ length: Math.min(prod.stock, 10) }, (_, i) =>
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

        // ... (lógica de notificación sin cambios)
        if (window.showCartNotification) {
          window.showCartNotification(`${cantidad} ${prod.nombre}(s) agregado(s) al carrito`, 'success');
        } else {
          mensaje.style.color = "#27ae60";
          mensaje.textContent = `${cantidad} ${prod.nombre}(s) agregado(s) al carrito`;
        }

        // Actualizar vista después de un pequeño delay
        setTimeout(() => {
          
          cargarDetalleProducto();
          if (!window.showCartNotification) {
            mensaje.textContent = "";
          }
        }, 1500);

      } catch (error) {
        // ... (lógica de notificación de error sin cambios)
        if (window.showCartNotification) {
          window.showCartNotification(error.message, 'error');
        } else {
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


function cargarDetalleProducto() {
  // Obtener la lista completa con stock actualizado
  const productosConStock = cartManager.updateProductsWithCurrentStock(originalProductos);

  //Encontrar el producto específico por ID
  const productoActualizado = productosConStock.find(p => p.id === id);

  //Renderizarlo
  renderizar(productoActualizado);
}

async function initializeApp() {
  try {
    //Cargar los datos del JSON
    const response = await fetch('../assets/data/data.json');
    if (!response.ok) {
      throw new Error(`Error al cargar data.json: ${response.statusText}`);
    }
    originalProductos = await response.json();

    
    cartManager.getOriginalStock = function (productId) {
      const producto = originalProductos.find(p => p.id === productId);
      return producto ? producto.stock : 0;
    };
    cartManager.initializeStock(originalProductos);

    //Cargar/renderizar el producto por primera vez
    cargarDetalleProducto();

  } catch (error) {
    console.error("No se pudo inicializar la página de detalle:", error);
    contenedor.innerHTML = "<p>Hubo un error al cargar el producto. Por favor, intente más tarde.</p>";
  }
}

// Escuchar cambios en el carrito para actualizar la vista
window.addEventListener('cartUpdated', () => {
  
  cargarDetalleProducto();
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
        cargarDetalleProducto();
  }
});

initializeApp();