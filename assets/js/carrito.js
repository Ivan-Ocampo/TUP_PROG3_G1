// assets/js/carrito.js
import { cartManager, addCartIconToSubpage } from "./cart.js";

const cartItemsContainer = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const emptyCartMessage = document.querySelector("#empty-cart");
const totalItemsSpan = document.querySelector("#total-items");
const totalPriceSpan = document.querySelector("#total-price");
const checkoutBtn = document.querySelector("#checkout-btn");
const clearCartBtn = document.querySelector("#clear-cart-btn");

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

function renderCartItems() {
  const cart = cartManager.getCart();
  
  if (cart.length === 0) {
    // Mostrar mensaje de carrito vacío
    cartItemsContainer.innerHTML = "";
    cartSummary.style.display = "none";
    emptyCartMessage.style.display = "block";
    return;
  }

  // Ocultar mensaje vacío y mostrar carrito
  emptyCartMessage.style.display = "none";
  cartSummary.style.display = "block";

  // Renderizar items del carrito
  cartItemsContainer.innerHTML = "";
  
  cart.forEach(item => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.img}" alt="${item.nombre}" class="cart-item-image">
        <div class="cart-item-details">
          <h4>${item.nombre}</h4>
          <p class="cart-item-price">$${item.precio.toLocaleString("es-AR")} c/u</p>
          <div class="cart-item-quantity">
            <span>Cantidad: </span>
            <div class="quantity-controls">
              <button aria-label="Botón para disminuir la cantidad de productos" class="btn-quantity btn-decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                −
              </button>
              <span class="quantity-display">${item.quantity}</span>
              <button aria-label="Botón para aumentar la cantidad de productos" class="btn-quantity btn-increase" data-id="${item.id}">
                +
              </button>
            </div>
          </div>
          <p class="cart-item-subtotal">Subtotal: $${(item.precio * item.quantity).toLocaleString("es-AR")}</p>
        </div>
      </div>
      <div class="cart-item-actions">
        <button aria-label="Botón para eliminar todos los productos" class="btn-remove-all" data-id="${item.id}">
          🗑️ Eliminar Todo
        </button>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  // Actualizar resumen
  updateCartSummary();

  // Agregar event listeners para controles de cantidad
  document.querySelectorAll(".btn-decrease").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.id);
      decreaseQuantity(productId);
    });
  });

  document.querySelectorAll(".btn-increase").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.id);
      increaseQuantity(productId);
    });
  });

  // Agregar event listeners para eliminar items completos
  document.querySelectorAll(".btn-remove-all").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.id);
      removeAllItemFromCart(productId);
    });
  });
}

function updateCartSummary() {
  const totalItems = cartManager.getTotalItems();
  const totalPrice = cartManager.getTotalPrice();
  
  totalItemsSpan.textContent = totalItems;
  totalPriceSpan.textContent = totalPrice.toLocaleString("es-AR");
}

function decreaseQuantity(productId) {
  try {
    const cart = cartManager.getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item && item.quantity > 1) {
      // Disminuir en 1
      cartManager.decreaseQuantity(productId, 1);
      showMessage(`${item.nombre} - cantidad reducida`, "success");
      renderCartItems();
    } else if (item && item.quantity === 1) {
      // Si queda solo 1, preguntar si quiere eliminar
      if (confirm(`¿Eliminar ${item.nombre} del carrito completamente?`)) {
        removeAllItemFromCart(productId);
      }
    }
  } catch (error) {
    showMessage("Error al reducir cantidad", "error");
  }
}

function increaseQuantity(productId) {
  try {
    const cart = cartManager.getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      // Verificar stock disponible
      const currentStock = cartManager.getCurrentStock(productId);
      if (currentStock > 0) {
        cartManager.increaseQuantity(productId, 1);
        showMessage(`${item.nombre} - cantidad aumentada`, "success");
        renderCartItems();
      } else {
        showMessage("No hay más stock disponible", "error");
      }
    }
  } catch (error) {
    showMessage("Error al aumentar cantidad", "error");
  }
}

function removeAllItemFromCart(productId) {
  try {
    const cart = cartManager.getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item && confirm(`¿Eliminar todos los ${item.nombre} del carrito?`)) {
      const removedItem = cartManager.removeFromCart(productId);
      if (removedItem) {
        showMessage(`${removedItem.nombre} eliminado completamente del carrito`, "success");
        renderCartItems();
      }
    }
  } catch (error) {
    showMessage("Error al eliminar el producto", "error");
  }
}

function clearCart() {
  if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
    cartManager.clearCart();
    showMessage("Carrito vaciado", "success");
    renderCartItems();
  }
}

function showMessage(message, type) {
  // Usar la función global de notificaciones
  if (window.showCartNotification) {
    window.showCartNotification(message, type);
  } else {
    // Fallback simple si la función global no está disponible
    alert(message);
  }
}

function simulateCheckout() {
  const cart = cartManager.getCart();
  if (cart.length === 0) {
    showMessage("No hay productos en el carrito", "error");
    return;
  }

  const totalPrice = cartManager.getTotalPrice();
  const confirmMessage = `¿Confirmar compra por $${totalPrice.toLocaleString("es-AR")}?`;
  
  if (confirm(confirmMessage)) {
    // Simular proceso de checkout
    showMessage("¡Compra realizada con éxito! Gracias por tu compra.", "success");
    
    // Limpiar carrito después del checkout
    setTimeout(() => {
      cartManager.clearCart();
      renderCartItems();
    }, 2000);
  }
}

// Event listeners
clearCartBtn.addEventListener("click", clearCart);
checkoutBtn.addEventListener("click", simulateCheckout);

// Escuchar cambios en el carrito
window.addEventListener('cartUpdated', () => {
  renderCartItems();
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_cart') {
    renderCartItems();
  }
});

// Renderizar carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderCartItems();
});