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

// En main.js
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

    // --- ESTAS SON LAS ÚNICAS LÍNEAS QUE NECESITAS PARA LOS LISTENERS ---
    // Listener para las opciones de entrega (más específico y seguro)
    document.getElementById('delivery-type-options').addEventListener('change', handleDeliveryTypeChange);

    // Listener para las opciones de horario del pedido (más específico y seguro)
    document.getElementById('order-time-type-options').addEventListener('change', handleOrderTimeChange);
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
    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {
        cerrarModal(modal);
    }
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

// En main.js
function handleDeliveryTypeChange(event) {
    const deliveryType = event.target.value;
    const deliveryInfoDiv = document.getElementById('delivery-info');
    const addressInput = document.getElementById('client-address');

    // --- NUEVO: Manejo de la clase .selected para el estilo ---
    document.querySelectorAll('input[name="delivery-type"]').forEach(input => {
        const label = input.closest('label');
        if (input.value === deliveryType) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    // --- FIN DEL BLOQUE NUEVO ---

    if (deliveryType === 'delivery') {
        deliveryInfoDiv.classList.remove('hidden');
        addressInput.required = true;
    } else {
        deliveryInfoDiv.classList.add('hidden');
        addressInput.required = false;
        addressInput.value = '';
    }
    renderizarCarrito(getCarrito(), deliveryType);
}

// En main.js
function handleOrderTimeChange(event) {
    const scheduleContainer = document.getElementById('schedule-time-container');
    const timeSelect = document.getElementById('order-time-select');
    const timeType = event.target.value;

    // --- NUEVO: Manejo de la clase .selected para el estilo ---
    document.querySelectorAll('input[name="order-time-type"]').forEach(input => {
        const label = input.closest('label');
        if (input.value === timeType) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    // --- FIN DEL BLOQUE NUEVO ---
    
    if (timeType === 'schedule') {
        scheduleContainer.classList.remove('hidden');
        timeSelect.required = true;
    } else {
        scheduleContainer.classList.add('hidden');
        timeSelect.required = false;
        timeSelect.value = "";
    }

    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    renderizarCarrito(getCarrito(), deliveryType);
}

// --> MODIFICADO: Función de checkout actualizada para incluir todas las mejoras.
function handleCheckout(event) {
    event.preventDefault();

    // 1. Verificación de carrito vacío
    if (getCarrito().length === 0) {
        mostrarToast("Tu carrito está vacío. Agrega productos antes de finalizar.");
        cerrarModal(document.getElementById('checkout-modal'));
        return;
    }

    // 2. Verificación de número de teléfono
    const telefonoInput = document.getElementById('client-phone');
    const telefono = telefonoInput.value;
    const telefonoValido = /^\d{7,15}$/.test(telefono); // Acepta entre 7 y 15 dígitos

    if (!telefonoValido) {
        mostrarToast("Por favor, ingresa un número de teléfono válido (solo números).");
        telefonoInput.focus();
        return;
    }

    // 3. Verificación de dirección para envío a domicilio
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    const direccion = document.getElementById('client-address').value;

    if (deliveryType === 'delivery' && !direccion.trim()) {
        mostrarToast("Por favor, ingresa tu dirección para el envío.");
        return;
    }
    
    // 4. Verificación de hora programada
    const timeType = document.querySelector('input[name="order-time-type"]:checked').value;
    const timeSelect = document.getElementById('order-time-select');
    let horaPedido;

    if (timeType === 'schedule') {
        if (!timeSelect.value) {
            mostrarToast("Por favor, seleccioná una hora para programar tu pedido.");
            timeSelect.focus();
            return;
        }
        horaPedido = timeSelect.value + ' hs';
    } else {
        horaPedido = 'Lo antes posible';
    }

    // 5. Recopilación de todos los datos
    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        telefono: telefono,
        tipoEntrega: deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryType === 'delivery' ? direccion : 'N/A',
        horaPedido: horaPedido,
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };

    // 6. Envío del pedido
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType);
    
    // 7. Limpieza y reseteo post-envío (VERSIÓN CORREGIDA)
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito(); // Esto ya llama a renderizarCarrito con el carrito vacío
    mostrarToast("¡Pedido enviado! Gracias por tu compra.");
    
    const form = document.getElementById('checkout-form');
    form.reset(); // Resetea el form a los valores 'checked' del HTML

    // Sincroniza la UI post-reseteo
    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');

    // Vuelve a llamar a renderizarCarrito para que se actualice el total SIN costo de envío,
    // ya que el reset() puso 'pickup' como opción por defecto.
    renderizarCarrito(getCarrito()); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    if (termino === '') {
        renderizarProductos(productos);
        const activeCategory = document.querySelector('.categories button.active');
        if (activeCategory) {
            activarCategoria(activeCategory.dataset.category);
        }
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