function cargarXML(theFile) {
  return function(e) {
    console.log('importando ' + theFile.name);
    try {
      //minusculas y reemplazar cfdi
      var contenido = e.target.result
        .toUpperCase()
        .replace(/<\?.+\?>/g, '')
        .replace(/CFDI:/g, '')
        .replace(/\n/g, '')
        .replace(/\>\s+\</g, '><');
      // console.log(contenido);
      // x=contenido;
      //comprobante es el primer tag
      var comprobante = $(contenido)[0];
      emisor = $(comprobante).children('EMISOR')[0];
      var out = {
        archivo: theFile.name,
        fecha: comprobante.attributes['FECHA'].value.replace(/T.+/g, ''),
        rfc: emisor.attributes['RFC'].value,
        nombre: emisor.attributes['NOMBRE'].value,
        conceptos: [],
        total: 0,
        totalimpuestostrasladados: 0,
      };
      if ($(comprobante).children('IMPUESTOS')[0]) {
        out.totalimpuestostrasladados = parseFloat(
          $(comprobante).children('IMPUESTOS')[0].attributes[
            'TOTALIMPUESTOSTRASLADADOS'
          ].value
        );
      }
      var conceptos = $(comprobante)
        .children('CONCEPTOS')
        .children('CONCEPTO');
      conceptos.each(function(i) {
        concepto = conceptos[i];
        //obtener los atributos
        var cantidad = parseInt($(concepto).attr('CANTIDAD'));
        var descripcion = $(concepto).attr('DESCRIPCION');
        var importe = parseFloat($(concepto).attr('IMPORTE'));

        // iteramos en los traslados
        var traslados = [];
        var impuestos = $(concepto)
          .children('IMPUESTOS')
          .children('TRASLADOS')
          .children('TRASLADO');

        impuestos.each(function(i) {
          impuesto = impuestos[i];
          var tasa = $(impuesto).attr('TASAOCUOTA');
          var tipo = $(impuesto).attr('TIPOFACTOR');
          traslados.push({
            tasa: tasa,
            tipo: tipo,
          });
        });

        //asignar al objeto
        out.conceptos.push({
          cantidad: cantidad,
          descripcion: descripcion,
          importe: importe,
          traslados: traslados,
        });
      });
      app.agregar(out);
    } catch (e) {
      app.errores.push({
        archivo: theFile.name,
        mensaje: e.message,
      });
    }
  };
}
