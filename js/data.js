// ==========================================================================
// ARCHIVO DE CONFIGURACIÓN DE COMPORTAMIENTO
// ==========================================================================

// --- 1. LISTA DE ADICIONALES DISPONIBLES ---
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


// --- 2. MAPA DE COMPORTAMIENTO DE PRODUCTOS ---
// Aquí vinculamos los IDs de los productos de Comanda Central con sus
// características especiales (si permiten adicionales o si tienen opciones de combo).
export const productBehaviors = {
    // Pides
    '1': { permiteAdicionales: true },
    '2': { permiteAdicionales: true },
    '3': { permiteAdicionales: true },
    '4': { permiteAdicionales: true },
    '5': { permiteAdicionales: true },
    '6': { permiteAdicionales: true },
    '7': { permiteAdicionales: true },
    '8': { permiteAdicionales: true },
    '9': { permiteAdicionales: true },
    '10': { permiteAdicionales: true },
    '11': { permiteAdicionales: true },
    '27': { permiteAdicionales: true },
    '28': { permiteAdicionales: true },
    '30': { permiteAdicionales: true },
    '31': { permiteAdicionales: true },

    // Carlitos
    '22': { permiteAdicionales: true },
    '23': { permiteAdicionales: true },
    '29': { permiteAdicionales: true },

    // Tostados
    '34': { permiteAdicionales: true },
    '35': { permiteAdicionales: true },
    '36': { permiteAdicionales: true },

    // Combo Especial
    '33': {
        opciones: [
            { titulo: "Elegí tu 1ra Gaseosa", items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"] },
            { titulo: "Elegí tu 2da Gaseosa", items: ["Coca-Cola 500ml", "Fanta 500ml", "Sprite 500ml"] }
        ]
    }
};
