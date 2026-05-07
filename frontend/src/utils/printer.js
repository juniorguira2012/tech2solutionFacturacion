export const imprimirTicket = (venta, items) => {
  const ventanaImpresion = window.open('', '_blank');
  
  const esCierre = venta.esCierre || venta.cliente === "REPORTE DE CIERRE";
  const tituloTicket = esCierre ? "RESUMEN DE CIERRE" : "POSfactura RD";
  const subtituloTicket = esCierre ? "SOLUCIONES TECNOLOGICAS" : "VENTAS GENERALES";

  // --- LÓGICA DE ITBIS DINÁMICO ---
  // Prioridad 1: venta.itbisGlobal (el que pasamos ahora)
  // Prioridad 2: El del localStorage
  // Prioridad 3: 18 (emergencia)
  const itbisGlobal = venta.itbisGlobal || Number(localStorage.getItem('posfactura_itbis')) || 18;
  
  // El subtotal y el monto de ITBIS ya vienen calculados de la pantalla de ventas
  const subtotal = venta.subtotal || (venta.total / (1 + itbisGlobal / 100));
  const montoItbis = venta.itbis || (venta.total - subtotal);

  const contenidoTicket = `
    <html>
      <head>
        <title>Ticket POSfactura</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 260px; 
            margin: 0; 
            padding: 15px; 
            font-size: 11px; 
            line-height: 1.2;
            color: #000;
          }
          .header { text-align: center; margin-bottom: 10px; }
          .title { font-size: 16px; font-weight: 900; text-transform: uppercase; }
          .bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
          .sep { border-bottom: 1px dashed #000; margin: 8px 0; }
          .text-right { text-align: right; }
          table { width: 100%; border-collapse: collapse; }
          .footer { text-align: center; margin-top: 15px; font-size: 9px; border-top: 1px dashed #000; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${tituloTicket}</div>
          <div class="bold">${subtituloTicket}</div>
          <div>SANTO DOMINGO, RD</div>
        </div>
        
        <div class="info">
          <div class="flex"><span>FECHA: ${new Date(venta.fecha).toLocaleDateString() || new Date().toLocaleDateString()}</span></div>
          <div class="bold">FACTURA: #ORD-${venta.id ? venta.id.toString().slice(-6).toUpperCase() : 'NUEVA'}</div>
          <div class="bold uppercase">CLIENTE: ${venta.cliente}</div>
        </div>

        <div class="sep"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th align="left">DESC.</th>
              <th class="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td colspan="2" style="padding-top: 4px;" class="bold uppercase">${item.nombre}</td>
              </tr>
              <tr>
                <td style="font-size: 10px;">
                  ${item.cantidad} x RD$${Number(item.precio || 0).toFixed(2)}
                </td>
                <td class="text-right">
                  RD$${(Number(item.precio || 0) * item.cantidad).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="sep"></div>

        <div class="totales">
          <div class="flex"><span>SUB-TOTAL:</span> <span>RD$ ${subtotal.toFixed(2)}</span></div>
          <div class="flex"><span>ITBIS (${itbisGlobal}%):</span> <span>RD$ ${montoItbis.toFixed(2)}</span></div>
          ${venta.descuento > 0 ? `<div class="flex"><span>DESC.:</span> <span>- RD$ ${venta.descuento.toFixed(2)}</span></div>` : ''}
          <div class="sep"></div>
          <div class="flex bold" style="font-size: 14px;">
            <span>TOTAL:</span>
            <span>RD$ ${venta.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p class="bold uppercase">¡GRACIAS POR SU COMPRA!</p>
          <p>POSfactura v3.0</p>
        </div>

        <script>
          window.onload = function() { 
            window.print(); 
            setTimeout(() => { window.close(); }, 300);
          }
        </script>
      </body>
    </html>
  `;

  ventanaImpresion.document.write(contenidoTicket);
  ventanaImpresion.document.close();
};