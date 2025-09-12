import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

const guardarCarrito = () => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value;
    renderizarCarrito(carrito, tipoEntregaActual);
};

// [MODIFICADO] La función ahora usa la estructura de datos de la API de Comanda Central
export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    
    // Por ahora, los adicionales no se gestionan desde Comanda Central, así que esta lógica se simplifica.
    // El precio ya viene calculado desde el backend en `producto.precio_final`.
    const precioUnitario = producto.precio_final;

    // El ID único se simplifica, ya que no hay combos ni adicionales por el momento.
    const itemUniqueId = producto.id.toString();
    
    const itemExistente = carrito.find(item => item.uniqueId === itemUniqueId);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        // Creamos un objeto para el carrito usando los campos de la API
        carrito.push({
            id: producto.id,
            uniqueId: itemUniqueId,
            nombre: producto.nombre,
            cantidad,
            precio: precioUnitario,
            // Guardamos el precio original por si lo necesitamos mostrar en el futuro
            precioOriginal: producto.precio_original, 
            // La imagen es un placeholder por ahora
            imagen: "img/fotoportada.png"
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
            eliminarDelCarrito(itemUniqueId, false); 
        }
    }
    guardarCarrito();
};

export const eliminarDelCarrito = (itemUniqueId, mostrarNotificacion = true) => {
    const producto = carrito.find(p => p.uniqueId === itemUniqueId);
    if (producto) {
        carrito = carrito.filter(item => item.uniqueId !== itemUniqueId);
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