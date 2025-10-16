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

    if (!menuData || !menuData.productos) {
        const productContainer = document.getElementById('product-container');
        productContainer.innerHTML = `<div class="no-results-message">Este negocio aún no tiene productos cargados.</div>`;
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

    const firstCategoryButton = document.querySelector('.categories button');
    if (firstCategoryButton) {
        firstCategoryButton.classList.add('active');
    }
});

function setupEventListeners() {
    document.querySelector('.categories').addEventListener('click', handleCategoryClick);
    document.getElementById('product-container').addEventListener('click', handleProductClick);
    document.getElementById('product-modal').addEventListener('click', handleProductModalClick);
    document.getElementById('cart-toggle').addEventListener('click', toggleCartPanel);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCartPanel);
    document.getElementById('checkout-btn').addEventListener('click', () => abrirModal(document.getElementById('checkout-modal')));
    document.getElementById('cart-items').addEventListener('click', handleCartItemInteraction);
    document.getElementById('checkout-modal').querySelector('.close').addEventListener('click', () => cerrarModal(document.getElementById('checkout-modal')));
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    document.getElementById('search-form').addEventListener('submit', e => e.preventDefault());
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('delivery-type-options').addEventListener('click', handleDeliveryTypeClick);
    document.getElementById('order-time-type-options').addEventListener('click', handleOrderTimeClick);
    document.getElementById('product-container').addEventListener('scroll', handleProductScroll);
}

function handleCategoryClick(event) {
    const button = event.target.closest('button');
    if (button) {
        const categoryId = button.dataset.category;
        const section = document.getElementById(categoryId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function handleProductScroll() {
    const productContainer = document.getElementById('product-container');
    let currentCategory = '';
    
    document.querySelectorAll('.category-section').forEach(section => {
        const sectionTop = section.offsetTop - productContainer.offsetTop;
        if (productContainer.scrollTop >= sectionTop - 150) {
            currentCategory = section.id;
        }
    });

    document.querySelectorAll('.categories button').forEach(button => {
        button.classList.toggle('active', button.dataset.category === currentCategory);
    });
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

    if (event.target.classList.contains('close')) {
        cerrarModal(modal);
    }
}

function handleCartItemInteraction(event) {
    const itemEl = event.target.closest('.cart-item');
    const uniqueId = itemEl?.dataset.id;
    if (!uniqueId) return;

    if (event.target.classList.contains('cart-quantity-plus')) actualizarCantidad(uniqueId, 1);
    else if (event.target.classList.contains('cart-quantity-minus')) actualizarCantidad(uniqueId, -1);
    else if (event.target.classList.contains('cart-item-remove')) eliminarDelCarrito(uniqueId);
}

function handleDeliveryTypeClick(event) {
    const label = event.target.closest('label');
    if (!label) return;
    const input = label.querySelector('input[name="delivery-type"]');
    if (!input) return;
    
    input.checked = true;

    document.querySelectorAll('#delivery-type-options label').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');

    const deliveryType = input.value;
    const deliveryInfoDiv = document.getElementById('delivery-info');
    document.getElementById('client-address').required = (deliveryType === 'delivery');
    deliveryInfoDiv.classList.toggle('hidden', deliveryType !== 'delivery');
    
    renderizarCarrito(getCarrito(), deliveryType, shippingCost);
}

function handleOrderTimeClick(event) {
    const label = event.target.closest('label');
    if (!label) return;
    const input = label.querySelector('input[name="order-time-type"]');
    if (!input) return;

    input.checked = true;

    document.querySelectorAll('#order-time-type-options label').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');

    const scheduleContainer = document.getElementById('schedule-time-container');
    document.getElementById('order-time-select').required = (input.value === 'schedule');
    scheduleContainer.classList.toggle('hidden', input.value !== 'schedule');
}

function handleCheckout(event) {
    event.preventDefault();
    if (getCarrito().length === 0) return mostrarToast("Tu carrito está vacío.");
    
    const deliveryTypeInput = document.querySelector('input[name="delivery-type"]:checked');
    if (!deliveryTypeInput) return mostrarToast("Por favor, selecciona un tipo de entrega.");

    const timeTypeInput = document.querySelector('input[name="order-time-type"]:checked');
    if (!timeTypeInput) return mostrarToast("Por favor, selecciona cuándo quieres tu pedido.");

    const direccion = document.getElementById('client-address').value;
    if (deliveryTypeInput.value === 'delivery' && !direccion.trim()) return mostrarToast("Por favor, ingresa tu dirección para el envío.");

    const clientName = document.getElementById('client-name').value;
    if (!clientName.trim()) return mostrarToast("Por favor, ingresa tu nombre.");

    let horaPedido;
    if (timeTypeInput.value === 'schedule') {
        const timeSelect = document.getElementById('order-time-select');
        if (!timeSelect.value) {
            return mostrarToast("Por favor, seleccioná una hora para programar tu pedido.");
        }
        horaPedido = timeSelect.value + ' hs';
    } else {
        horaPedido = 'Lo antes posible';
    }

    const datosCliente = {
        nombre: clientName,
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
    document.getElementById('checkout-form').reset();
    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');
    document.querySelectorAll('.delivery-options label.selected').forEach(l => l.classList.remove('selected'));
    renderizarCarrito(getCarrito(), 'pickup', shippingCost); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    document.querySelectorAll('.category-section .item').forEach(item => {
        const nombre = item.querySelector('h3').textContent.toLowerCase();
        const descripcion = item.querySelector('p').textContent.toLowerCase();
        const isVisible = nombre.includes(termino) || descripcion.includes(termino);
        item.style.display = isVisible ? 'flex' : 'none';
    });
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