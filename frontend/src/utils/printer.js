export const imprimirTicket = (venta, carrito, companyData = {}, papelSize = '80mm') => {
  // Crear una nueva ventana o iframe para la impresión
  const printWindow = window.open('', '_blank');

  const isA4 = papelSize === 'A4';
  const is58mm = papelSize === '58mm';
  const width = isA4 ? '210mm' : papelSize;
  const fontSize = isA4 ? '14px' : (is58mm ? '9px' : '11px');

  printWindow.document.write(`
    <html>
    <head>
      <title>Factura #${venta.id}</title>
      <style>
        body {
          font-family: 'monospace', 'Courier New', Courier, monospace;
          font-size: ${fontSize};
          width: ${width};
          margin: 0 auto;
          padding: ${isA4 ? '20mm' : '2mm'};
          box-sizing: border-box;
          color: #000;
        }
        .header, .footer {
          text-align: center;
          margin-bottom: 10px;
        }
        .header h1 {
          font-size: ${isA4 ? '24px' : '16px'};
          margin: 0;
          text-transform: uppercase;
        }
        .header p, .footer p {
          margin: 1px 0;
        }
        .details, .items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .details th, .details td, .items th, .items td {
          padding: 4px 2px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .items th {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          text-transform: uppercase;
          font-size: ${isA4 ? '12px' : '9px'};
        }
        /* Alineación para cantidad (más a la izquierda/centrado) */
        .items td:nth-child(2),
        .items th:nth-child(2) {
          text-align: center;
        }
        /* Alineación a la derecha para precios */
        .items td:nth-child(3), 
        .items td:nth-child(4),
        .items th:nth-child(3),
        .items th:nth-child(4) {
          text-align: right;
        }
        .totals {
          border-top: 1px solid #000;
          padding-top: 5px;
          width: 100%;
        }
        .totals div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .totals strong {
          font-size: ${isA4 ? '18px' : '13px'};
          border-top: 1px double #000;
          padding-top: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${companyData.nombre || 'Tech2Solution'}</h1>
        <p>${companyData.rnc ? `RNC: ${companyData.rnc}` : ''}</p>
        <p>${companyData.direccion || ''}</p>
        <p>${companyData.telefono || ''}</p>
        <p>Fecha: ${new Date(venta.createdAt || venta.fecha).toLocaleString('es-DO')}</p>
        <p>Ticket #: ${String(venta.id).padStart(6, '0')}</p>
        <p>Cajero: ${venta.vendedorNombre || 'N/A'}</p>
        <p>Cliente: ${venta.cliente || 'Consumidor Final'}</p>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${carrito.map(item => `
            <tr>
              <td style="max-width: ${is58mm ? '80px' : 'auto'}; overflow: hidden;">${item.nombre}</td>
              <td>${item.cantidad}</td>
              <td>${Number(item.precio).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${(Number(item.cantidad) * Number(item.precio)).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div><span>Subtotal:</span><span>RD$ ${Number(venta.subtotal).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        ${Number(venta.descuento) > 0 ? `<div><span>Descuento:</span><span>- RD$ ${Number(venta.descuento).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>` : ''}
        <div><span>ITBIS:</span><span>RD$ ${Number(venta.itbis).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div><strong>Total:</strong><strong>RD$ ${Number(venta.total).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      </div>

      <div class="footer">
        <p>${companyData.mensaje || '¡Gracias por su compra!'}</p>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};