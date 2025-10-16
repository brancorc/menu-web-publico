import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];
let shippingCost = 0; // Variable local para almacenar el costo de envío

// Función interna para guardar y renderizar el carrito
const guardarCarrito = () => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value || 'pickup';
    renderizarCarrito(carrito, tipoEntregaActual, shippingCost);
};

// Función para actualizar el costo de envío desde main.js
export const setShippingCost = (cost) => {
    shippingCost = cost;
};

export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);
    const precioUnitarioFinal = producto.precio_final + precioAdicionales;

    const adicionalesString = adicionalesSeleccionados.map(a => `${a.id}:${a.cantidad}`).sort().join(',');
    const itemUniqueId = `${producto.id}-${JSON.stringify(selecciones.sort())}-${adicionalesString}`;
    
    const itemExistente = carrito.find(item => item.uniqueId === itemUniqueId);

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
            uniqueId: itemUniqueId,
            nombre: nombreMostrado,
            cantidad,
            precio: precioUnitarioFinal,
            imagen_url: producto.imagen_url,
        });
    }
    
    guardarCarrito();
    mostrarToast(`${cantidad}x ${producto.nombre} agregado(s)`);

    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.classList.add('cart-jiggle-animation');
    setTimeout(() => {
        cartToggle.classList.remove('cart-jiggle-animation');
    }, 500);
};

export const actualizarCantidad = (itemUniqueId, nuevaCantidad) => {
    const itemEnCarrito = carrito.find(item => item.uniqueId === itemUniqueId);
    if (itemEnCarrito) {
        if (nuevaCantidad > 0) {
            itemEnCarrito.cantidad = nuevaCantidad;
        } else {
            // Si la cantidad es 0 o menos, lo eliminamos
            eliminarDelCarrito(itemUniqueId, false); 
            return; // Salimos de la función para evitar doble renderizado
        }
    }
    guardarCarrito();
};

export const eliminarDelCarrito = (itemUniqueId, mostrarNotificacion = true) => {
    const itemIndex = carrito.findIndex(item => item.uniqueId === itemUniqueId);
    if (itemIndex > -1) {
        const producto = carrito[itemIndex];
        carrito.splice(itemIndex, 1);
        guardarCarrito();
        if (mostrarNotificacion) {
            mostrarToast(`${producto.nombre} eliminado del carrito`);
        }
    }
};

export const limpiarCarrito = () => {
    carrito = [];
    guardarCarrito();
};

export const getCarrito = () => carrito;