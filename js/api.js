// [MODIFICADO] Ya no importamos COSTO_ENVIO. Se recibirá como parámetro.

export const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega, costoEnvio) => {
    const tuNumero = '5493412625341'; 

    const detallePedido = carrito.map(item => 
        // Usamos toLocaleString para formatear los números correctamente
        `- ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})`
    ).join('\n');

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    let detalleEnvio = '';

    // [MODIFICADO] Usamos el costo de envío que recibimos como parámetro dinámico
    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += costoEnvio;
        detalleEnvio = `\n*Costo de Envío:* $${costoEnvio.toLocaleString('es-AR')}`;
    }

    const mensaje = `
*¡Nuevo Pedido de Monãt!* 🎉

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

    const url = `https://api.whatsapp.com/send?phone=${tuNumero}&text=${encodeURIComponent(mensaje.trim())}`;
    
    window.open(url, '_blank');
};