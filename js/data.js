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
      nombre: "polimardo?",
      descripcion: "buenardopolis",
      precio: 5000,
      imagen: "img/logo_claro.png"
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
  bebidas: []
};

export default productos;