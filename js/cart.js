import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

// La variable global de costo de envío vivirá en main.js
// Esta función ahora solo guarda y renderiza
const guardarCarrito = () => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    
    // Para asegurar que el total se recalcule, necesitamos llamar a renderizarCarrito
    // desde un lugar que SÍ conozca el costo de envío. Lo haremos desde main.js
    // Por ahora, simplemente renderizamos el estado actual. El total se corregirá
    // en la siguiente interacción del usuario (ej: cambiar tipo de envío).
    renderizarCarrito(carrito); 
};

export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    
    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);
    const precioUnitarioFinal = producto.precio_final + precioAdicionales;

    const adicionalesString = adicionalesSeleccionados.map(a => `${a.id}:${a.cantidad}`).sort().join(',');
    const itemUniqueId = producto.id.toString() + JSON.stringify(selecciones.sort()) + adicionalesString;
    
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
            adicionales: adicionalesSeleccionados,
            selecciones: selecciones
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