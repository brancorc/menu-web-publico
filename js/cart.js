import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

const guardarCarrito = () => {

    localStorage.setItem('monatCarrito', JSON.stringify(carrito));

    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value;
    
    renderizarCarrito(carrito, tipoEntregaActual);
};

export const agregarAlCarrito = (producto, cantidad) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }
    guardarCarrito();
    mostrarToast(`${cantidad}x ${producto.nombre} agregado(s)`);

    // --- NUEVO: Disparamos la animación del botón ---
    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.classList.add('cart-jiggle-animation');
    // Removemos la clase después de que la animación termine para poder volver a usarla
    setTimeout(() => {
        cartToggle.classList.remove('cart-jiggle-animation');
    }, 500); // 500ms es la duración de la animación

};

export const actualizarCantidad = (productoId, nuevaCantidad) => {
    const itemEnCarrito = carrito.find(item => item.id === productoId);
    if (itemEnCarrito) {
        if (nuevaCantidad > 0) {
            itemEnCarrito.cantidad = nuevaCantidad;
        } else {
            eliminarDelCarrito(productoId, false);
        }
    }
    guardarCarrito();
};

export const eliminarDelCarrito = (productoId, mostrarNotificacion = true) => {
    const producto = carrito.find(p => p.id === productoId);
    if (producto) {
        carrito = carrito.filter(item => item.id !== productoId);
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