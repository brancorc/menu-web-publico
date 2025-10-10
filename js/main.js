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

    const deliveryOptionLabel = document.querySelector('input[name="delivery-type"][value="delivery"]')?.parentElement;
    if (deliveryOptionLabel) {
        const originalText = deliveryOptionLabel.textContent.split('(')[0].trim();
        deliveryOptionLabel.innerHTML = `<input type="radio" name="delivery-type" value="delivery" required> ${originalText} ($${shippingCost.toLocaleString('es-AR')})`;
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
        
        // Animación de entrada para los items del slide activo
        const items = activeSlide.querySelectorAll('.item');
        items.forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), index * 75);
        });
    });

    if (menuData.categorias.length > 0) {
        document.querySelector(`.categories button[data-category="${menuData.categorias[0]}"]`)?.classList.add('active');
        // Disparamos la animación para el primer slide
        setTimeout(() => swiper.emit('slideChange'), 100);
    }
});

/**
 * Permite el desplazamiento horizontal de un elemento usando la rueda del mouse.
 * @param {HTMLElement} element - El elemento que se quiere hacer desplazable.
 */
function enableHorizontalScroll(element) {
    if (!element) return;

    element.addEventListener('wheel', (event) => {
        // Si no hay scroll horizontal posible, no hacemos nada.
        if (element.scrollWidth <= element.clientWidth) {
            return;
        }
        
        // Prevenimos el scroll vertical de la página
        event.preventDefault();

        // Aplicamos el delta del scroll de la rueda al scroll horizontal del elemento
        element.scrollLeft += event.deltaY;
    });
}


function setupEventListeners() {
    const categoriesContainer = document.querySelector('.categories');
    
    // Habilita el scroll horizontal con la rueda del mouse en el contenedor de categorías.
    enableHorizontalScroll(categoriesContainer);

    // Asigna los listeners de eventos.
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
    const itemEnCarrito = getCarrito().find(item => item.uniqueId === itemUniqueId);
    if (!itemEnCarrito) return;
    let cantidadActual = itemEnCarrito.cantidad;
    if (event.target.classList.contains('cart-quantity-plus')) actualizarCantidad(itemUniqueId, cantidadActual + 1);
    if (event.target.classList.contains('cart-quantity-minus')) actualizarCantidad(itemUniqueId, cantidadActual - 1);
    if (event.target.classList.contains('cart-item-remove')) eliminarDelCarrito(itemUniqueId);
}

function handleDeliveryTypeChange(event) {
    const deliveryType = event.target.value;
    const deliveryInfoDiv = document.getElementById('delivery-info');
    const addressInput = document.getElementById('client-address');
    document.querySelectorAll('input[name="delivery-type"]').forEach(input => {
        input.closest('label').classList.toggle('selected', input.value === deliveryType);
    });
    if (deliveryType === 'delivery') {
        deliveryInfoDiv.classList.remove('hidden');
        addressInput.required = true;
    } else {
        deliveryInfoDiv.classList.add('hidden');
        addressInput.required = false;
        addressInput.value = '';
    }
    renderizarCarrito(getCarrito(), deliveryType, shippingCost);
}

function handleOrderTimeChange(event) {
    const scheduleContainer = document.getElementById('schedule-time-container');
    const timeSelect = document.getElementById('order-time-select');
    const timeType = event.target.value;
    document.querySelectorAll('input[name="order-time-type"]').forEach(input => {
        input.closest('label').classList.toggle('selected', input.value === timeType);
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
    renderizarCarrito(getCarrito(), deliveryType, shippingCost);
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
    
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryType, shippingCost);
    
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
    renderizarProductos(productosFiltrados, Object.keys(productosFiltrados));
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