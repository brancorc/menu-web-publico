import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

const guardarCarrito = (shippingCost = 0) => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value || 'pickup';
    renderizarCarrito(carrito, tipoEntregaActual, shippingCost);
};

export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);
    const precioUnitarioFinal = producto.precio_final + precioAdicionales;

    // [REFACTOR] Generación de ID más robusta y consistente
    const seleccionesString = selecciones.map(s => s.trim()).sort().join('|');
    const adicionalesString = adicionalesSeleccionados.map(a => `${a.id}:${a.cantidad}`).sort().join(',');
    const uniqueId = `${producto.id}-${seleccionesString}-${adicionalesString}`;
    
    const itemExistente = carrito.find(item => item.uniqueId === uniqueId);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        let nombreMostrado = producto.nombre;
        if (selecciones.length > 0 && selecciones.every(s => s)) {
            nombreMostrado += ` (${selecciones.join(', ')})`;
        }
        if (adicionalesSeleccionados.length > 0) {
            const nombresAdicionales = adicionalesSeleccionados.map(ad => `${ad.cantidad}x ${ad.nombre}`).join(', ');
            nombreMostrado += ` (con ${nombresAdicionales})`;
        }
        carrito.push({
            id: producto.id,
            uniqueId: uniqueId,
            nombre: nombreMostrado,
            cantidad,
            precio: precioUnitarioFinal,
            imagen_url: producto.imagen_url
        });
    }
    
    guardarCarrito();
    mostrarToast(`${cantidad}x ${producto.nombre} agregado(s)`);

    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.classList.add('cart-jiggle-animation');
    setTimeout(() => cartToggle.classList.remove('cart-jiggle-animation'), 500);
};

export const actualizarCantidad = (itemUniqueId, nuevaCantidad) => {
    const itemIndex = carrito.findIndex(item => item.uniqueId === itemUniqueId);
    if (itemIndex > -1) {
        if (nuevaCantidad > 0) {
            carrito[itemIndex].cantidad = nuevaCantidad;
        } else {
            carrito.splice(itemIndex, 1);
        }
    }
    guardarCarrito();
};

export const eliminarDelCarrito = (itemUniqueId) => {
    const item = carrito.find(p => p.uniqueId === itemUniqueId);
    if (item) {
        carrito = carrito.filter(i => i.uniqueId !== itemUniqueId);
        guardarCarrito();
        mostrarToast(`${item.nombre} eliminado del carrito`);
    }
};

export const limpiarCarrito = (shippingCost = 0) => {
    carrito = [];
    guardarCarrito(shippingCost);
};

export const getCarrito = () => carrito;