

//filtrar datos con campos necesarios
const filterToJSON = (arrayFilter = [], jsonDataTofilter) =>{
    let filterColumn = [];
    console.log('filter', arrayFilter);

    filterColumn = jsonDataTofilter.map(item => {
        const filteredItem = {};
        arrayFilter.forEach( key => {
            if(item[key] !== undefined) {
                filteredItem[key] = item[key];
            }
        });
        return filteredItem;
    });
    return filterColumn;
}

module.exports = {
    filterToJSON
}