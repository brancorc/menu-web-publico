const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartItemCountEl = document.getElementById('cart-item-count');
const checkoutBtn = document.getElementById('checkout-btn');

/**
 * Aplica la identidad visual (logo, colores, textos y links) a la página.
 * @param {Object} settings - Objeto único con toda la configuración del negocio.
 */
export const aplicarIdentidadVisual = (settings) => {
    if (!settings) return;

    // --- Identidad y SEO ---
    document.title = settings.web_titulo_pagina || 'Menú Online';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = settings.web_descripcion_seo || '';
    }
    
    const logoImg = document.querySelector('.header .logo');
    if (logoImg && settings.logo_url) {
        logoImg.src = settings.logo_url;
        logoImg.alt = settings.web_nombre_negocio || 'Logo del Negocio';
    }

    const favicon = document.getElementById('favicon');
    if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url;
    }

    // --- Links ---
    const whatsappLink = document.querySelector('.whatsapp-float');
    if (whatsappLink && settings.telefono_whatsapp) {
        whatsappLink.href = `https://wa.me/${settings.telefono_whatsapp}`;
    }
    const instagramLink = document.getElementById('instagram-link');
    const instagramUsernameSpan = document.getElementById('instagram-username');
    if (instagramLink && instagramUsernameSpan && settings.link_instagram) {
        instagramLink.href = settings.link_instagram;
        try {
            const urlParts = settings.link_instagram.split('/').filter(part => part);
            const username = urlParts[urlParts.length - 1];
            instagramUsernameSpan.textContent = username || 'Instagram';
        } catch (e) {
            instagramUsernameSpan.textContent = 'Instagram';
        }
    }
    const pedidosyaLink = document.getElementById('pedidosya-link');
    if (pedidosyaLink) {
        if (settings.link_pedidosya) {
            pedidosyaLink.href = settings.link_pedidosya;
            pedidosyaLink.parentElement.style.display = 'flex';
        } else {
            pedidosyaLink.parentElement.style.display = 'none';
        }
    }

    // --- Información del Negocio ---
    const pickupLabel = document.getElementById('pickup-label-text');
    if (pickupLabel && settings.direccion_local) {
        const soloCalle = settings.direccion_local.split(',')[0].trim();
        pickupLabel.textContent = `Retiro en el local (${soloCalle})`;
    } else if (pickupLabel) {
        pickupLabel.textContent = 'Retiro en el local';
    }
    const addressFooter = document.getElementById('dynamic-address-footer');
    if (addressFooter && settings.direccion_local) {
        addressFooter.textContent = settings.direccion_local;
    }
    const phone = document.getElementById('dynamic-phone');
    if (phone && settings.telefono_visible) {
        phone.textContent = settings.telefono_visible;
    }
    const zoneLink = document.getElementById('delivery-zone-link');
    if (zoneLink) {
        zoneLink.style.display = settings.url_imagen_zona_envios ? 'flex' : 'none';
        if(settings.url_imagen_zona_envios) zoneLink.href = settings.url_imagen_zona_envios;
    }
    const hours = document.getElementById('dynamic-hours');
    if (hours && settings.texto_horarios) {
        hours.innerHTML = `<strong>${settings.texto_horarios}</strong>`;
    }

    // --- Costo de Envío ---
    const shippingCostSpan = document.getElementById('dynamic-shipping-cost');
    if (shippingCostSpan && settings.costo_envio_predeterminado) {
        const cost = parseFloat(settings.costo_envio_predeterminado);
        shippingCostSpan.textContent = `$${cost.toLocaleString('es-AR')}`;
    }

    // --- Colores ---
    document.documentElement.style.setProperty('--color-fondo-dinamico', settings.web_color_primario || '#1E1E1E');
    document.documentElement.style.setProperty('--color-acento-dinamico', settings.web_color_acento || '#d16416');
    document.documentElement.style.setProperty('--color-texto-principal-dinamico', settings.web_color_texto_principal || '#F2F2F2');
    document.documentElement.style.setProperty('--color-texto-secundario-dinamico', settings.web_color_texto_secundario || '#CCCCCC');
};

