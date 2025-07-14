import { COSTO_ENVIO, adicionales } from './data.js';

const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartItemCountEl = document.getElementById('cart-item-count');
const checkoutBtn = document.getElementById('checkout-btn');

export const renderizarProductos = (productosPorCategoria) => {
    const swiperWrapper = document.querySelector('#product-sections-container .swiper-wrapper');
    if (!swiperWrapper) {
        console.error("El contenedor .swiper-wrapper no se encontró.");
        return;
    }
    swiperWrapper.innerHTML = '';

    for (const categoria in productosPorCategoria) {
        const section = document.createElement('main');
        section.id = categoria;
        section.className = 'category-section swiper-slide';
        if (productosPorCategoria[categoria].length === 0) {
            section.classList.add('hidden');
        }

        productosPorCategoria[categoria].forEach(producto => {
            let priceHTML, ofertaTagHTML = '';
            if (producto.precioOriginal) {
                ofertaTagHTML = '<span class="oferta-tag">¡OFERTA!</span>';
                priceHTML = `<div class="price-container"><span class="new-price">$${producto.precio}</span><span class="original-price">$${producto.precioOriginal}</span></div>`;
            } else {
                priceHTML = `<p class="price">$${producto.precio}</p>`;
            }
            section.innerHTML += `
                <div class="item" data-id="${producto.id}" data-category="${categoria}">
                    ${ofertaTagHTML}
                    <img src="${producto.imagen}" alt="${producto.nombre}" />
                    <div class="item-info"><h3>${producto.nombre}</h3><p>${producto.descripcion}</p>${priceHTML}</div>
                </div>`;
        });
        swiperWrapper.appendChild(section);
    }
};

export const renderizarCarrito = (carrito, tipoEntrega = 'pickup') => {
    const cartFooter = document.querySelector('.cart-footer');
    cartItemsContainer.innerHTML = '';
    const existingShippingRow = cartFooter.querySelector('.cart-shipping');
    if (existingShippingRow) existingShippingRow.remove();

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty-message">Tu carrito está vacío.</p>`;
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        carrito.forEach(item => {
            // --- ¡¡ESTA ES LA CORRECCIÓN CLAVE!! ---
            // Usamos item.uniqueId para identificar de forma única cada elemento en el carrito.
            const itemId = item.uniqueId; 
            cartItemsContainer.innerHTML += `
                <div class="cart-item" data-id="${itemId}">
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="cart-item-info"><h4>${item.nombre}</h4><p class="price">$${item.precio}</p></div>
                    <div class="cart-item-quantity"><button class="quantity-btn cart-quantity-minus">-</button><span>${item.cantidad}</span><button class="quantity-btn cart-quantity-plus">+</button></div>
                    <button class="cart-item-remove">×</button>
                </div>`;
        });
    }

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += COSTO_ENVIO;
        const shippingRow = document.createElement('div');
        shippingRow.className = 'cart-total cart-shipping';
        shippingRow.innerHTML = `<span>Envío:</span><span>$${COSTO_ENVIO}</span>`;
        cartFooter.insertBefore(shippingRow, cartFooter.querySelector('.cart-total'));
    }

    cartTotalPriceEl.textContent = `$${total}`;
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartItemCountEl.textContent = totalItems;
    cartItemCountEl.classList.toggle('hidden', totalItems === 0);
};

export const abrirModal = (modal, producto) => {
    if (!producto) return modal.classList.add('open'); // Permite abrir el modal de checkout sin producto

    const modalPriceEl = modal.querySelector('#modal-price');
    const optionsContainer = modal.querySelector('#modal-options-container');
    
    optionsContainer.innerHTML = '';
    modal.querySelector('#modal-img').src = producto.imagen;
    modal.querySelector('#modal-title').textContent = producto.nombre;
    modal.querySelector('#modal-description').textContent = producto.descripcion;
    modal.querySelector('#cantidad').value = 1;
    
    const actualizarPrecioModal = () => {
        let precioTotalAdicionales = 0;
        optionsContainer.querySelectorAll('.adicional-item').forEach(item => {
            const cantidad = parseInt(item.querySelector('.adicional-cantidad').textContent);
            const precioUnitario = parseInt(item.dataset.precio);
            precioTotalAdicionales += cantidad * precioUnitario;
        });
        modalPriceEl.textContent = `$${producto.precio + precioTotalAdicionales}`;
    };

    if (producto.permiteAdicionales) {
        const wrapper = document.createElement('div');
        wrapper.className = 'modal-adicionales-wrapper';
        wrapper.innerHTML = `<button id="toggle-adicionales-btn">Agregar Adicionales</button>`;
        const listContainer = document.createElement('div');
        listContainer.id = 'adicionales-list-container';
        listContainer.className = 'hidden';

        adicionales.forEach(adicional => {
            listContainer.innerHTML += `
                <div class="adicional-item" data-id="${adicional.id}" data-precio="${adicional.precio}">
                    <span class="adicional-nombre">${adicional.nombre} (+$${adicional.precio})</span>
                    <div class="adicional-quantity-selector">
                        <button class="adicional-quantity-btn" data-action="minus">-</button>
                        <span class="adicional-cantidad">0</span>
                        <button class="adicional-quantity-btn" data-action="plus">+</button>
                    </div>
                </div>`;
        });
        wrapper.appendChild(listContainer);
        optionsContainer.appendChild(wrapper);

        wrapper.addEventListener('click', (e) => {
            if (e.target.id === 'toggle-adicionales-btn') listContainer.classList.toggle('hidden');
            if (e.target.classList.contains('adicional-quantity-btn')) {
                const action = e.target.dataset.action;
                const cantidadSpan = e.target.parentElement.querySelector('.adicional-cantidad');
                let cantidadActual = parseInt(cantidadSpan.textContent);
                if (action === 'plus') cantidadActual++;
                else if (action === 'minus' && cantidadActual > 0) cantidadActual--;
                cantidadSpan.textContent = cantidadActual;
                actualizarPrecioModal();
            }
        });
    }
    
    actualizarPrecioModal();
    modal.classList.add('open');
};

export const cerrarModal = (modal) => modal.classList.remove('open');

export const toggleCartPanel = () => document.getElementById('cart-panel').classList.toggle('open');

export const mostrarToast = (mensaje) => {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
};