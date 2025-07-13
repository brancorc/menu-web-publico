# Monãt - Menú Digital y Sistema de Pedidos por WhatsApp

Este es el repositorio del sitio web para "Monãt - Pides, Rosario", un menú digital interactivo diseñado para facilitar a los clientes la visualización de productos y la realización de pedidos a través de WhatsApp.

## Descripción del Proyecto

El sitio funciona como una carta digital completa donde los usuarios pueden explorar el menú, agregar productos a un carrito de compras y, finalmente, generar un mensaje de pedido pre-formateado para enviar a través de WhatsApp. El sistema no procesa pagos, centralizando la confirmación final del pedido en el chat con el local.

## ✨ Características Principales

*   **Menú por Categorías:** Productos organizados en secciones claras (Pizzas, Promos, Carlitos, etc.).
*   **Buscador de Productos:** Permite a los usuarios buscar ítems por nombre o descripción.
*   **Carrito de Compras Dinámico:** Añade, actualiza y elimina productos de tu pedido en tiempo real.
*   **Cálculo de Total Automático:** El total se actualiza al instante, incluyendo el costo de envío si se selecciona.
*   **Modal de Producto:** Vista detallada de cada producto antes de agregarlo al carrito.
*   **Opciones de Entrega:** El usuario puede elegir entre "Retiro en el local" o "Envío a domicilio".
*   **Programación de Pedidos:** Opción para recibir el pedido "Lo antes posible" o programarlo para una hora específica.
*   **Generación de Pedido para WhatsApp:** Al finalizar, se construye un mensaje detallado que el cliente envía desde su propio WhatsApp.
*   **Modal de "Tienda Cerrada":** Informa al usuario si el local se encuentra fuera del horario de atención.
*   **Diseño Responsivo:** Adaptado para una correcta visualización en dispositivos móviles y de escritorio.

## 🚀 Tecnologías Utilizadas

*   **HTML5:** Estructura del sitio.
*   **CSS3:** Estilos, animaciones y diseño responsivo. Se utilizan variables CSS para una fácil personalización de la paleta de colores.
*   **JavaScript (ES6+ Modules):** Toda la lógica e interactividad del sitio, incluyendo:
    *   Manipulación del DOM.
    *   Gestión del estado del carrito con `localStorage`.
    *   Filtrado de productos y renderizado dinámico.
    *   Comunicación con la API de WhatsApp.

## 📂 Estructura de Archivos

```
/
├── css/
│   └── styles.css        # Hoja de estilos principal
├── img/
│   └── ...               # Todas las imágenes de productos, logos, etc.
├── js/
│   ├── main.js           # Archivo principal, orquesta los eventos y la lógica
│   ├── cart.js           # Lógica del carrito (agregar, eliminar, actualizar)
│   ├── ui.js             # Funciones que manipulan la interfaz (renderizar, modales)
│   ├── api.js            # Lógica para enviar el pedido a WhatsApp
│   └── data.js           # Base de datos de productos y costo de envío
├── index.html            # Página principal del menú
├── terminos.html         # Página de Términos y Condiciones
├── privacidad.html       # Página de Política de Privacidad
└── ...                   # Otros archivos HTML y recursos
```

## ⚙️ Configuración

Para adaptar o configurar el sitio, los principales puntos a modificar son:

1.  **Número de WhatsApp:** En el archivo `js/api.js`, reemplaza el número de teléfono en la constante `tuNumero`.
2.  **Productos y Precios:** Todos los productos, descripciones, precios e imágenes se gestionan desde el archivo `js/data.js`. Puedes modificar, añadir o eliminar productos directamente en este archivo.
3.  **Costo de Envío:** El costo de envío se define en la constante `COSTO_ENVIO` dentro de `js/data.js`.
4.  **Horarios de Atención:** La lógica que determina si la tienda está abierta se encuentra en la función `checkStoreStatus()` en `js/main.js`.
5.  **Horarios para Programar Pedidos:** Las franjas horarias para programar pedidos están directamente en `index.html`, dentro del `<select id="order-time-select">`.

## 🧑‍💼 Propietario

El contenido, logo y nombre "Monãt" son propiedad de **Branco Blunda** (CUIT 20-12345678-9).