/**
 * Renderiza los productos y categorías en el DOM.
 * @param {Object} productosPorCategoria - Objeto con productos agrupados por categoría.
 * @param {string[]} categoriasEnOrden - Array con el nombre de las categorías en el orden correcto.
 */
export const renderizarProductos = (productosPorCategoria, categoriasEnOrden) => {
    const productContainer = document.getElementById('product-container');
    const categoriesContainer = document.querySelector('.categories');
    
    if (!productContainer || !categoriesContainer) return;

    productContainer.innerHTML = '';
    categoriesContainer.innerHTML = '';

    categoriasEnOrden.forEach(categoria => {
        if (!productosPorCategoria[categoria] || productosPorCategoria[categoria].length === 0) return;

        // Renderizar botón de categoría
        const button = document.createElement('button');
        button.dataset.category = categoria;
        button.textContent = categoria;
        categoriesContainer.appendChild(button);

        // Renderizar sección de productos
        const section = document.createElement('section');
        section.id = categoria;
        section.className = 'category-section';
        
        const title = document.createElement('h2');
        title.textContent = categoria;
        section.appendChild(title);

        productosPorCategoria[categoria].forEach(producto => {
            let priceHTML = '', ofertaTagHTML = '';
            
            if (producto.descuento_activo_porcentaje > 0) {
                ofertaTagHTML = `<span class="oferta-tag">¡${producto.descuento_activo_porcentaje}% OFF!</span>`;
                priceHTML = `<div class="price-container"><span class="new-price">$${producto.precio_final.toLocaleString('es-AR')}</span><span class="original-price">$${producto.precio_original.toLocaleString('es-AR')}</span></div>`;
            } else {
                priceHTML = `<p class="price">$${producto.precio_final.toLocaleString('es-AR')}</p>`;
            }

            const imageUrl = producto.imagen_url || 'img/fotoportada.png';
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.dataset.id = producto.id;
            itemDiv.dataset.category = producto.categoria;
            itemDiv.innerHTML = `
                ${ofertaTagHTML}
                <img src="${imageUrl}" alt="${producto.nombre}" />
                <div class="item-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion || ''}</p>
                    ${priceHTML}
                </div>
            `;
            section.appendChild(itemDiv);
        });
        productContainer.appendChild(section);
    });
};


export const renderizarCarrito = (carrito, tipoEntrega = 'pickup', costoEnvio = 0) => {
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
            const itemImageUrl = item.imagen_url || 'img/fotoportada.png';
            cartItemsContainer.innerHTML += `
                <div class="cart-item" data-id="${item.uniqueId}">
                    <img src="${itemImageUrl}" alt="${item.nombre}">
                    <div class="cart-item-info"><h4>${item.nombre}</h4><p class="price">$${item.precio.toLocaleString('es-AR')}</p></div>
                    <div class="cart-item-quantity"><button class="quantity-btn cart-quantity-minus">-</button><span>${item.cantidad}</span><button class="quantity-btn cart-quantity-plus">+</button></div>
                    <button class="cart-item-remove">×</button>
                </div>`;
        });
    }

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += costoEnvio;
        const shippingRow = document.createElement('div');
        shippingRow.className = 'cart-total cart-shipping';
        shippingRow.innerHTML = `<span>Envío:</span><span>$${costoEnvio.toLocaleString('es-AR')}</span>`;
        cartFooter.insertBefore(shippingRow, cartFooter.querySelector('.cart-total'));
    }

    cartTotalPriceEl.textContent = `$${total.toLocaleString('es-AR')}`;
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartItemCountEl.textContent = totalItems;
    cartItemCountEl.classList.toggle('hidden', totalItems === 0);
};

export const abrirModal = (modal, producto) => {
    if (!producto) {
        modal.classList.add('open');
        return;
    }
    // ... (El resto de la función `abrirModal` no necesita cambios)
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