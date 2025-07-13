import { COSTO_ENVIO } from './data.js';

export const enviarPedidoWhatsApp = (datosCliente, carrito, tipoEntrega) => {
    const tuNumero = '5493412625341'; 

    const detallePedido = carrito.map(item => 
        `- ${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})`
    ).join('\n');

    let subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    let total = subtotal;
    let detalleEnvio = '';

    if (tipoEntrega === 'delivery' && carrito.length > 0) {
        total += COSTO_ENVIO;
        detalleEnvio = `\n*Costo de Envío:* $${COSTO_ENVIO}`;
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

*TOTAL: $${total}*
    `;

    const url = `https://api.whatsapp.com/send?phone=${tuNumero}&text=${encodeURIComponent(mensaje.trim())}`;
    
    window.open(url, '_blank');
};