import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast, aplicarIdentidadVisual } from './ui.js';
import { apiFetch } from './api.js';

// --- ESTADO GLOBAL ---
let allProducts = [], productosPorCategoria = {}, productoSeleccionado = null, shippingCost = 0, siteSettings;

// --- FUNCIONES ---

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
    element.querySelectorAll('button').forEach(child => {
        child.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
    element.style.cursor = 'grab';
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
        swiperWrapper.innerHTML = `<div class="no-results-message">Este negocio aún no tiene productos cargados.</div>`;
    } else {
        allProducts = menuData.productos;
        productosPorCategoria = menuData.categorias.reduce((acc, categoria) => {
            acc[categoria] = allProducts.filter(p => p.categoria === categoria);
            return acc;
        }, {});
        renderizarProductos(productosPorCategoria, menuData.categorias);
    }
    
    renderizarCarrito(getCarrito());
    setupEventListeners();
    checkStoreStatus();

    swiper = new Swiper('.swiper', { spaceBetween: 20, autoHeight: true });
    
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

    if (menuData && menuData.categorias.length > 0) {
        document.querySelector(`.categories button[data-category="${menuData.categorias[0]}"]`)?.classList.add('active');
        setTimeout(() => swiper.emit('slideChange'), 100);
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
    
    // [CORRECCIÓN 1] Se usa 'click' en lugar de 'change' para una respuesta visual inmediata.
    document.getElementById('delivery-type-options').addEventListener('click', handleOptionClick);
    document.getElementById('order-time-type-options').addEventListener('click', handleOptionClick);
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

function handleCartItemInteraction(event) {
    const itemEl = event.target.closest('.cart-item');
    if (!itemEl) return;
    const itemUniqueId = itemEl.dataset.id;
    if (!itemUniqueId) return;

    if (event.target.classList.contains('cart-quantity-plus')) {
        actualizarCantidad(itemUniqueId, 1);
    } else if (event.target.classList.contains('cart-quantity-minus')) {
        actualizarCantidad(itemUniqueId, -1);
    } else if (event.target.classList.contains('cart-item-remove')) {
        eliminarDelCarrito(itemUniqueId);
    }
}

// [CORRECCIÓN 2] Función unificada para manejar clics en las opciones.
function handleOptionClick(event) {
    const label = event.target.closest('label');
    if (!label) return;
    const input = label.querySelector('input[type="radio"]');
    if (!input) return;

    // Asegurarse de que el input está lógicamente seleccionado
    input.checked = true;

    // Actualizar estilos visuales
    const group = event.currentTarget;
    group.querySelectorAll('label').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');

    // Ejecutar lógicas específicas
    if (input.name === 'delivery-type') {
        const deliveryType = input.value;
        const deliveryInfoDiv = document.getElementById('delivery-info');
        document.getElementById('client-address').required = (deliveryType === 'delivery');
        deliveryInfoDiv.classList.toggle('hidden', deliveryType !== 'delivery');
        renderizarCarrito(getCarrito(), deliveryType, shippingCost);
    } else if (input.name === 'order-time-type') {
        const timeType = input.value;
        const scheduleContainer = document.getElementById('schedule-time-container');
        document.getElementById('order-time-select').required = (timeType === 'schedule');
        scheduleContainer.classList.toggle('hidden', timeType !== 'schedule');
    }
}

// [CORRECCIÓN 3] Validación manual y explícita.
function handleCheckout(event) {
    event.preventDefault();

    if (getCarrito().length === 0) return mostrarToast("Tu carrito está vacío.");
    
    const deliveryTypeInput = document.querySelector('input[name="delivery-type"]:checked');
    if (!deliveryTypeInput) return mostrarToast("Por favor, selecciona un tipo de entrega.");

    const timeTypeInput = document.querySelector('input[name="order-time-type"]:checked');
    if (!timeTypeInput) return mostrarToast("Por favor, selecciona cuándo quieres tu pedido.");

    const direccion = document.getElementById('client-address').value;
    if (deliveryTypeInput.value === 'delivery' && !direccion.trim()) {
        document.getElementById('client-address').focus();
        return mostrarToast("Por favor, ingresa tu dirección.");
    }
    
    const timeType = timeTypeInput.value;
    const timeSelect = document.getElementById('order-time-select');
    let horaPedido;
    if (timeType === 'schedule') {
        if (!timeSelect.value) {
            timeSelect.focus();
            return mostrarToast("Por favor, seleccioná una hora.");
        }
        horaPedido = timeSelect.value + ' hs';
    } else {
        horaPedido = 'Lo antes posible';
    }
    
    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        tipoEntrega: deliveryTypeInput.value === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryTypeInput.value === 'delivery' ? direccion : 'N/A',
        horaPedido: horaPedido,
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };
    
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryTypeInput.value, shippingCost);
    
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
    const categoriasOrdenadas = Object.keys(productosPorCategoria);
    categoriasOrdenadas.forEach(categoria => {
        productosFiltrados[categoria] = productosPorCategoria[categoria].filter(p => 
            p.nombre.toLowerCase().includes(termino) || (p.descripcion && p.descripcion.toLowerCase().includes(termino))
        );
    });
    renderizarProductos(productosFiltrados, categoriasOrdenadas);
    swiper.update();
    swiper.slideTo(0, 0);
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

const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega, costoEnvio) => {
    const numeroDestino = siteSettings ? siteSettings.telefono_whatsapp : null;
    if (!numeroDestino) {
        console.error("Número de WhatsApp de destino no configurado.");
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