const XLSX = require('xlsx');
const {filterToJSON} = require('../utils/filter.js')


//extraer y devolver un HTML desde el excel
const excelExtract = async (req = request, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No se cargó ningun archivo...');
        }

        //leer el archivo del buffer con XLSX
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

        //convertir la primera hoja a JSON
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const htmlData = XLSX.utils.sheet_to_html(worksheet)

        const styledHtml = `
             <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                ${htmlData}
            </body>
            </html>        
        `;     

        return res.send(
            styledHtml
        )
    } catch (error) {
        console.error('Error al procesar el archivo:', error)
        res.status(500).send('Error al procesar el archivo...')
    }
}


//devolver un json desde un excel con filtro de columnas 
const excelToJson = async( req, res ) =>{
    const workbook = XLSX.read( req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]

    const sheetData = workbook.Sheets[sheetName] //obtengo la hoja de calculo que necesito para el JSON

    //Convertir la hoja de calculo a JSON
    const jsonData = XLSX.utils.sheet_to_json(sheetData)

    try{
        const resultDataFilter = await filterToJSON(["Material","Texto breve de material", "Libre utilización", "Lote", "Almacén"], jsonData)

        return res.send(resultDataFilter)
    }catch( error ){
        console.log( error );
        res.status(500).json({message: 'Archivo No se a subido...'})
    }
}


//


//Devolver un JSON de los contactos en excel
const excelToJsonContact = async (req, res) =>{
    try{
        if(!req.file){
            return res.status(400).send('No se cargó ningun archivo...')
        }
        const workbook = XLSX.read(req.file.buffer, {type: 'buffer'}) // leer el archivo del buffer con XLSX
        const worksheet = workbook.Sheets[workbook.SheetNames[0]] // convertir la primera hoja a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        //validación de datps - nombre y su numero de telefono
        const resultDataFilter = await filterToJSON(["Almacén","Nombre","Numero","Supervisor"], jsonData);
        //se devuelve limpio, sin capos vacios
        const resultNoNull = resultDataFilter.filter((item) => {
            if(item.Nombre && item.Numero && item.Almacén) {
                return item
            }
        })

        return res.send(resultNoNull);

    }catch( error ){
        console.error('Error al procesar el archivo: ', error)
        res.status(500).send('Error al procesar el archivo...')
    }
}

module.exports = {
    excelExtract,
    excelToJson,
    excelToJsonContact
}