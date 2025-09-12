import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast } from './ui.js';
import { enviarPedidoWhatsApp } from './api.js';

// --- ESTADO GLOBAL ---
let allProducts = [];
let productosPorCategoria = {};
let productoSeleccionado = null;
let swiper;

// [ELIMINADO] El array de orden manual ya no es necesario.
// const ordenCategorias = [ ... ];

// --- LÓGICA PRINCIPAL ---

async function apiFetch(endpoint) {
    const API_URL = 'https://comanda-central-backend.onrender.com';
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Error al cargar datos desde la API:", error);
        const swiperWrapper = document.querySelector('#product-sections-container .swiper-wrapper');
        swiperWrapper.innerHTML = `<div class="no-results-message">No se pudo cargar el menú. Por favor, intenta de nuevo más tarde.</div>`;
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    
    allProducts = await apiFetch('/api/productos?estado=activos');
    if (allProducts.length === 0) return;

    // [MODIFICADO] Lógica de agrupación simplificada.
    // El backend ya nos envía los productos ordenados por el 'orden' de la categoría,
    // por lo que simplemente los agrupamos. El orden se mantendrá.
    productosPorCategoria = allProducts.reduce((acc, product) => {
        if (product.categoria === 'Preparaciones') return acc;
        const category = product.categoria || 'Varios';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {});

    renderizarProductos(productosPorCategoria);
    renderizarCarrito(getCarrito());
    setupEventListeners();
    checkStoreStatus();

    swiper = new Swiper('.swiper', {
        spaceBetween: 20,
        autoHeight: true,
    });

    const showActiveSlideItems = () => {
        document.querySelectorAll('.swiper-slide .item').forEach(item => item.classList.remove('visible'));
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (!activeSlide) return;
        const items = activeSlide.querySelectorAll('.item');
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), index * 75);
        });
    };
    
    swiper.on('slideChange', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (!activeSlide) return;
        const activeCategory = activeSlide.id;
        document.querySelectorAll('.categories button').forEach(button => button.classList.remove('active'));
        const activeButton = document.querySelector(`.categories button[data-category="${activeCategory}"]`);
        if (activeButton) activeButton.classList.add('active');
        showActiveSlideItems();
    });

    swiper.update();
    showActiveSlideItems();
    
    // [MODIFICADO] Activamos la primera categoría que llega de la API, que ya viene ordenada.
    const categoriaPorDefecto = Object.keys(productosPorCategoria)[0];
    if (categoriaPorDefecto) {
         document.querySelector(`.categories button[data-category="${categoriaPorDefecto}"]`)?.classList.add('active');
    }
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

    document.getElementById('delivery-type-options').addEventListener('change', handleDeliveryTypeChange);
    document.getElementById('order-time-type-options').addEventListener('change', handleOrderTimeChange);
}

function handleCategoryClick(event) {
    if (event.target.tagName === 'BUTTON') {
        const category = event.target.dataset.category;
        const sections = Array.from(document.querySelectorAll('.category-section.swiper-slide'));
        const categoryIndex = sections.findIndex(s => s.id === category);
        
        if (categoryIndex !== -1) {
            swiper.slideTo(categoryIndex);
        }
    }
}

function handleProductClick(event) {
    const item = event.target.closest('.item');
    if (item) {
        const productoId = parseInt(item.dataset.id, 10);
        productoSeleccionado = allProducts.find(p => p.id === productoId);
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
        const selecciones = []; 
        const adicionalesSeleccionados = [];
        
        agregarAlCarrito(productoSeleccionado, cantidad, selecciones, adicionalesSeleccionados);
        cerrarModal(modal);
    }

    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {
        cerrarModal(modal);
    }
}

function handleCartItemInteraction(event) {
    const itemEl = event.target.closest('.cart-item');
    if (!itemEl) return;

    const itemUniqueId = itemEl.dataset.id; 
    const itemEnCarrito = getCarrito().find(item => item.uniqueId === itemUniqueId);
    if (!itemEnCarrito) return;
    
    let cantidadActual = itemEnCarrito.cantidad;

    if (event.target.classList.contains('cart-quantity-plus')) {
        actualizarCantidad(itemUniqueId, cantidadActual + 1);
    }
    if (event.target.classList.contains('cart-quantity-minus')) {
        actualizarCantidad(itemUniqueId, cantidadActual - 1);
    }
    if (event.target.classList.contains('cart-item-remove')) {
        eliminarDelCarrito(itemUniqueId);
    }
}

