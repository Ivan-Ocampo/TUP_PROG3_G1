import { cartManager } from './cart.js';

export const productos = [
  {
    id: 101,
    nombre: "Cadena de oro",
    descripcion: "Cadena de eslabones en oro de 18k",
    categoria: "cadenas",
    precio: 20000,
    stock: 5,
    img: "../assets/img/cadena1.jpg"
  },
  {
    id: 102,
    nombre: "Anillo de oro",
    descripcion: "Anillo trenzado en oro de 18k",
    categoria: "anillos",
    precio: 10000,
    stock: 10,
    img: "../assets/img/anillo1.jpg"
  },
  {
    id: 103,
    nombre: "Pendientes criollitos",
    descripcion: "Pendientes en oro de 18k",
    categoria: "pendientes",
    precio: 45000,
    stock: 30,
    img: "../assets/img/pendientes1.jpg"
  },
  {
    id: 104,
    nombre: "Reloj de agujas",
    descripcion: "Reloj de acero con correas de cuero",
    categoria: "relojes",
    precio: 80000,
    stock: 7,
    img: "../assets/img/reloj1.jpg"
  },
  {
    id: 105,
    nombre: "Cadena fina",
    descripcion: "Cadena fina de oro 18k",
    categoria: "cadenas",
    precio: 15000,
    stock: 12,
    img: "../assets/img/cadena2.jpg"
  },
  {
    id: 106,
    nombre: "Anillo solitario",
    descripcion: "Anillo solitario en oro blanco",
    categoria: "anillos",
    precio: 60000,
    stock: 3,
    img: "../assets/img/anillo2.jpg"
  },
  {
    id: 107,
    nombre: "Reloj digital",
    descripcion: "Reloj digital de acero inoxidable",
    categoria: "relojes",
    precio: 90000,
    stock: 4,
    img: "../assets/img/reloj2.jpg"
  },
  {
    id: 108,
    nombre: "Pendientes largos",
    descripcion: "Pendientes largos en oro rosa",
    categoria: "pendientes",
    precio: 50000,
    stock: 8,
    img: "../assets/img/pendientes2.jpg"
  }
];

// Inicializar stock en localStorage
cartManager.initializeStock(productos);

// Función para obtener productos con stock actualizado
export function getProductosWithCurrentStock() {
  return cartManager.updateProductsWithCurrentStock(productos);
}

// Función para obtener un producto por ID con stock actualizado
export function getProductById(id) {
  const productosConStock = getProductosWithCurrentStock();
  return productosConStock.find(prod => prod.id === parseInt(id));
}

// Actualizar la función getOriginalStock en el cartManager
cartManager.getOriginalStock = function(productId) {
  const producto = productos.find(p => p.id === productId);
  return producto ? producto.stock : 0;
};

console.log("📌 Lista completa de productos:");
console.log(productos);

console.log("📌 Nombres de los productos:");
productos.forEach(prod => console.log(prod.nombre));

const valorTotal = productos.reduce((total, prod) => total + (prod.precio * prod.stock), 0);
console.log("📌 Valor total del stock:", valorTotal);

const soloCadenas = productos.filter(prod => prod.categoria === "cadenas");
console.log("📌 Productos de categoría 'cadenas':", soloCadenas);

const preciosUSD = productos.map(prod => ({
  ...prod,
  precioUSD: (prod.precio / 1000).toFixed(2)
}));
console.log("📌 Productos con precios en USD:", preciosUSD);

const masCaro = productos.reduce((prev, current) => (prev.precio > current.precio ? prev : current));
console.log("📌 Producto más caro:", masCaro);