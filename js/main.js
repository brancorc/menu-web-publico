import productos from './data.js';
import { getCarrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } from './cart.js';
import { renderizarProductos, renderizarCarrito, abrirModal, cerrarModal, toggleCartPanel, mostrarToast } from './ui.js';
import { enviarPedidoWhatsApp } from './api.js';
import { adicionales } from './data.js';

let productoSeleccionado = null;
let swiper;

// En js/main.js, reemplaza tu addEventListener de 'DOMContentLoaded' completo por este:

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizamos todo como siempre
    renderizarProductos(productos);
    renderizarCarrito(getCarrito());
    setupEventListeners();
    checkStoreStatus();

    // 2. Inicializamos Swiper
    swiper = new Swiper('.swiper', {
        spaceBetween: 20,
        autoHeight: true,
    });

    // 3. FUNCIÓN CLAVE: Esta función se encarga de mostrar los items de la sección activa
    const showActiveSlideItems = () => {
        // Ocultamos TODOS los items de TODAS las secciones para resetear la animación
        document.querySelectorAll('.swiper-slide .item').forEach(item => {
            item.classList.remove('visible');
        });

        // Buscamos la sección que está activa en el carrusel
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (!activeSlide) return; // Medida de seguridad

        // Tomamos solo los items de esa sección activa y los hacemos visibles en cascada
        const items = activeSlide.querySelectorAll('.item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 75); // 75ms de delay entre cada item para el efecto
        });
    };
    
    // 4. EVENTO CLAVE: Sincronizamos todo cuando el usuario desliza el carrusel
    swiper.on('slideChange', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (!activeSlide) return;

        // Sincronizamos el botón activo
        const activeCategory = activeSlide.id;

        // --- INICIA EL NUEVO BLOQUE CORREGIDO ---
        // 1. Primero, quitamos la clase 'active' de TODOS los botones.
        document.querySelectorAll('.categories button').forEach(button => {
            button.classList.remove('active');
        });

        // 2. Después, buscamos específicamente el botón que SÍ debe estar activo y le añadimos la clase.
        const activeButton = document.querySelector(`.categories button[data-category="${activeCategory}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Llamamos a la función para mostrar los items de la nueva sección activa
        showActiveSlideItems();
    });

    // 5. PASO FINAL Y CRÍTICO:
    // Forzamos a Swiper a que se actualice para que reconozca los productos que acabamos de renderizar.
    swiper.update();
    // Y activamos manualmente la animación para la primera sección que se ve al cargar la página.
    showActiveSlideItems();
    // Nos aseguramos de que el primer botón también esté activo.
    document.querySelector('.categories button[data-category="pizzas"]').classList.add('active');
});

// En js/main.js

function setupEventListeners() {
    document.querySelector('.categories').addEventListener('click', handleCategoryClick);
    document.getElementById('product-sections-container').addEventListener('click', handleProductClick);
    
    const productModal = document.getElementById('product-modal');
    productModal.addEventListener('click', handleProductModalClick);
    
    document.getElementById('cart-toggle').addEventListener('click', toggleCartPanel);
    document.getElementById('close-cart-btn').addEventListener('click', toggleCartPanel);

    // <-- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ AQUÍ Y ESTÉ CORRECTA!
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
        
        // Buscamos todas las secciones que son "slides"
        const sections = Array.from(document.querySelectorAll('.category-section.swiper-slide'));
        
        // Encontramos el índice (la posición: 0, 1, 2...) de la sección a la que queremos ir
        const categoryIndex = sections.findIndex(s => s.id === category);
        
        if (categoryIndex !== -1) {
            // Le decimos a Swiper que se deslice a esa posición con una animación.
            swiper.slideTo(categoryIndex);
        }
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
        const selecciones = []; // Dejamos la lógica por si la reutilizas, pero ahora no se usa para adicionales

        // --- NUEVA LÓGICA PARA OBTENER ADICIONALES CON CANTIDAD ---
        const adicionalesSeleccionados = [];
        modal.querySelectorAll('.adicional-item').forEach(item => {
            const cantidad = parseInt(item.querySelector('.adicional-cantidad').textContent);
            if (cantidad > 0) {
                const id = item.dataset.id;
                // Buscamos el objeto completo del adicional y le añadimos la cantidad
                const adicionalData = adicionales.find(ad => ad.id === id);
                adicionalesSeleccionados.push({ ...adicionalData, cantidad });
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

    // AHORA el data-id es el uniqueId que necesitamos
    const itemUniqueId = itemEl.dataset.id; 
    
    // La lógica de actualizar cantidad la delegamos al módulo del carrito
    const itemEnCarrito = getCarrito().find(item => item.uniqueId === itemUniqueId);
    if (!itemEnCarrito) return;
    
    let cantidadActual = itemEnCarrito.cantidad;

    if (event.target.classList.contains('cart-quantity-plus')) {
        actualizarCantidad(itemUniqueId, cantidadActual + 1);
    }
    if (event.target.classList.contains('cart-quantity-minus')) {
        actualizarCantidad(itemUniqueId, cantidadActual - 1);
    }
    // La lógica de eliminar la delegamos al módulo del carrito
    if (event.target.classList.contains('cart-item-remove')) {
        eliminarDelCarrito(itemUniqueId);
    }
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

    // 2. Verificación de teléfono (no se requiere) 
    
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

function checkStoreStatus() {
    const modal = document.getElementById('closed-store-modal');
    const openButton = document.getElementById('close-store-modal-btn');
    const addToCartButtons = document.querySelectorAll('#add-to-cart-btn'); // Asumiendo que el botón del modal de producto tiene este ID

    const now = new Date();
    const day = now.getDay(); // Domingo = 0, Lunes = 1, ..., Sábado = 6
    const hour = now.getHours();

    // Jueves (4), Viernes (5), Sábado (6), Domingo (0)
    const openDays = [0, 4, 5, 6];
    const isOpenDay = openDays.includes(day);
    const isOpenHour = hour >= 19; // Abierto desde las 19:00 hasta la medianoche

    const isStoreOpen = isOpenDay && isOpenHour;

    if (!isStoreOpen) {
        modal.classList.remove('hidden');
    }

    // Evento para cerrar el modal
    openButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}