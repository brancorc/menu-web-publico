import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast, aplicarIdentidadVisual } from './ui.js';
import { apiFetch } from './api.js';

let allProducts = [], productosPorCategoria = {}, productoSeleccionado = null, shippingCost = 0, siteSettings;

function getBusinessSlug() {
    const hostname = window.location.hostname;
    if (hostname === 'monat.ar' || hostname === 'www.monat.ar') return 'monat';
    const pathParts = window.location.pathname.split('/').filter(part => part);
    if (pathParts.length > 0) return pathParts[0];
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) return 'monat';
    return null; 
}

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getBusinessSlug();
    if (!slug) {
        document.body.innerHTML = '<h1>Negocio no encontrado.</h1>';
        return;
    }

    const [menuData, settings] = await Promise.all([
        apiFetch(`/api/public/menu-data/${slug}`),
        apiFetch(`/api/public/settings/${slug}`)
    ]);
    
    siteSettings = settings;
    if (!siteSettings) {
         document.body.innerHTML = '<h1>Error al cargar la configuración del negocio.</h1>';
        return;
    }

    aplicarIdentidadVisual(siteSettings);
    shippingCost = parseFloat(siteSettings.costo_envio_predeterminado);

    if (!menuData || !menuData.productos || !menuData.categorias) {
        document.getElementById('product-container').innerHTML = '<p class="cart-empty-message">No se pudo cargar el menú.</p>';
        return;
    }

    allProducts = menuData.productos;
    const categoriasEnOrden = menuData.categorias;
    
    productosPorCategoria = categoriasEnOrden.reduce((acc, categoria) => {
        acc[categoria] = allProducts.filter(p => p.categoria === categoria);
        return acc;
    }, {});
    
    renderizarProductos(productosPorCategoria, categoriasEnOrden);
    renderizarCarrito(getCarrito());
    setupEventListeners();
    checkStoreStatus();

    const firstCategoryButton = document.querySelector('.categories button');
    if (firstCategoryButton) firstCategoryButton.classList.add('active');

    // Animación inicial
    if (categoriasEnOrden.length > 0) {
        const firstSection = document.getElementById(categoriasEnOrden[0]);
        if (firstSection) {
            const items = firstSection.querySelectorAll('.item');
            items.forEach((item, index) => {
                setTimeout(() => item.classList.add('visible'), index * 75);
            });
        }
    }
});

function setupEventListeners() {
    document.querySelector('.categories').addEventListener('click', handleCategoryClick);
    document.getElementById('product-container').addEventListener('scroll', handleProductScroll);
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
}

function handleCategoryClick(event) {
    const button = event.target.closest('button');
    if (button) {
        const categoryId = button.dataset.category;
        const section = document.getElementById(categoryId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
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
    if (event.target.classList.contains('close') || event.target.classList.contains('modal')) {
        cerrarModal(modal);
        return;
    }

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

    const timeType = input.value;
    const scheduleContainer = document.getElementById('schedule-time-container');
    document.getElementById('order-time-select').required = (timeType === 'schedule');
    scheduleContainer.classList.toggle('hidden', timeType !== 'schedule');
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

    const timeSelect = document.getElementById('order-time-select');
    if (timeTypeInput.value === 'schedule' && !timeSelect.value) return mostrarToast("Por favor, seleccioná una hora para programar tu pedido.");

    const datosCliente = {
        nombre: document.getElementById('client-name').value,
        tipoEntrega: deliveryTypeInput.value === 'delivery' ? 'Envío a domicilio' : 'Retiro en local',
        direccion: deliveryTypeInput.value === 'delivery' ? direccion : 'N/A',
        horaPedido: timeTypeInput.value === 'schedule' ? timeSelect.value + ' hs' : 'Lo antes posible',
        pago: document.getElementById('payment-method').value,
        notas: document.getElementById('order-notes').value
    };
    
    enviarPedidoWhatsApp(datosCliente, getCarrito(), deliveryTypeInput.value, shippingCost, siteSettings.telefono_whatsapp);
    
    cerrarModal(document.getElementById('checkout-modal'));
    limpiarCarrito();
    document.getElementById('checkout-form').reset();
    document.getElementById('delivery-info').classList.add('hidden');
    document.getElementById('schedule-time-container').classList.add('hidden');
    document.querySelectorAll('.delivery-options label.selected').forEach(l => l.classList.remove('selected'));
    renderizarCarrito(getCarrito()); 
}

function handleSearch(event) {
    const termino = event.target.value.toLowerCase().trim();
    document.querySelectorAll('.category-section').forEach(section => {
        let hasVisibleItems = false;
        section.querySelectorAll('.item').forEach(item => {
            const nombre = item.querySelector('h3').textContent.toLowerCase();
            const descripcion = item.querySelector('p').textContent.toLowerCase();
            const isVisible = nombre.includes(termino) || descripcion.includes(termino);
            item.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) hasVisibleItems = true;
        });
        section.style.display = hasVisibleItems ? 'block' : 'none';
    });
}

function checkStoreStatus() {
    const modal = document.getElementById('closed-store-modal');
    const openButton = document.getElementById('close-store-modal-btn');
    if (!modal || !openButton) return;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // Asumimos Jueves (4) a Domingo (0) de 19:00 a 23:59
    const openDays = [0, 4, 5, 6]; 
    const isStoreOpen = openDays.includes(day) && hour >= 19;
    
    if (!isStoreOpen) modal.classList.remove('hidden');
    openButton.addEventListener('click', () => modal.classList.add('hidden'));
}

const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega, costoEnvio, numeroDestino) => {
    if (!numeroDestino) {
        return alert("Error: El número de WhatsApp del negocio no está configurado.");
    }
    const detallePedido = carrito.map(item => `- ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})`).join('\n');
    let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let detalleEnvio = '';

    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += costoEnvio;
        detalleEnvio = `\n*Costo de Envío:* $${costoEnvio.toLocaleString('es-AR')}`;
    }
    const mensaje = `
*¡Nuevo Pedido para ${siteSettings.web_nombre_negocio || 'el local'}!* 🎉

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