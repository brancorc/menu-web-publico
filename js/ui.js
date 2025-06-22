import { actualizarCantidad, eliminarDelCarrito } from './cart.js';
import { COSTO_ENVIO } from './data.js';

const sectionsContainer = document.getElementById('product-sections-container');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartItemCountEl = document.getElementById('cart-item-count');
const checkoutBtn = document.getElementById('checkout-btn');

export const renderizarProductos = (productosPorCategoria) => {
    sectionsContainer.innerHTML = '';
    for (const categoria in productosPorCategoria) {
        const section = document.createElement('main');
        section.id = categoria;
        section.className = 'category-section';
        if (productosPorCategoria[categoria].length === 0) {
            section.classList.add('hidden');
        } else {
            productosPorCategoria[categoria].forEach(producto => {
                const itemHTML = `
                    <div class="item" data-id="${producto.id}" data-category="${categoria}">
                        <img src="${producto.imagen}" alt="${producto.nombre}" />
                        <div class="item-info">
                            <h3>${producto.nombre}</h3>
                            <p>${producto.descripcion}</p>
                            <p class="price">$${producto.precio}</p>
                        </div>
                    </div>
                `;
                section.innerHTML += itemHTML;
            });
        }
        sectionsContainer.appendChild(section);
    }
};

export const renderizarCarrito = (carrito, tipoEntrega = 'pickup') => {
    cartItemsContainer.innerHTML = '';
    const cartFooter = document.querySelector('.cart-footer');
    
    // Limpiamos la fila de envío anterior si existe
    const existingShippingRow = cartFooter.querySelector('.cart-shipping');
    if (existingShippingRow) existingShippingRow.remove();

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty-message">Tu carrito está vacío.</p>`;
        checkoutBtn.disabled = true;
    } else {
        carrito.forEach(item => {
            cartItemsContainer.innerHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="cart-item-info"><h4>${item.nombre}</h4><p class="price">$${item.precio}</p></div>
                    <div class="cart-item-quantity"><button class="quantity-btn cart-quantity-minus">-</button><span>${item.cantidad}</span><button class="quantity-btn cart-quantity-plus">+</button></div>
                    <button class="cart-item-remove">×</button>
                </div>`;
        });
        checkoutBtn.disabled = false;
    }

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;

    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += COSTO_ENVIO;
        const shippingRow = document.createElement('div');
        shippingRow.className = 'cart-total cart-shipping';
        shippingRow.innerHTML = `<span>Envío:</span><span>$${COSTO_ENVIO}</span>`;
        const totalRow = cartFooter.querySelector('.cart-total');
        cartFooter.insertBefore(shippingRow, totalRow);
    }

    cartTotalPriceEl.textContent = `$${total}`;
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartItemCountEl.textContent = totalItems;
    cartItemCountEl.classList.toggle('hidden', totalItems === 0);
};

// ui.js

// Reemplaza la función activarCategoria en ui.js por esta
export const activarCategoria = (categoriaId) => {
    // Manejar la apariencia de los botones de categoría
    document.querySelectorAll('.categories button').forEach(button => {
        button.classList.toggle('active', button.dataset.category === categoriaId);
    });

    // Ocultar todas las secciones de contenido (productos e info)
    document.querySelectorAll('.category-section, .info-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Mostrar la sección correcta
    const sectionToShow = document.getElementById(categoriaId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');

        // Si es una sección de productos, aplicar la animación
        if (sectionToShow.classList.contains('category-section')) {
            const items = sectionToShow.querySelectorAll('.item');
            const delayIncrement = 75;
            items.forEach((item, index) => {
                item.classList.remove('visible');
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * delayIncrement);
            });
        }
    }
};

export const abrirModal = (modal, producto) => {
    if (producto) {
        modal.querySelector('#modal-img').src = producto.imagen;
        modal.querySelector('#modal-title').textContent = producto.nombre;
        modal.querySelector('#modal-description').textContent = producto.descripcion;
        modal.querySelector('#modal-price').textContent = `$${producto.precio}`;
        modal.querySelector('#cantidad').value = 1;
    }
    modal.classList.add('open');
};
export const cerrarModal = (modal) => modal.classList.remove('open');

export const toggleCartPanel = () => {
    document.getElementById('cart-panel').classList.toggle('open');
};

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