import productos from './data.js';
import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, activarCategoria, abrirModal, cerrarModal, toggleCartPanel, mostrarToast } from './ui.js';
import { enviarPedidoWhatsApp } from './api.js';

let productoSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos(productos);
    activarCategoria('combos');
    renderizarCarrito(getCarrito());
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelector('.categories').addEventListener('click', handleCategoryClick);
    document.getElementById('product-sections-container').addEventListener('click', handleProductClick);
    
    const productModal = document.getElementById('product-modal');
    productModal.addEventListener('click', handleProductModalClick);
    
    document.getElementById('cart-toggle').addEventListener('click', toggleCartPanel);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCartPanel);
    document.getElementById('checkout-btn').addEventListener('click', () => abrirModal(document.getElementById('checkout-modal')));
    document.getElementById('cart-items').addEventListener('click', handleCartItemInteraction);
    
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.querySelector('.close').addEventListener('click', () => cerrarModal(checkoutModal));
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    
    document.getElementById('search-form').addEventListener('submit', e => e.preventDefault());
    document.getElementById('search-input').addEventListener('input', handleSearch);

    // NUEVO: Listener para las opciones de entrega.
    document.querySelector('.delivery-options').addEventListener('change', handleDeliveryTypeChange);
}

function handleCategoryClick(event) {
    if (event.target.tagName === 'BUTTON') {
        activarCategoria(event.target.dataset.category);
    }
}

function handleProductClick(event) {
    const item = event.target.closest('.item');
    if (item) {
        const productoId = item.dataset.id;
        const categoria = item.dataset.category;
        productoSeleccionado = productos[categoria].find(p => p.id === productoId);
        if (productoSeleccionado) {
            abrirModal(document.getElementById('product-modal'), productoSeleccionado);
        }
    }
}

function handleProductModalClick(event) {
    const modal = document.getElementById('product-modal');
    const cantidadInput = modal.querySelector('#cantidad');
    let cantidad = parseInt(cantidadInput.value);
    if (event.target.id === 'quantity-plus') cantidadInput.value = ++cantidad;
    if (event.target.id === 'quantity-minus' && cantidad > 1) cantidadInput.value = --cantidad;
    if (event.target.id === 'add-to-cart-btn') {
        agregarAlCarrito(productoSeleccionado, cantidad);
        cerrarModal(modal);
    }
    // Cerrar el modal si se hace clic fuera del contenido
    if (event.target.classList.contains('modal')) {
        cerrarModal(modal);
    } 
    if (event.target.classList.contains('close')) cerrarModal(modal);
}

function handleCartItemInteraction(event) {
    const itemEl = event.target.closest('.cart-item');
    if (!itemEl) return;
    const productoId = itemEl.dataset.id;
    const cantidadActual = parseInt(itemEl.querySelector('span').textContent);
    if (event.target.classList.contains('cart-quantity-plus')) actualizarCantidad(productoId, cantidadActual + 1);
    if (event.target.classList.contains('cart-quantity-minus')) actualizarCantidad(productoId, cantidadActual - 1);
    if (event.target.classList.contains('cart-item-remove')) eliminarDelCarrito(productoId);
}

// NUEVA FUNCIÓN para manejar el cambio de tipo de entrega.
function handleDeliveryTypeChange(event) {
    const deliveryType = event.target.value;
    const deliveryInfoDiv = document.getElementById('delivery-info');
    const addressInput = document.getElementById('client-address');

    if (deliveryType === 'delivery') {
        deliveryInfoDiv.classList.remove('hidden');
        addressInput.required = true;
    } else {
        deliveryInfoDiv.classList.add('hidden');
        addressInput.required = false;
    }
    renderizarCarrito(getCarrito(), deliveryType);
}

// FUNCIÓN ACTUALIZADA para el checkout.
function handleCheckout(event) {
    event.preventDefault();
    
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    const direccion = document.getElementById('client-address').value;

    if (deliveryType === 'delivery' && !direccion.trim()) {
        mostrarToast("Por favor, ingresa tu dirección para el envío.");
        return;
    }

    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        telefono: document.getElementById('client-phone').value,
        tipoEntrega: deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryType === 'delivery' ? direccion : 'N/A',
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };

    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType);
    
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito();
    mostrarToast("¡Pedido enviado! Gracias por tu compra.");
    document.getElementById('checkout-form').reset();
    handleDeliveryTypeChange({ target: { value: 'pickup' } }); // Resetea la UI a 'pickup'
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    if (termino === '') {
        renderizarProductos(productos);
        activarCategoria(document.querySelector('.categories button.active').dataset.category);
        return;
    }
    const productosFiltrados = {};
    for (const categoria in productos) {
        productosFiltrados[categoria] = productos[categoria].filter(p => 
            p.nombre.toLowerCase().includes(termino) || p.descripcion.toLowerCase().includes(termino)
        );
    }
    renderizarProductos(productosFiltrados);
    Object.keys(productosFiltrados).forEach(categoria => {
        const section = document.getElementById(categoria);
        if (section) section.classList.toggle('hidden', productosFiltrados[categoria].length === 0);
    });
    document.querySelectorAll('.categories button').forEach(b => b.classList.remove('active'));
}