// Constante para el costo de envío. Si cambia, solo lo modificas aquí.
export const COSTO_ENVIO = 1500; 

export const adicionales = [
  { id: "extra-muzzarella", nombre: "Extra Muzzarella", precio: 1200 },
  { id: "extra-jamon", nombre: "Extra Jamon", precio: 1000 },
  { id: "extra-roquefort", nombre: "Extra Roquefort", precio: 1500 },
  { id: "extra-cheddar", nombre: "Extra Cheddar", precio: 1500 },
  { id: "extra-huevo-a-caballo", nombre: "Extra Huevo A Caballo", precio: 800 }, 
  { id: "extra-huevo-duro", nombre: "Extra Huevo Duro", precio: 800 },
  { id: "extra-salame", nombre: "Extra Salame", precio: 1200 },
  { id: "extra-albahaca", nombre: "Extra Albahaca", precio: 600 },
  { id: "extra-tomate-cherry", nombre: "Extra Tomate Cherry", precio: 800 },
  { id: "extra-morron", nombre: "Extra Morron", precio: 800 },
  { id: "extra-aceitunas", nombre: "Extra Aceitunas", precio: 800 },
  { id: "extra-pepperoni", nombre: "Extra Pepperoni", precio: 2000 },
  { id: "extra-panceta", nombre: "Extra Panceta", precio: 1500 },
  { id: "extra-salsa-golf", nombre: "Extra Salsa Golf", precio: 600 },
];


