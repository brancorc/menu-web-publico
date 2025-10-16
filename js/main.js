import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast, aplicarIdentidadVisual } from './ui.js';
import { apiFetch } from './api.js';

// --- ESTADO GLOBAL ---
let allProducts = [];
let productosPorCategoria = {};
let productoSeleccionado = null;
let shippingCost = 0;
let swiper;
let siteSettings;

// --- FUNCIONES DE INICIALIZACIÓN Y LÓGICA PRINCIPAL ---

function getBusinessSlug() {
    const hostname = window.location.hostname;
    if (hostname === 'monat.ar' || hostname === 'www.monat.ar') {
        return 'monat';
    }
    const pathParts = window.location.pathname.split('/').filter(part => part);
    if (pathParts.length > 0) {
        return pathParts[0];
    }
    // Fallback para desarrollo local
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'monat';
    }
    return null; 
}

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getBusinessSlug();
    if (!slug) {
        document.body.innerHTML = '<h1 style="color:white; text-align:center; padding-top: 50px;">Negocio no encontrado.</h1>';
        return;
    }

    const [menuData, settings] = await Promise.all([
        apiFetch(`/api/public/menu-data/${slug}`),
        apiFetch(`/api/public/settings/${slug}`)
    ]);
    
    siteSettings = settings;

    if (!siteSettings) {
         document.body.innerHTML = '<h1 style="color:white; text-align:center; padding-top: 50px;">Error al cargar la configuración del negocio.</h1>';
        return;
    }

    aplicarIdentidadVisual(siteSettings);
    shippingCost = parseFloat(siteSettings.costo_envio_predeterminado);

    // Actualiza dinámicamente el costo en el label de envío
    const shippingCostSpan = document.getElementById('dynamic-shipping-cost');
    if (shippingCostSpan) {
        shippingCostSpan.textContent = `$${shippingCost.toLocaleString('es-AR')}`;
    }

    if (!menuData || !menuData.productos) {
        const swiperWrapper = document.querySelector('#product-sections-container .swiper-wrapper');
        swiperWrapper.innerHTML = `<div class="no-results-message">Este negocio aún no tiene productos cargados.</div>`;
        return;
    }

    allProducts = menuData.productos;
    
    productosPorCategoria = menuData.categorias.reduce((acc, categoria) => {
        acc[categoria] = allProducts.filter(p => p.categoria === categoria);
        return acc;
    }, {});
    
    renderizarProductos(productosPorCategoria, menuData.categorias);
    renderizarCarrito(getCarrito(), 'pickup', shippingCost);
    setupEventListeners();
    checkStoreStatus();

    swiper = new Swiper('.swiper', {
        spaceBetween: 20,
        autoHeight: true,
    });
    
    swiper.on('slideChange', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (!activeSlide) return;
        const activeCategory = activeSlide.id;
        document.querySelectorAll('.categories button').forEach(button => button.classList.remove('active'));
        const activeButton = document.querySelector(`.categories button[data-category="${activeCategory}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        const items = activeSlide.querySelectorAll('.item');
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), index * 75);
        });
    });

    if (menuData.categorias.length > 0) {
        document.querySelector(`.categories button[data-category="${menuData.categorias[0]}"]`)?.classList.add('active');
        setTimeout(() => swiper.emit('slideChange'), 100);
    }

    // Lógica de Previsualización en Vivo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true') {
        window.addEventListener('message', (event) => {
            const previewSettings = event.data;
            aplicarIdentidadVisual(previewSettings);
        });
    }
});

function setupEventListeners() {
    document.querySelector('.categories').addEventListener('click', handleCategoryClick);
    document.getElementById('product-sections-container').addEventListener('click', handleProductClick);
    document.getElementById('product-modal').addEventListener('click', handleProductModalClick);
    document.getElementById('cart-toggle').addEventListener('click', toggleCartPanel);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCartPanel);
    document.getElementById('checkout-btn').addEventListener('click', () => abrirModal(document.getElementById('checkout-modal')));
    document.getElementById('cart-items').addEventListener('click', handleCartItemInteraction);
    document.getElementById('checkout-modal').querySelector('.close').addEventListener('click', () => cerrarModal(document.getElementById('checkout-modal')));
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    document.getElementById('search-form').addEventListener('submit', e => e.preventDefault());
    document.getElementById('search-input').addEventListener('input', handleSearch);

    document.getElementById('delivery-type-options').addEventListener('change', handleOptionChange);
    document.getElementById('order-time-type-options').addEventListener('change', handleOptionChange);
}

// --- MANEJADORES DE EVENTOS ---

function handleOptionChange(event) {
    const input = event.target;
    const groupName = input.name;
    const selectedValue = input.value;

    document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
        radio.closest('label').classList.toggle('selected', radio.value === selectedValue);
    });

    if (groupName === 'delivery-type') {
        const deliveryInfoDiv = document.getElementById('delivery-info');
        const addressInput = document.getElementById('client-address');
        const isDelivery = selectedValue === 'delivery';
        deliveryInfoDiv.classList.toggle('hidden', !isDelivery);
        addressInput.required = isDelivery;
        if (!isDelivery) addressInput.value = '';
        renderizarCarrito(getCarrito(), selectedValue, shippingCost);
    }

    if (groupName === 'order-time-type') {
        const scheduleContainer = document.getElementById('schedule-time-container');
        const timeSelect = document.getElementById('order-time-select');
        const isSchedule = selectedValue === 'schedule';
        scheduleContainer.classList.toggle('hidden', !isSchedule);
        timeSelect.required = isSchedule;
        if (!isSchedule) timeSelect.value = "";
    }
}

function handleCartItemInteraction(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    const itemEl = event.target.closest('.cart-item');
    if (!itemEl) return;

    const itemUniqueId = itemEl.dataset.id;
    if (!itemUniqueId) return;
    
    const itemEnCarrito = getCarrito().find(i => i.uniqueId === itemUniqueId);
    if (!itemEnCarrito) return;

    if (button.classList.contains('cart-quantity-plus')) {
        actualizarCantidad(itemUniqueId, itemEnCarrito.cantidad + 1);
    }
    if (button.classList.contains('cart-quantity-minus')) {
        actualizarCantidad(itemUniqueId, itemEnCarrito.cantidad - 1);
    }
    if (button.classList.contains('cart-item-remove')) {
        eliminarDelCarrito(itemUniqueId);
    }
}

function handleCategoryClick(event) {
    const button = event.target.closest('button');
    if (button) {
        const category = button.dataset.category;
        const sections = Array.from(document.querySelectorAll('.category-section.swiper-slide'));
        const categoryIndex = sections.findIndex(s => s.id === category);
        
        if (categoryIndex !== -1 && swiper) {
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
        const selectores = modal.querySelectorAll('.modal-opcion-select');
        const selecciones = Array.from(selectores).map(select => select.value);
        const adicionalesSeleccionados = [];
        modal.querySelectorAll('.adicional-item').forEach(item => {
            const cantidadAdicional = parseInt(item.querySelector('.adicional-cantidad').textContent);
            if (cantidadAdicional > 0) {
                const id = parseInt(item.dataset.id, 10);
                const adicionalData = productoSeleccionado.adicionales.find(ad => ad.id === id);
                if (adicionalData) {
                    adicionalesSeleccionados.push({ ...adicionalData, cantidad: cantidadAdicional });
                }
            }
        });
        agregarAlCarrito(productoSeleccionado, cantidad, selecciones, adicionalesSeleccionados);
        cerrarModal(modal);
    }

    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {
        cerrarModal(modal);
    }
}

function handleCheckout(event) {
    // [CORRECCIÓN] Prevenimos el envío del formulario desde el inicio.
    event.preventDefault();

    let isValid = true;
    let errorMessage = '';

    const deliveryTypeInput = document.querySelector('input[name="delivery-type"]:checked');
    const timeTypeInput = document.querySelector('input[name="order-time-type"]:checked');
    const direccion = document.getElementById('client-address').value;
    const timeSelect = document.getElementById('order-time-select');
    
    // Ejecutamos todas las validaciones en orden.
    if (getCarrito().length === 0) {
        isValid = false;
        errorMessage = "Tu carrito está vacío.";
        cerrarModal(document.getElementById('checkout-modal')); // Cerramos el modal si el carrito está vacío
    } else if (!deliveryTypeInput) {
        isValid = false;
        errorMessage = "Por favor, selecciona si retiras o es envío a domicilio.";
    } else if (deliveryTypeInput.value === 'delivery' && !direccion.trim()) {
        isValid = false;
        errorMessage = "Por favor, ingresa tu dirección para el envío.";
    } else if (!timeTypeInput) {
        isValid = false;
        errorMessage = "Por favor, selecciona cuándo quieres tu pedido.";
    } else if (timeTypeInput.value === 'schedule' && !timeSelect.value) {
        isValid = false;
        errorMessage = "Por favor, seleccioná una hora para programar tu pedido.";
        timeSelect.focus();
    }
    
    // Si alguna validación falló, mostramos el mensaje y detenemos la función.
    if (!isValid) {
        if (errorMessage) {
            mostrarToast(errorMessage);
        }
        return;
    }
    
    // Si todo es válido, procedemos a construir y enviar el pedido.
    const deliveryType = deliveryTypeInput.value;
    const timeType = timeTypeInput.value;
    const horaPedido = timeType === 'schedule' ? `${timeSelect.value} hs` : 'Lo antes posible';
    
    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        tipoEntrega: deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryType === 'delivery' ? direccion : 'N/A',
        horaPedido: horaPedido,
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };
    
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType, shippingCost, siteSettings.telefono_whatsapp);
    
    // Limpieza final
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito(shippingCost);
    mostrarToast("¡Pedido enviado! Gracias por tu compra.");
    const form = document.getElementById('checkout-form');
    form.reset();
    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');
    document.querySelectorAll('.delivery-options label.selected').forEach(l => l.classList.remove('selected'));
    renderizarCarrito(getCarrito(), 'pickup', shippingCost); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    const productosFiltrados = {};

    for (const categoria in productosPorCategoria) {
        productosFiltrados[categoria] = productosPorCategoria[categoria].filter(p => 
            p.nombre.toLowerCase().includes(termino) || (p.descripcion && p.descripcion.toLowerCase().includes(termino))
        );
    }

    renderizarProductos(productosFiltrados, Object.keys(productosPorCategoria));
    if (swiper) {
        swiper.update();
        swiper.slideTo(0, 0);
        setTimeout(() => swiper.emit('slideChange'), 100);
    }
}

function checkStoreStatus() {
    const modal = document.getElementById('closed-store-modal');
    const openButton = document.getElementById('close-store-modal-btn');
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const openDays = [0, 4, 5, 6]; // Domingo=0, Jueves=4, Viernes=5, Sábado=6
    const isOpenDay = openDays.includes(day);
    const isOpenHour = hour >= 19; // Abre a las 19:00 (7 PM)

    if (!isOpenDay || !isOpenHour) {
        modal.classList.remove('hidden');
    }
    openButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega, costoEnvio) => {
    const numeroDestino = siteSettings ? siteSettings.telefono_whatsapp : null;
    if (!numeroDestino) {
        console.error("Número de WhatsApp de destino no configurado.");
        alert("No se pudo enviar el pedido. El negocio no ha configurado un número de WhatsApp.");
        return;
    }

    const detallePedido = carrito.map(item => 
        `- ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})`
    ).join('\n');

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    let detalleEnvio = '';

    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += costoEnvio;
        detalleEnvio = `\n*Costo de Envío:* $${costoEnvio.toLocaleString('es-AR')}`;
    }

    const nombreNegocio = siteSettings ? siteSettings.web_nombre_negocio : 'tu negocio';
    const mensaje = `
*¡Nuevo Pedido para ${nombreNegocio}!* 🎉

*Datos del Cliente:*
- *Nombre:* ${datosCliente.nombre}
- *Tipo de Entrega:* ${datosCliente.tipoEntrega}
- *Dirección:* ${datosCliente.direccion}
- *Horario de Entrega:* ${datosCliente.horaPedido}
- *Método de Pago:* ${datosCliente.pago}

*Aclaraciones:*
${datosCliente.notas || 'Ninguna'}

-------------------------
*Detalle del Pedido:*
${detallePedido}
${detalleEnvio}

*TOTAL: $${total.toLocaleString('es-AR')}*
    `;

    const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje.trim())}`;
    window.open(url, '_blank');
};