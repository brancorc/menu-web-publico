const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartItemCountEl = document.getElementById('cart-item-count');
const checkoutBtn = document.getElementById('checkout-btn');

/**
 * Aplica toda la identidad visual y datos del negocio a la página.
 * @param {Object} settings - Objeto único con toda la configuración.
 */
export const aplicarIdentidadVisual = (settings) => {
    if (!settings) return;

    // --- SEO y Branding Básico ---
    document.title = settings.web_titulo_pagina || 'Menú Online';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = settings.web_descripcion_seo || '';
    }
    const favicon = document.getElementById('dynamic-favicon');
    if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url;
    }
    const logoImg = document.querySelector('.header .logo');
    if (logoImg && settings.logo_url) {
        logoImg.src = settings.logo_url;
        logoImg.alt = settings.web_nombre_negocio || 'Logo del Negocio';
    }

    // --- Links Externos ---
    const whatsappLink = document.querySelector('.whatsapp-float');
    if (whatsappLink && settings.telefono_whatsapp) {
        whatsappLink.href = `https://wa.me/${settings.telefono_whatsapp}`;
    }
    const instagramLink = document.getElementById('instagram-link');
    const instagramUsernameSpan = document.getElementById('instagram-username');
    if (instagramLink && instagramUsernameSpan && settings.link_instagram) {
        instagramLink.href = settings.link_instagram;
        try {
            const url = new URL(settings.link_instagram);
            const username = url.pathname.split('/').filter(p => p).pop();
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
    const zoneLink = document.getElementById('delivery-zone-link');
    if (zoneLink) {
        if (settings.url_imagen_zona_envios) {
            zoneLink.href = settings.url_imagen_zona_envios;
            zoneLink.style.display = 'flex';
        } else {
            zoneLink.style.display = 'none';
        }
    }
    
    // --- Información Operativa ---
    // [CORREGIDO] Lógica para la etiqueta de Retiro
    const pickupLabel = document.getElementById('pickup-label-text');
    if (pickupLabel) {
        if (settings.direccion_local) {
            const soloCalle = settings.direccion_local.split(',')[0].trim();
            pickupLabel.textContent = `Retiro en el local (${soloCalle})`;
        } else {
            pickupLabel.textContent = 'Retiro en el local';
        }
    }

    const addressFooter = document.getElementById('dynamic-address-footer');
    if (addressFooter && settings.direccion_local) {
        addressFooter.textContent = settings.direccion_local;
    }
    const phone = document.getElementById('dynamic-phone');
    if (phone && settings.telefono_visible) {
        phone.textContent = settings.telefono_visible;
    }
    const hours = document.getElementById('dynamic-hours');
    if (hours && settings.texto_horarios) {
        hours.innerHTML = `<strong>${settings.texto_horarios}</strong>`;
    }

    const shippingCostSpan = document.getElementById('dynamic-shipping-cost');
    if (shippingCostSpan && settings.costo_envio_predeterminado) {
        const cost = parseFloat(settings.costo_envio_predeterminado);
        shippingCostSpan.textContent = `$${cost.toLocaleString('es-AR')}`;
    }

    // --- Apariencia ---
    const colorPrimario = settings.web_color_primario || '#1E1E1E';
    const colorAcento = settings.web_color_acento || '#d16416';
    
    // Aplicar Colores
    document.documentElement.style.setProperty('--color-fondo-dinamico', settings.web_color_primario);
    document.documentElement.style.setProperty('--color-acento-dinamico', settings.web_color_acento);
    document.documentElement.style.setProperty('--color-texto-principal-dinamico', settings.web_color_texto_principal);
    document.documentElement.style.setProperty('--color-texto-secundario-dinamico', settings.web_color_texto_secundario);
};

export const renderizarProductos = (productosPorCategoria, categoriasEnOrden) => {
    const swiperWrapper = document.querySelector('#product-sections-container .swiper-wrapper');
    if (!swiperWrapper) return;
    swiperWrapper.innerHTML = '';

    const categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = '';

    categoriasEnOrden.forEach(categoria => {
        const button = document.createElement('button');
        button.dataset.category = categoria;
        button.textContent = categoria;
        categoriesContainer.appendChild(button);

        const section = document.createElement('main');
        section.id = categoria;
        section.className = 'category-section swiper-slide';
        
        const productosDeCategoria = productosPorCategoria[categoria] || [];
        if (productosDeCategoria.length === 0) {
            section.classList.add('hidden');
        }

        productosDeCategoria.forEach(producto => {
            let priceHTML = '', ofertaTagHTML = '';
            
            if (producto.descuento_activo_porcentaje > 0) {
                ofertaTagHTML = `<span class="oferta-tag">¡${producto.descuento_activo_porcentaje}% OFF!</span>`;
                priceHTML = `<div class="price-container"><span class="new-price">$${producto.precio_final.toLocaleString('es-AR')}</span><span class="original-price">$${producto.precio_original.toLocaleString('es-AR')}</span></div>`;
            } else {
                priceHTML = `<p class="price">$${producto.precio_final.toLocaleString('es-AR')}</p>`;
            }

            const imageUrl = producto.imagen_url || 'img/fotoportada.png';

            section.innerHTML += `
                <div class="item" data-id="${producto.id}" data-category="${producto.categoria}">
                    ${ofertaTagHTML}
                    <img src="${imageUrl}" alt="${producto.nombre}" />
                    <div class="item-info">
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion || ''}</p>
                        ${priceHTML}
                    </div>
                </div>`;
        });
        swiperWrapper.appendChild(section);
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
            const itemId = item.uniqueId; 
            const itemImageUrl = item.imagen_url || 'img/fotoportada.png';
            cartItemsContainer.innerHTML += `
                <div class="cart-item" data-id="${itemId}">
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

    const modalPriceEl = modal.querySelector('#modal-price');
    const optionsContainer = modal.querySelector('#modal-options-container');
    
    optionsContainer.innerHTML = '';
    modal.querySelector('#modal-img').src = producto.imagen_url || 'img/fotoportada.png';
    modal.querySelector('#modal-title').textContent = producto.nombre;
    modal.querySelector('#modal-description').textContent = producto.descripcion || '';
    modal.querySelector('#cantidad').value = 1;
    
    let precioBase = producto.precio_final;

    const actualizarPrecioModal = () => {
        let precioTotalAdicionales = 0;
        optionsContainer.querySelectorAll('.adicional-item').forEach(item => {
            const cantidad = parseInt(item.querySelector('.adicional-cantidad').textContent);
            const precioUnitario = parseFloat(item.dataset.precio);
            precioTotalAdicionales += cantidad * precioUnitario;
        });
        modalPriceEl.textContent = `$${(precioBase + precioTotalAdicionales).toLocaleString('es-AR')}`;
    };
    
    if (producto.opciones && producto.opciones.length > 0) {
        producto.opciones.forEach(opcion => {
            const opcionWrapper = document.createElement('div');
            opcionWrapper.className = 'modal-opcion';
            opcionWrapper.innerHTML = `<h4>${opcion.titulo}</h4>`;
            const select = document.createElement('select');
            select.className = 'modal-opcion-select';
            if (Array.isArray(opcion.items)) {
                opcion.items.forEach(item => {
                    select.innerHTML += `<option value="${item.nombre}">${item.nombre}</option>`;
                });
            }
            opcionWrapper.appendChild(select);
            optionsContainer.appendChild(opcionWrapper);
        });
    }

    if (producto.adicionales && producto.adicionales.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'modal-adicionales-wrapper';
        wrapper.innerHTML = `<button id="toggle-adicionales-btn">Agregar Adicionales</button>`;
        const listContainer = document.createElement('div');
        listContainer.id = 'adicionales-list-container';
        listContainer.className = 'hidden';

        producto.adicionales.forEach(adicional => {
            listContainer.innerHTML += `
                <div class="adicional-item" data-id="${adicional.id}" data-precio="${adicional.precio}">
                    <span class="adicional-nombre">${adicional.nombre} (+$${parseFloat(adicional.precio).toLocaleString('es-AR')})</span>
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