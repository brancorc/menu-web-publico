import { renderizarCarrito, mostrarToast } from './ui.js';

let carrito = JSON.parse(localStorage.getItem('monatCarrito')) || [];

// [MODIFICADO] La función ahora acepta el costo de envío para pasárselo a renderizarCarrito
const guardarCarrito = (shippingCost) => {
    localStorage.setItem('monatCarrito', JSON.stringify(carrito));
    const tipoEntregaActual = document.querySelector('input[name="delivery-type"]:checked')?.value;
    renderizarCarrito(carrito, tipoEntregaActual, shippingCost);
};

// [MODIFICADO] Se restaura la lógica completa para manejar opciones y adicionales
export const agregarAlCarrito = (producto, cantidad, selecciones = [], adicionalesSeleccionados = []) => {
    
    // Calculamos el precio total de los adicionales seleccionados
    const precioAdicionales = adicionalesSeleccionados.reduce((sum, ad) => sum + (ad.precio * ad.cantidad), 0);
    // El precio final del item es el precio del producto (que ya puede tener descuento) + el de los adicionales
    const precioUnitarioFinal = producto.precio_final + precioAdicionales;

    // Creamos un string único para los adicionales para diferenciar items en el carrito
    const adicionalesString = adicionalesSeleccionados.map(a => `${a.id}:${a.cantidad}`).sort().join(',');
    // El ID único ahora también incluye las selecciones del combo para ser verdaderamente único
    const itemUniqueId = producto.id.toString() + JSON.stringify(selecciones.sort()) + adicionalesString;
    
    const itemExistente = carrito.find(item => item.uniqueId === itemUniqueId);

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        let nombreMostrado = producto.nombre;
        
        // Construimos el string "(Coca-Cola, Sprite)" para los combos
        if (selecciones.length > 0 && selecciones.every(s => s)) {
            nombreMostrado += ` (${selecciones.join(', ')})`;
        }

        // Construimos el string "(con 2x Extra Muzza)" para los adicionales
        if (adicionalesSeleccionados.length > 0) {
            const nombresAdicionales = adicionalesSeleccionados.map(ad => `${ad.cantidad}x ${ad.nombre}`).join(', ');
            nombreMostrado += ` (con ${nombresAdicionales})`;
        }

        // Creamos un objeto para el carrito usando los campos de la API y los datos procesados
        carrito.push({
            id: producto.id,
            uniqueId: itemUniqueId,
            nombre: nombreMostrado, // Guardamos el nombre completamente construido
            cantidad,
            precio: precioUnitarioFinal, // Guardamos el precio final con adicionales
            imagen_url: producto.imagen_url, // Guardamos la URL de la imagen
            selecciones,
            adicionales: adicionalesSeleccionados
        });
    }
    
    guardarCarrito(); // No necesitamos pasar el costo de envío aquí, renderizarCarrito lo obtendrá
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