import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

const guardarCarrito = () => {

    localStorage.setItem('monatCarrito', JSON.stringify(carrito));

    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value;
    
    renderizarCarrito(carrito, tipoEntregaActual);
};

// La función ahora acepta un cuarto parámetro opcional: adicionalesSeleccionados
export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    // Calculamos el precio total del producto con la suma de (precio adicional * cantidad adicional)
    const precioConAdicionales = producto.precio + adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);

    // Creamos un ID único que considera las cantidades de los adicionales
    const adicionalesString = adicionalesSeleccionados.map(a => `${a.id}:${a.cantidad}`).sort().join(',');
    const itemUniqueId = producto.id + JSON.stringify(selecciones) + adicionalesString;
    
    const itemExistente = carrito.find(item => item.uniqueId === itemUniqueId);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        let nombreMostrado = producto.nombre;
        
        if (selecciones.length > 0) {
            nombreMostrado += ` (${selecciones.join(', ')})`;
        }

        // Creamos el texto "(con 2x Extra Muzza, 1x Jamón)"
        if (adicionalesSeleccionados.length > 0) {
            const nombresAdicionales = adicionalesSeleccionados.map(ad => `${ad.cantidad}x ${ad.nombre}`).join(', ');
            nombreMostrado += ` (con ${nombresAdicionales})`;
        }

        carrito.push({
            ...producto,
            uniqueId: itemUniqueId,
            nombre: nombreMostrado,
            cantidad,
            precio: precioConAdicionales,
            adicionales: adicionalesSeleccionados
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
    const itemEnCarrito = carrito.find(item => item.uniqueId === itemUniqueId); // <-- Buscar por uniqueId
    if (itemEnCarrito) {
        if (nuevaCantidad > 0) {
            itemEnCarrito.cantidad = nuevaCantidad;
        } else {
            // Si la cantidad llega a 0, lo eliminamos
            eliminarDelCarrito(itemUniqueId, false); 
        }
    }
    guardarCarrito();
};

export const eliminarDelCarrito = (itemUniqueId, mostrarNotificacion = true) => {
    const producto = carrito.find(p => p.uniqueId === itemUniqueId); // <-- Buscar por uniqueId
    if (producto) {
        carrito = carrito.filter(item => item.uniqueId !== itemUniqueId); // <-- Filtrar por uniqueId
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