const fs = require('fs');

// Ruta de los archivos CSV
const productFile = 'product.csv';
const sizeFile = 'size-1.csv';
const stockFile = 'stock.csv';

// Función para leer el archivo CSV y obtener los datos
const readCsvFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const headers = lines[0].split(',');

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(',');

    if (line.length === headers.length) {
      const row = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = line[j].trim();
      }

      data.push(row);
    }
  }

  return data;
};

// Leer los archivos CSV
console.log('Leyendo archivo product.csv...');
const productData = readCsvFile(productFile);
console.log('Datos del archivo product.csv:');
console.table(productData);

console.log('Leyendo archivo size-1.csv...');
const sizeData = readCsvFile(sizeFile);
console.log('Datos del archivo size-1.csv:');
console.table(sizeData);

console.log('Leyendo archivo stock.csv...');
const stockData = readCsvFile(stockFile);
console.log('Datos del archivo stock.csv:');
console.table(stockData);

// Procesar los datos y determinar la visibilidad de los productos
const visibleProductIds = [];

for (const product of productData) {
  const productId = parseInt(product.id);
  const sequence = parseInt(product.sequence);
  let isVisible = false;

  for (const size of sizeData) {
    if (parseInt(size.productId) === productId) {
      if (size.backSoon === 'true') {
        isVisible = true;
        break;
      } else if (size.special === 'true') {
        const stock = stockData.find((s) => s.sizeId === size.id);
        if (stock && parseInt(stock.quantity) > 0) {
          isVisible = true;
          break;
        }
      } else {
        const stock = stockData.find((s) => s.sizeId === size.id);
        if (stock && parseInt(stock.quantity) > 0) {
          const hasSpecialSize = sizeData.some(
            (s) => s.productId === size.productId && s.special === 'true'
          );
          if (hasSpecialSize) {
            isVisible = true;
            break;
          }
        }
      }
    }
  }

  if (isVisible) {
    visibleProductIds.push(productId);
  }
}

// Ordenar los identificadores de producto por la secuencia y generar la salida
const output = visibleProductIds
  .sort((a, b) => {
    const productA = productData.find((p) => parseInt(p.id) === a);
    const productB = productData.find((p) => parseInt(p.id) === b);
    return parseInt(productA.sequence) - parseInt(productB.sequence);
  })
  .join(',');

console.log('Salida:');
console.log(output);
