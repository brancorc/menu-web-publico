/**
 * @file api.js
 * @description Centraliza las peticiones a la API de Comanda Central.
 */

const API_URL = 'https://comanda-central-backend.onrender.com';

/**
 * Realiza una petición GET a un endpoint específico de la API.
 * @param {string} endpoint - El endpoint de la API (ej: '/api/productos').
 * @returns {Promise<Object|null>} Los datos en formato JSON o null si hay un error.
 */
export async function apiFetch(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al cargar datos desde ${endpoint}:`, error);
        // Podrías mostrar un mensaje de error global aquí si quisieras.
        return null; // Devuelve null para que el código que llama pueda manejar el fallo.
    }
}