function handleDeliveryTypeChange(event) {
    const deliveryType = event.target.value;
    const deliveryInfoDiv = document.getElementById('delivery-info');
    const addressInput = document.getElementById('client-address');

    document.querySelectorAll('input[name="delivery-type"]').forEach(input => {
        const label = input.closest('label');
        label.classList.toggle('selected', input.value === deliveryType);
    });

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

function handleOrderTimeChange(event) {
    const scheduleContainer = document.getElementById('schedule-time-container');
    const timeSelect = document.getElementById('order-time-select');
    const timeType = event.target.value;

    document.querySelectorAll('input[name="order-time-type"]').forEach(input => {
        const label = input.closest('label');
        label.classList.toggle('selected', input.value === timeType);
    });
    
    if (timeType === 'schedule') {
        scheduleContainer.classList.remove('hidden');
        timeSelect.required = true;
    } else {
        scheduleContainer.classList.add('hidden');
        timeSelect.required = false;
        timeSelect.value = "";
    }

    const deliveryType = document.querySelector('input[name="delivery-type"]:checked')?.value || 'pickup';
    renderizarCarrito(getCarrito(), deliveryType);
}

function handleCheckout(event) {
    event.preventDefault();

    if (getCarrito().length === 0) {
        mostrarToast("Tu carrito está vacío. Agrega productos antes de finalizar.");
        cerrarModal(document.getElementById('checkout-modal'));
        return;
    }
    
    const deliveryTypeInput = document.querySelector('input[name="delivery-type"]:checked');
    if (!deliveryTypeInput) {
        mostrarToast("Por favor, selecciona si retiras o es envío a domicilio.");
        return;
    }
    const deliveryType = deliveryTypeInput.value;
    const direccion = document.getElementById('client-address').value;

    if (deliveryType === 'delivery' && !direccion.trim()) {
        mostrarToast("Por favor, ingresa tu dirección para el envío.");
        return;
    }
    
    const timeTypeInput = document.querySelector('input[name="order-time-type"]:checked');
     if (!timeTypeInput) {
        mostrarToast("Por favor, selecciona cuándo quieres tu pedido.");
        return;
    }
    const timeType = timeTypeInput.value;
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

    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        tipoEntrega: deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryType === 'delivery' ? direccion : 'N/A',
        horaPedido: horaPedido,
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };

    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType);
    
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito();
    mostrarToast("¡Pedido enviado! Gracias por tu compra.");
    
    const form = document.getElementById('checkout-form');
    form.reset();

    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');
    document.querySelectorAll('.delivery-options label.selected').forEach(l => l.classList.remove('selected'));
    
    renderizarCarrito(getCarrito()); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    
    const productosFiltrados = {};
    for (const categoria in productosPorCategoria) {
        productosFiltrados[categoria] = productosPorCategoria[categoria].filter(p => 
            p.nombre.toLowerCase().includes(termino) || (p.descripcion && p.descripcion.toLowerCase().includes(termino))
        );
    }
    
    renderizarProductos(productosPorCategoria);
    swiper.update();
    swiper.slideTo(0, 0);
    
    setTimeout(() => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide) {
            const items = activeSlide.querySelectorAll('.item');
            items.forEach((item, index) => {
                setTimeout(() => item.classList.add('visible'), index * 75);
            });
        }
    }, 100);
}

function checkStoreStatus() {
    const modal = document.getElementById('closed-store-modal');
    const openButton = document.getElementById('close-store-modal-btn');
    
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const openDays = [0, 4, 5, 6];
    const isOpenDay = openDays.includes(day);
    const isOpenHour = hour >= 19;
    const isStoreOpen = isOpenDay && isOpenHour;

    if (!isStoreOpen) {
        modal.classList.remove('hidden');
    }

    openButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}