// Este archivo contiene únicamente los datos de los productos.
const productos = {
  pizzas: [

  {
    id: "pide-muzzarella",
    nombre: "Pide Muzzarella",
    descripcion: "Masa crocante, salsa casera y muzzarella al punto justo.",
    precio: 4000,
    imagen: "img/pides/muzza.png",
    permiteAdicionales: true,
  },

  {
    id: "pide-jamon",
    nombre: "Pide Jamón",
    descripcion: "Muzzarella fundida y jamón sobre masa fina.",
    precio: 4500,
    imagen: "img/pides/jamon.jpg",
    permiteAdicionales: true,
  },
  {
    id: "pide-salame",
    nombre: "Pide Salame",
    descripcion: "Rodajas de salame y muzzarella sobre base fina.",
    precio: 4500,
    imagen: "img/pides/Salame.png",
    permiteAdicionales: true,
  },
  {
    id: "pide-napo",
    nombre: "Pide Napolitana",
    descripcion: "Muzzarella, tomate cherry fresco y albahaca en masa fina.",
    precio: 4500,
    imagen: "img/pides/napo.jpg",
    permiteAdicionales: true,
  },
  {
    id: "pide-pepperoni",
    nombre: "Pide Pepperoni",
    descripcion: "Muzzarella y pepperoni picante sobre masa crocante.",
    precio: 4500,
    imagen: "img/pides/pepperoni.png",
    permiteAdicionales: true,
  },

  {
    id: "pide-doble-muzza",
    nombre: "Pide Doble Muzza",
    descripcion: "Doble porción de muzzarella sobre masa fina y crujiente.",
    precio: 5000,
    imagen: "img/pides/doblemuzza.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-2-quesos",
    nombre: "Pide 2 Quesos",
    descripcion: "Dúo perfecto: muzzarella y cheddar sobre masa crujiente.",
    precio: 5000,
    imagen: "img/pides/2 quesos.png",
    permiteAdicionales: true,
  },

  {
    id: "pide-roque",
    nombre: "Pide Roquefort",
    descripcion: "Roquefort intenso, muzzarella suave y masa crocante.",
    precio: 5000,
    imagen: "img/pides/roque.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-especial",
    nombre: "Pide Especial",
    descripcion: "Muzzarella, huevo, jamon, morrón y aceitunas sobre masa fina.",
    precio: 5500,
    imagen: "img/pides/especial.png",
    permiteAdicionales: true,
  },

  {
    id: "pide-3quesos",
    nombre: "Pide 3 Quesos",
    descripcion: "Muzzarella, cheddar y roquefort, la combinación ideal.",
    precio: 5500,
    imagen: "img/pides/3 quesos.png",
    permiteAdicionales: true,
  },

  {
    id: "pide-almendra-y-miel",
    nombre: "Pide Almendra Y Miel",
    descripcion: "Para los amantes de lo agridulce: Muzzarella, almendras tostadas y un toque de miel.",
    precio: 5500,
    imagen: "img/pides/almendraymiel.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-cheddar_panceta",
    nombre: "Pide Cheddar y Panceta",
    descripcion: "Cheddar fundido y panceta crocante en cada bocado.",
    precio: 6000,
    imagen: "img/pides/cheddar y panceta.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-roque-jamon",
    nombre: "Pide Roque y Jamón",
    descripcion: "Roquefort, jamón y muzzarella fundidos en cada bocado.",
    precio: 6000,
    imagen: "img/pides/roqueyjamon.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-anchoas",
    nombre: "Pide Anchoas",
    descripcion: "Muzzarella y filetes de anchoas.",
    precio: 6000,
    imagen: "img/pides/anchoas.jpg",
    permiteAdicionales: true,
  },

  {
    id: "pide-aceitunas-y-anchoas",
    nombre: "Pide Aceitunas y Anchoas",
    descripcion: "Muzzarella, aceitunas verdes y filetes de anchoas.",
    precio: 6500,
    imagen: "img/pides/anchoas_y_aceitunas.jpg",
    permiteAdicionales: true,
  }

  ],
  combos: [
    {
      id: "combo-1",
      nombre: "Combo Pides + Gaseosas",
      descripcion: "2 pides de jamon + 2 Gaseosas a elección 500ml",
      precio: 10500,
      precioOriginal: 12700,
      imagen: "img/combos/1.png",
      opciones: [
        {
          titulo: "Elegí tu 1ra Gaseosa",
          items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"]
        },
        {
          titulo: "Elegí tu 2da Gaseosa",
          items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"]
        }
      ]
    },

    {
      id: "combo-2",
      nombre: "Combo Pides + Cervezas",
      descripcion: "2 pides de jamon + 2 Cervezas a elección 473ml",
      precio: 11500,
      precioOriginal: 13700,
      imagen: "img/combos/2.png",
      opciones: [
        {
          titulo: "Elegí tu 1ra Cerveza",
          items: ["Quilmes 473ml", "Brahma 473ml", "Schneider 473ml"]
        },
        {
          titulo: "Elegí tu 2da Cerveza",
          items: ["Quilmes 473ml", "Brahma 473ml", "Schneider 473ml"]
        }
      ]
    },

    {
      id: "combo-3",
      nombre: "Combo Carlitos + Gaseosas",
      descripcion: "2 Carlitos jamon y queso + 2 Gaseosas a elección 500ml",
      precio: 13500,
      precioOriginal: 18000,
      imagen: "img/combos/3.jpg",
      opciones: [
        {
          titulo: "Elegí tu 1ra Gaseosa",
          items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"]
        },
        {
          titulo: "Elegí tu 2da Gaseosa",
          items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"]
        }
      ]
    },

    {
      id: "combo-4",
      nombre: "Combo Carlitos + Cervezas",
      descripcion: "2 Carlitos jamon y queso + 2 Cervezas a elección 473ml",
      precio: 14500,
      precioOriginal: 19000,
      imagen: "img/combos/4.jpg",
      opciones: [
        {
          titulo: "Elegí tu 1ra Cerveza",
          items: ["Quilmes 473ml", "Brahma 473ml", "Schneider 473ml"]
        },
        {
          titulo: "Elegí tu 2da Cerveza",
          items: ["Quilmes 473ml", "Brahma 473ml", "Schneider 473ml"]
        }
      ]
    },

  ],
  carlitos: [
      {
    id: "carlito-jyq",
    nombre: "Carlito Jamón y Queso",
    descripcion: "El clasico de siempre: jamón de primera calidad y mucho queso. Con salsa golf.",
    precio: 7000,
    imagen: "img/carlitos/jamon y queso.jpg",
    permiteAdicionales: true
  },

      {
    id: "carlito-salame",
    nombre: "Carlito Salame",
    descripcion: "Pan suave y dorado, con muzzarella fundida y rodajas de salame. Con salsa golf.",
    precio: 8000,
    imagen: "img/carlitos/salame.jpg",
    permiteAdicionales: true
  },

  {
    id: "carlito-especial",
    nombre: "Carlito Especial",
    descripcion: "El clasico reinventado: Jamón, queso, huevo, morrón, aceitunas y salsa golf. Una bomba.",
    precio: 8500,
    imagen: "img/carlitos/especial.jpg",
    permiteAdicionales: true
  }

  ],

  tostados: [
      {
    id: "tostado-jyq",
    nombre: "Tostado Jamón y Queso",
    descripcion: "El clasico de siempre: jamón de primera calidad y mucho queso. Con mayonesa.",
    precio: 7000,
    imagen: "img/carlitos/jamon y queso.jpg",
    permiteAdicionales: true
  },

      {
    id: "Tostado-salame",
    nombre: "Tostado Salame",
    descripcion: "Pan suave y dorado, con muzzarella fundida y rodajas de salame. Con Mayonesa",
    precio: 8000,
    imagen: "img/carlitos/salame.jpg",
    permiteAdicionales: true
  },

  {
    id: "tostado-especial",
    nombre: "Tostado Especial",
    descripcion: "El clasico reinventado: Jamón, queso, huevo, morrón, aceitunas y mayonesa. Una bomba.",
    precio: 8500,
    imagen: "img/carlitos/especial.jpg",
    permiteAdicionales: true
  }

  ],

  bebidas: [
  {
    id: "cocacola",
    nombre: "Coca-Cola 500ml",
    descripcion: "Gaseosa Coca-Cola de 500ml",
    precio: 2000,
    imagen: "img/bebidas/cocacola500.png"
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