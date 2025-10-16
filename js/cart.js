import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

/**
 * Guarda el carrito en localStorage y dispara la renderización en la UI.
 * La información de envío se obtiene del DOM dentro de renderizarCarrito.
 */
const guardarCarrito = () => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    renderizarCarrito(carrito); // renderizarCarrito ahora se encarga de leer el estado de envío y el costo.
};

export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    // [REFACTOR CRÍTICO] Se usa un timestamp como identificador único.
    // Esto es simple, garantizado de ser único para cada adición, y elimina todos los bugs de comparación de strings.
    const uniqueId = Date.now().toString();

    let nombreMostrado = producto.nombre;
    if (selecciones.length > 0 && selecciones.every(s => s)) {
        nombreMostrado += ` (${selecciones.join(', ')})`;
    }
    if (adicionalesSeleccionados.length > 0) {
        const nombresAdicionales = adicionalesSeleccionados.map(ad => `${ad.cantidad}x ${ad.nombre}`).join(', ');
        nombreMostrado += ` (con ${nombresAdicionales})`;
    }

    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);

    carrito.push({
        id: producto.id,
        uniqueId: uniqueId,
        nombre: nombreMostrado,
        cantidad,
        precio: producto.precio_final + precioAdicionales,
        imagen_url: producto.imagen_url,
    });
    
    guardarCarrito();
    mostrarToast(`${cantidad}x ${producto.nombre} agregado(s)`);

    // Animación del botón del carrito
    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.classList.add('cart-jiggle-animation');
    setTimeout(() => cartToggle.classList.remove('cart-jiggle-animation'), 500);
};

/**
 * Actualiza la cantidad de un ítem en el carrito.
 * @param {string} uniqueId - El identificador único del ítem.
 * @param {number} cambio - El cambio a aplicar a la cantidad (ej: 1 o -1).
 */
export const actualizarCantidad = (uniqueId, cambio) => {
    const item = carrito.find(p => p.uniqueId === uniqueId);
    if (item) {
        item.cantidad += cambio;
    }
    // Limpia cualquier ítem cuya cantidad haya llegado a 0 o menos.
    carrito = carrito.filter(p => p.cantidad > 0);
    guardarCarrito();
};

/**
 * Elimina un ítem del carrito por su uniqueId.
 * @param {string} uniqueId - El identificador único del ítem.
 */
export const eliminarDelCarrito = (uniqueId) => {
    const itemEliminado = carrito.find(p => p.uniqueId === uniqueId);
    if (itemEliminado) {
        carrito = carrito.filter(p => p.uniqueId !== uniqueId);
        guardarCarrito();
        mostrarToast(`${itemEliminado.nombre} eliminado del carrito`);
    }
};

export const limpiarCarrito = () => {
    carrito = [];
    guardarCarrito();
};

export const getCarrito = () => carrito;