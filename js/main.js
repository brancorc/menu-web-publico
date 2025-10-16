import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast, aplicarIdentidadVisual } from './ui.js';
import { apiFetch } from './api.js';

// --- ESTADO GLOBAL ---
let allProducts = [], productosPorCategoria = {}, productoSeleccionado = null, shippingCost = 0, swiper, siteSettings;

// --- FUNCIONES AUXILIARES ---

function getBusinessSlug() {
    const hostname = window.location.hostname;
    if (hostname === 'monat.ar' || hostname === 'www.monat.ar') {
        return 'monat';
    }
    const pathParts = window.location.pathname.split('/').filter(part => part);
    if (pathParts.length > 0) {
        return pathParts[0];
    }
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'monat';
    }
    return null; 
}

function makeDraggable(element) {
    if (!element) return;
    let isDown = false, startX, scrollLeft, hasDragged = false;

    element.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        element.style.cursor = 'grabbing';
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
    });
    element.addEventListener('mouseleave', () => { isDown = false; element.style.cursor = 'grab'; });
    element.addEventListener('mouseup', () => { isDown = false; element.style.cursor = 'grab'; });
    element.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) hasDragged = true;
        element.scrollLeft = scrollLeft - walk;
    });

    element.addEventListener('click', (e) => {
        if (hasDragged && e.target.tagName === 'BUTTON') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    element.style.cursor = 'grab';
}

// --- INICIALIZACIÓN ---

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

    if (siteSettings.google_analytics_id) {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${siteSettings.google_analytics_id}`;
        document.head.appendChild(gtagScript);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', siteSettings.google_analytics_id);
    }

    if (!menuData || !menuData.productos) {
        const swiperWrapper = document.querySelector('#product-sections-container .swiper-wrapper');
        if(swiperWrapper) swiperWrapper.innerHTML = `<div class="no-results-message">Este negocio aún no tiene productos cargados.</div>`;
    } else {
        allProducts = menuData.productos;
        productosPorCategoria = menuData.categorias.reduce((acc, categoria) => {
            acc[categoria] = allProducts.filter(p => p.categoria === categoria);
            return acc;
        }, {});
        renderizarProductos(productosPorCategoria, menuData.categorias);
    }
    
    renderizarCarrito(getCarrito(), 'pickup', shippingCost);
    setupEventListeners();
    checkStoreStatus();

    swiper = new Swiper('.swiper', {
        spaceBetween: 20,
        autoHeight: true,
        on: {
            slideChange: function () {
                const activeSlide = this.slides[this.activeIndex];
                if (!activeSlide) return;
                const activeCategory = activeSlide.id;
                document.querySelectorAll('.categories button').forEach(button => button.classList.remove('active'));
                const activeButton = document.querySelector(`.categories button[data-category="${activeCategory}"]`);
                if (activeButton) activeButton.classList.add('active');
            }
        }
    });

    if (menuData && menuData.categorias.length > 0) {
        document.querySelector(`.categories button[data-category="${menuData.categorias[0]}"]`)?.classList.add('active');
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true') {
        window.addEventListener('message', (event) => {
            const previewSettings = event.data;
            const mergedSettings = { ...siteSettings, ...previewSettings };
            aplicarIdentidadVisual(mergedSettings);
        });
    }
});

// --- MANEJADORES DE EVENTOS ---

function setupEventListeners() {
    const categoriesContainer = document.querySelector('.categories');
    makeDraggable(categoriesContainer);
    categoriesContainer.addEventListener('click', handleCategoryClick);
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
    document.getElementById('delivery-type-options').addEventListener('change', handleDeliveryTypeChange);
    document.getElementById('order-time-type-options').addEventListener('change', handleOrderTimeChange);
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
    if (event.target.classList.contains('modal') || event.target.closest('.close')) {
        cerrarModal(modal);
        return;
    }

    const cantidadInput = modal.querySelector('#cantidad');
    let cantidad = parseInt(cantidadInput.value);
    if (event.target.id === 'quantity-plus') cantidadInput.value = ++cantidad;
    if (event.target.id === 'quantity-minus' && cantidad > 1) cantidadInput.value = --cantidad;

    if (event.target.id === 'add-to-cart-btn') {
        const selecciones = Array.from(modal.querySelectorAll('.modal-opcion-select')).map(select => select.value);
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
}

function handleCartItemInteraction(event) {
    const itemEl = event.target.closest('.cart-item');
    if (!itemEl) return;
    const itemUniqueId = itemEl.dataset.id;
    if (event.target.closest('.cart-quantity-plus')) {
        actualizarCantidad(itemUniqueId, 1, true);
    } else if (event.target.closest('.cart-quantity-minus')) {
        actualizarCantidad(itemUniqueId, -1, true);
    } else if (event.target.closest('.cart-item-remove')) {
        eliminarDelCarrito(itemUniqueId);
    }
}

function handleDeliveryTypeChange(event) {
    const deliveryType = event.target.value;
    document.querySelectorAll('#delivery-type-options label').forEach(label => {
        label.classList.toggle('selected', label.getAttribute('for') === event.target.id);
    });
    const deliveryInfoDiv = document.getElementById('delivery-info');
    document.getElementById('client-address').required = (deliveryType === 'delivery');
    deliveryInfoDiv.classList.toggle('hidden', deliveryType !== 'delivery');
    renderizarCarrito(getCarrito(), deliveryType, shippingCost);
}

function handleOrderTimeChange(event) {
    const timeType = event.target.value;
    document.querySelectorAll('#order-time-type-options label').forEach(label => {
        label.classList.toggle('selected', label.getAttribute('for') === event.target.id);
    });
    const scheduleContainer = document.getElementById('schedule-time-container');
    document.getElementById('order-time-select').required = (timeType === 'schedule');
    scheduleContainer.classList.toggle('hidden', timeType !== 'schedule');
}

function handleCheckout(event) {
    event.preventDefault();
    const form = event.target;

    if (getCarrito().length === 0) return mostrarToast("Tu carrito está vacío.");
    
    if (!form.checkValidity()) {
        const firstInvalidField = form.querySelector(':invalid');
        if (firstInvalidField) {
            const fieldName = firstInvalidField.name;
            if (fieldName === 'delivery-type') return mostrarToast("Por favor, selecciona un tipo de entrega.");
            if (fieldName === 'order-time-type') return mostrarToast("Por favor, selecciona cuándo quieres tu pedido.");
        }
        form.reportValidity();
        return;
    }

    const deliveryType = form.elements['delivery-type'].value;
    const timeType = form.elements['order-time-type'].value;
    let horaPedido;
    if (timeType === 'schedule') {
        horaPedido = form.elements['order-time-select'].value + ' hs';
    } else {
        horaPedido = 'Lo antes posible';
    }
    
    const datosCliente = {
        nombre: form.elements['client-name'].value,
        tipoEntrega: deliveryType === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryType === 'delivery' ? form.elements['client-address'].value : 'N/A',
        horaPedido: horaPedido,
        pago: form.elements['payment-method'].value,
        notas: form.elements['order-notes'].value
    };
    
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType, shippingCost);
    
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito(shippingCost);
    mostrarToast("¡Pedido enviado! Gracias por tu compra.");
    form.reset();
    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');
    document.querySelectorAll('.delivery-options label.selected').forEach(l => l.classList.remove('selected'));
    renderizarCarrito(getCarrito(), 'pickup', shippingCost); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    const productosFiltrados = {};
    const categoriasOrdenadas = Object.keys(productosPorCategoria);
    categoriasOrdenadas.forEach(categoria => {
        productosFiltrados[categoria] = productosPorCategoria[categoria].filter(p => 
            p.nombre.toLowerCase().includes(termino) || (p.descripcion && p.descripcion.toLowerCase().includes(termino))
        );
    });
    renderizarProductos(productosFiltrados, categoriasOrdenadas);
    if(swiper) swiper.update();
    if(swiper) swiper.slideTo(0, 0);
}

function checkStoreStatus() {
    const modal = document.getElementById('closed-store-modal');
    const openButton = document.getElementById('close-store-modal-btn');
    if (!modal || !openButton) return;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const openDays = [0, 4, 5, 6];
    const isOpenDay = openDays.includes(day);
    const isOpenHour = hour >= 19;
    if (!(isOpenDay && isOpenHour)) {
        modal.classList.remove('hidden');
    }
    openButton.addEventListener('click', () => modal.classList.add('hidden'));
}

const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega, costoEnvio) => {
    const numeroDestino = siteSettings ? siteSettings.telefono_whatsapp : null;
    if (!numeroDestino) {
        alert("No se pudo enviar el pedido. El negocio no ha configurado un número de WhatsApp.");
        return;
    }
    const detallePedido = carrito.map(item => `- ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})`).join('\n');
    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    let detalleEnvio = '';
    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += costoEnvio;
        detalleEnvio = `\n*Costo de Envío:* $${costoEnvio.toLocaleString('es-AR')}`;
    }
    const nombreNegocio = siteSettings ? siteSettings.web_nombre_negocio : 'el negocio';
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