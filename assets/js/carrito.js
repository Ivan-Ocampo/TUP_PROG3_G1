// assets/js/carrito.js
import { cartManager, addCartIconToSubpage, initializeCartCounterUpdates } from "./cart.js";

const cartItemsContainer = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");
const emptyCartMessage = document.querySelector("#empty-cart");
const totalItemsSpan = document.querySelector("#total-items");
const totalPriceSpan = document.querySelector("#total-price");
const checkoutBtn = document.querySelector("#checkout-btn");
const clearCartBtn = document.querySelector("#clear-cart-btn");

// Agregar carrito a la página
addCartIconToSubpage();

// Inicializar actualizaciones del contador (función reutilizable)
initializeCartCounterUpdates();

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
      // Si queda solo 1, preguntar si quiere eliminar con modal
      showConfirmModal({
        title: 'Última unidad',
        message: `Esta es la última unidad de <strong>${item.nombre}</strong> en tu carrito. ¿Deseas eliminarlo completamente?`,
        icon: '⚠️',
        confirmText: 'Sí, eliminar',
        cancelText: 'No, mantener',
        onConfirm: () => {
          const removedItem = cartManager.removeFromCart(productId);
          if (removedItem) {
            showMessage(`${removedItem.nombre} eliminado del carrito`, "success");
            renderCartItems();
          }
        }
      });
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
      if (currentStock >= 1) {
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

    if (item) {
      showConfirmModal({
        title: '¿Eliminar producto?',
        message: `¿Estás seguro de que quieres eliminar <strong>${item.nombre}</strong> del carrito? (${item.quantity} unidades)`,
        icon: '🗑️',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          const removedItem = cartManager.removeFromCart(productId);
          if (removedItem) {
            showMessage(`${removedItem.nombre} eliminado completamente del carrito`, "success");
            renderCartItems();
          }
        }
      });
    }
  } catch (error) {
    showMessage("Error al eliminar el producto", "error");
  }
}

// Función para crear y mostrar modal de confirmación
function showConfirmModal(options) {
  const { title, message, icon, confirmText, cancelText, onConfirm, onCancel, confirmClass } = options;

  // Crear overlay del modal
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
      <div class="modal-header">
        <span class="modal-icon" aria-hidden="true">${icon || '⚠️'}</span>
        <h3 id="modal-title">${title || 'Confirmar acción'}</h3>
      </div>
      <div class="modal-body" id="modal-description">
        ${message || '¿Estás seguro de continuar?'}
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-cancel" id="modal-cancel-btn">
          ${cancelText || 'Cancelar'}
        </button>
        <button class="modal-btn modal-btn-confirm ${confirmClass || ''}" id="modal-confirm-btn">
          ${confirmText || 'Confirmar'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Mostrar modal con animación
  setTimeout(() => modalOverlay.classList.add('active'), 10);

  // Focus en el botón cancelar para accesibilidad
  const cancelBtn = modalOverlay.querySelector('#modal-cancel-btn');
  const confirmBtn = modalOverlay.querySelector('#modal-confirm-btn');
  
  setTimeout(() => cancelBtn.focus(), 100);

  // Función para cerrar modal
  const closeModal = () => {
    modalOverlay.classList.remove('active');
    setTimeout(() => modalOverlay.remove(), 300);
  };

  // Event listeners
  cancelBtn.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });

  // Navegación por teclado (Tab trap dentro del modal)
  const focusableElements = modalOverlay.querySelectorAll('button');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleKeyDown);
    }
    
    // Tab trap
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Cerrar al hacer click fuera del modal
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });
}

function clearCart() {
  showConfirmModal({
    title: '¿Vaciar carrito?',
    message: '¿Estás seguro de que quieres eliminar todos los productos del carrito? Esta acción no se puede deshacer.',
    icon: '🗑️',
    confirmText: 'Sí, vaciar',
    cancelText: 'No, mantener',
    confirmClass: '',
    onConfirm: () => {
      cartManager.clearCart();
      showMessage("Carrito vaciado exitosamente", "success");
      renderCartItems();
    }
  });
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
  const totalItems = cartManager.getTotalItems();

  showConfirmModal({
    title: 'Confirmar compra',
    message: `
      <p><strong>Total de productos:</strong> ${totalItems} unidades</p>
      <p><strong>Monto total:</strong> $${totalPrice.toLocaleString("es-AR")}</p>
      <p style="margin-top: 15px;">¿Deseas proceder con el pago?</p>
    `,
    icon: '💳',
    confirmText: 'Confirmar compra',
    cancelText: 'Seguir comprando',
    confirmClass: 'success',
    onConfirm: () => {
      // Simular proceso de checkout
      showMessage("¡Compra realizada con éxito! Gracias por tu compra.", "success");

      // Limpiar carrito después del checkout
      setTimeout(() => {
        cartManager.clearCart();
        renderCartItems();
      }, 2000);
    }
  });
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