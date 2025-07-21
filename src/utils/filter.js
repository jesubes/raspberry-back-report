
// =======================================================================================
//                                  UTILIDAD DE FILTRADO DE JSON
// =======================================================================================

/**
 * Filtra un array de objetos JSON para quedarse únicamente con las claves (propiedades) especificadas.
 * @param {string[]} arrayFilter - Un array de strings con los nombres de las claves a conservar.
 * @param {object[]} jsonDataToFilter - El array de objetos JSON que se va a filtrar.
 * @returns {object[]} Un nuevo array de objetos, donde cada objeto solo contiene las claves deseadas.
 */
const filterToJSON = (arrayFilter = [], jsonDataToFilter) => {
    // Usamos .map() para transformar cada objeto del array original en un nuevo objeto.
    return jsonDataToFilter.map(item => {
        // Creamos un objeto vacío que contendrá el resultado filtrado para este ítem.
        const filteredItem = {};
        // Iteramos sobre el array de claves que queremos conservar.
        arrayFilter.forEach(key => {
            // Verificamos si el objeto original (item) tiene la clave actual (key) y no es undefined.
            if (item[key] !== undefined) {
                // Si la clave existe, la añadimos al nuevo objeto filtrado.
                filteredItem[key] = item[key];
            }
        });
        // Devolvemos el objeto ya filtrado.
        return filteredItem;
    });
};

// Exportamos la función para que pueda ser utilizada por los controladores.
module.exports = {
    filterToJSON
};