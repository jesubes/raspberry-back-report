const { default: puppeteer } = require('puppeteer');
const XLSX = require('xlsx')

//de un json lo convertimos en images y lo retorna
const jsonToImage = async (jsonData, phone) => {

    // ordenar de forma ascendente
    const sortedJsonData = jsonData.sort((a, b) =>
        a['Texto breve de material'].localeCompare(b['Texto breve de material'])
    )
    
    //hay que tener en cuenta que es un array de objeto para crear una hoja de calculo de excel
    const newWorkSheet = XLSX.utils.json_to_sheet(sortedJsonData)

    //convertir a html
    const tableHtml = XLSX.utils.sheet_to_html(newWorkSheet)

    //dar Estilo a la tabla
    const styledHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charaset="UTF-8">
            <style>
                table{
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
            ${tableHtml}
        </body>
        <body>
    `;


    //convertir estilo a image
    const browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const pageOj = await browser.newPage();
    await pageOj.setContent(styledHtml);

    //dimensiones
    const rowHeight = 20; //20px por fila
    const totalHeight = Math.min(rowHeight * jsonData.length, 1200);


    await pageOj.setViewport({
        width: 900,
        height: totalHeight
    })

    const jpgFilePath = `./reportImage/materiales${phone}.jpg`

    try{
        await pageOj.screenshot({path: jpgFilePath, fullPage: true})
        await browser.close();

        return true;
    }catch( error ){
        console.error('Error al convertir a Imagen el JSON: ', error)

        return false;
    }
}

module.exports = {
    jsonToImage
}