import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

const guardarCarrito = () => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    // Delega el renderizado completo al event loop para asegurar que el DOM esté listo.
    setTimeout(() => {
        const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value || 'pickup';
        const costoEnvio = parseFloat(document.getElementById('dynamic-shipping-cost')?.textContent.replace('$', '').replace('.', '').replace(',', '.') || 0);
        renderizarCarrito(carrito, tipoEntregaActual, costoEnvio);
    }, 0);
};

export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    // [REFACTORIZACIÓN CLAVE]
    // El uniqueId ahora es simplemente un timestamp. Esto asegura que cada "Agregar al carrito"
    // cree una línea nueva y única, eliminando todos los bugs relacionados con la identificación de ítems.
    const uniqueId = Date.now().toString();

    let nombreMostrado = producto.nombre;
    if (selecciones && selecciones.length > 0 && selecciones.every(s => s)) {
        nombreMostrado += ` (${selecciones.join(', ')})`;
    }
    if (adicionalesSeleccionados && adicionalesSeleccionados.length > 0) {
        const nombresAdicionales = adicionalesSeleccionados.map(ad => `${ad.cantidad}x ${ad.nombre}`).join(', ');
        nombreMostrado += ` (con ${nombresAdicionales})`;
    }

    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);
    const precioUnitarioFinal = producto.precio_final + precioAdicionales;

    carrito.push({
        id: producto.id,
        uniqueId: uniqueId,
        nombre: nombreMostrado,
        cantidad,
        precio: precioUnitarioFinal,
        imagen_url: producto.imagen_url
    });
    
    guardarCarrito();
    mostrarToast(`${cantidad}x ${producto.nombre} agregado(s)`);

    // Animación del botón del carrito
    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.classList.add('cart-jiggle-animation');
    setTimeout(() => {
        cartToggle.classList.remove('cart-jiggle-animation');
    }, 500);
};

/**
 * Modifica la cantidad de un ítem en el carrito.
 * @param {string} uniqueId - El identificador único del ítem.
 * @param {number} cambio - La cantidad a sumar (ej: 1 o -1).
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
 * Elimina un ítem del carrito usando su identificador único.
 * @param {string} uniqueId - El identificador único del ítem a eliminar.
 */
export const eliminarDelCarrito = (uniqueId) => {
    const producto = carrito.find(p => p.uniqueId === uniqueId);
    if (producto) {
        carrito = carrito.filter(p => p.uniqueId !== uniqueId);
        guardarCarrito();
        mostrarToast(`${producto.nombre} eliminado del carrito`);
    }
};

export const limpiarCarrito = () => {
    carrito = [];
    guardarCarrito();
};

export const getCarrito = () => carrito;