// Constante para el costo de envío. Si cambia, solo lo modificas aquí.
export const COSTO_ENVIO = 1500; 

// Este archivo contiene únicamente los datos de los productos.
const productos = {
  pizzas: [

  {
    id: "pide-muzzarella",
    nombre: "Pide Muzzarella",
    descripcion: "Masa crocante, salsa casera y muzzarella al punto justo.",
    precio: 3800,
    imagen: "img/pides/muzza.png"
  },
  {
    id: "pide-jamon",
    nombre: "Pide Jamón",
    descripcion: "Muzzarella fundida y jamón sobre masa fina.",
    precio: 4000,
    imagen: "img/pides/jamon.jpg"
  },
  {
    id: "pide-roque",
    nombre: "Pide Roquefort",
    descripcion: "Roquefort intenso, muzzarella suave y masa crocante.",
    precio: 4200,
    imagen: "img/pides/roque.jpg"
  },
  {
    id: "pide-salame",
    nombre: "Pide Salame",
    descripcion: "Rodajas de salame y muzzarella sobre base fina.",
    precio: 4500,
    imagen: "img/pides/Salame.png"
  },
  {
    id: "pide-napo",
    nombre: "Pide Napolitana",
    descripcion: "Muzzarella, tomate cherry fresco y albahaca en masa fina.",
    precio: 4500,
    imagen: "img/pides/napo.jpg"
  },
  {
    id: "pide-2-quesos",
    nombre: "Pide 2 Quesos",
    descripcion: "Dúo perfecto: muzzarella y cheddar sobre masa crujiente.",
    precio: 4500,
    imagen: "img/pides/2 quesos.png"
  },
  {
    id: "pide-roque-jamon",
    nombre: "Pide Roque y Jamón",
    descripcion: "Roquefort, jamón y muzzarella fundidos en cada bocado.",
    precio: 4500,
    imagen: "img/pides/roque y jamon.png"
  },
  {
    id: "pide-especial",
    nombre: "Pide Especial",
    descripcion: "Muzzarella, huevo, jamon, morrón y aceitunas sobre masa fina.",
    precio: 4500,
    imagen: "img/pides/especial.png"
  },
  {
    id: "pide-pepperoni",
    nombre: "Pide Pepperoni",
    descripcion: "Muzzarella y pepperoni picante sobre masa crocante.",
    precio: 4500,
    imagen: "img/pides/pepperoni.png"
  },
  {
    id: "pide-3quesos",
    nombre: "Pide 3 Quesos",
    descripcion: "Muzzarella, cheddar y roquefort, la combinación ideal.",
    precio: 5000,
    imagen: "img/pides/3 quesos.png"
  },
  {
    id: "pide-cheddar_panceta",
    nombre: "Pide Cheddar y Panceta",
    descripcion: "Cheddar fundido y panceta crocante en cada bocado.",
    precio: 5500,
    imagen: "img/pides/cheddar y panceta.jpg"
  }


  ],
  combos: [
    {
      id: "combo-1",
      nombre: "Promo Apertura Pides",
      descripcion: "2 pides de jamon + 2 Gaseosas a elección 500ml",
      precio: 10000,
      imagen: "img/combos/2.jpg"
    },

    {
      id: "combo-2",
      nombre: "Promo Apertura Carlitos",
      descripcion: "2 Carlitos jamon y queso + 2 Gaseosas a elección 500ml",
      precio: 13000,
      imagen: "img/combos/1.jpg"
    },

  ],
  carlitos: [
      {
    id: "carlito-jyq",
    nombre: "Carlito Jamón y Queso",
    descripcion: "El clasico de siempre: jamón de primera calidad y mucho queso",
    precio: 5500,
    imagen: "img/carlitos/jamon y queso.jpg"
  }
  ],
  empanadas: [],

  bebidas: [
  {
    id: "cocacola",
    nombre: "Coca-Cola 500ml",
    descripcion: "Gaseosa Coca-Cola de 500ml",
    precio: 2000,
    imagen: "img/bebidas/cocacola500.jpg"
  },

  {
    id: "fanta",
    nombre: "Fanta 500ml",
    descripcion: "Gaseosa Fanta de 500ml",
    precio: 2000,
    imagen: "img/bebidas/fanta500.jpg"
  },
  {
    id: "sprite",
    nombre: "Sprite 500ml",
    descripcion: "Gaseosa Sprite de 500ml",
    precio: 2000,
    imagen: "img/bebidas/sprite500.jpg"
  },
  {
    id: "quilmes",
    nombre: "Quilmes 473ml",
    descripcion: "Lata quilmes de 473ml",
    precio: 2500,
    imagen: "img/bebidas/quilmes473.jpg"
  },
  {
    id: "brahma",
    nombre: "Brahma 473ml",
    descripcion: "Lata Brahma de 473ml",
    precio: 2500,
    imagen: "img/bebidas/brahma473.jpg"
  },

  {
    id: "schneider",
    nombre: "Schneider 473ml",
    descripcion: "Lata Schneider de 473ml",
    precio: 2500,
    imagen: "img/bebidas/schneider473.jpg"
  }

  


  ]
};

export default productos;