import { cartManager, addCartIconToSubpage } from "./cart.js";

const contenedor = document.querySelector("#catalogo");
const filtro = document.querySelector("#categorias");

//Variable para guardar productos
let originalProductos = [];

addCartIconToSubpage();

// --- (Toda la lógica de actualización del contador se mantiene igual) ---
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
// --- (Fin de la lógica del contador) ---


function renderizar(lista) {
  contenedor.innerHTML = "";
  lista.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");

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
function cargarProductos() {

  //Obtiene productos con stock actualizado
  const productosConStock = cartManager.updateProductsWithCurrentStock(originalProductos);

  //Obtiene el valor actual del filtro
  const cat = filtro.value;

  //Filtra los productos
  const filtrados = cat ? productosConStock.filter(p => p.categoria === cat) : productosConStock;

  //Renderiza la lista filtrada
  renderizar(filtrados);
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


    const savedFilters = cartManager.getFiltersFromStorage();
    if (savedFilters.categoria) {
      filtro.value = savedFilters.categoria;
    }

  
    cargarProductos();

  } catch (error) {
    console.error("No se pudo inicializar el catálogo:", error);
    contenedor.innerHTML = "<p>Hubo un error al cargar los productos. Por favor, intente más tarde.</p>";
  }
}

// Manejar filtro por categorías
filtro.addEventListener("change", () => {
  const cat = filtro.value;

  //Guardar filtro seleccionado
  cartManager.saveFiltersToStorage({ categoria: cat });


  cargarProductos();
});



//Escuchar cambios en el carrito para actualizar stock
window.addEventListener('cartUpdated', () => {
  cargarProductos(); 
});

// Escuchar cambios de localStorage para sincronización
window.addEventListener('storage', (event) => {
  if (event.key === 'luxury_stock') {
    cargarProductos();
  }
});


initializeApp();