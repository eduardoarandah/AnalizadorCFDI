/**
 * Agrupaciones y sumas del resumen.
 * Se separa por tipo de comprobante porque las columnas que importan
 * son distintas en una factura y en un complemento de pago.
 */
import { CATALOGOS, descripcionCatalogo } from './catalogos.ts';
import type {
  CFDI, ConceptoAgrupado, DoctoRelacionadoAgrupado, GrupoResumen, Impuesto, ImpuestoAgrupado,
  ImpuestoLocal, ImpuestoLocalAgrupado, Pago, PagoPorMoneda, ResumenPagos, TotalPorMoneda, TotalPorParte
} from './types.ts';

/** Agrupa filas por una llave y acumula con la función indicada. */
function agrupar<F, G>(filas: F[], llave: (f: F) => string, inicial: (f: F) => G, acumular: (g: G, f: F) => void): G[] {
  const mapa: Record<string, G> = {};
  const orden: string[] = [];
  filas.forEach((f) => {
    const k = llave(f);
    if (!mapa[k]) {
      mapa[k] = inicial(f);
      orden.push(k);
    }
    acumular(mapa[k], f);
  });
  return orden.map((k) => mapa[k]);
}

/** Impuestos (traslados o retenciones) agrupados por impuesto, factor y tasa. */
function agruparImpuestos(filas: Impuesto[]): ImpuestoAgrupado[] {
  return agrupar<Impuesto, ImpuestoAgrupado>(
    filas,
    (f) => f.impuesto + '|' + f.tipoFactor + '|' + f.tasa,
    (f) => ({
      impuesto: f.impuesto,
      nombreImpuesto: CATALOGOS.Impuesto[f.impuesto] || f.impuesto,
      tipoFactor: f.tipoFactor,
      tasa: f.tasa,
      base: 0,
      importe: 0,
      veces: 0
    }),
    (g, f) => {
      g.base += f.base;
      g.importe += f.importe;
      g.veces += 1;
    }
  );
}

/** Todos los conceptos de varios CFDI, agrupados por producto/servicio. */
function agruparConceptos(cfdis: CFDI[]): ConceptoAgrupado[] {
  const filas: CFDI['conceptos'] = [];
  cfdis.forEach((c) => {
    c.conceptos.forEach((co) => {
      filas.push(co);
    });
  });
  return agrupar(
    filas,
    (f) => f.claveProdServ + '|' + f.noIdentificacion + '|' + f.descripcion + '|' + f.claveUnidad,
    (f): ConceptoAgrupado => ({
      claveProdServ: f.claveProdServ,
      noIdentificacion: f.noIdentificacion,
      descripcion: f.descripcion,
      claveUnidad: f.claveUnidad,
      unidad: f.unidad,
      cantidad: 0,
      importe: 0,
      descuento: 0,
      trasladados: 0,
      retenidos: 0,
      veces: 0
    }),
    (g, f) => {
      g.cantidad += f.cantidad;
      g.importe += f.importe;
      g.descuento += f.descuento;
      f.traslados.forEach((t) => { g.trasladados += t.importe; });
      f.retenciones.forEach((r) => { g.retenidos += r.importe; });
      g.veces += 1;
    }
  );
}

/** Suma por emisor o por receptor. */
function agruparPorParte(cfdis: CFDI[], cual: 'emisor' | 'receptor'): TotalPorParte[] {
  return agrupar(
    cfdis,
    (c) => c[cual].Rfc || '(sin RFC)',
    (c): TotalPorParte => ({
      rfc: c[cual].Rfc || '(sin RFC)',
      nombre: c[cual].Nombre || '',
      cantidad: 0,
      subTotal: 0,
      trasladados: 0,
      retenidos: 0,
      total: 0,
      pagado: 0
    }),
    (g, c) => {
      g.cantidad += 1;
      g.subTotal += c.subTotal;
      g.trasladados += c.totalTrasladados;
      g.retenidos += c.totalRetenidos;
      g.total += c.total;
      if (c.pagos) g.pagado += c.pagos.montoTotalPagos;
    }
  );
}

/** Totales del comprobante agrupados por moneda. */
function agruparTotales(cfdis: CFDI[]): TotalPorMoneda[] {
  return agrupar(
    cfdis,
    (c) => c.moneda || '(sin moneda)',
    (c): TotalPorMoneda => ({
      moneda: c.moneda || '(sin moneda)',
      cantidad: 0,
      subTotal: 0,
      descuento: 0,
      trasladados: 0,
      retenidos: 0,
      total: 0
    }),
    (g, c) => {
      g.cantidad += 1;
      g.subTotal += c.subTotal;
      g.descuento += c.descuento;
      g.trasladados += c.totalTrasladados;
      g.retenidos += c.totalRetenidos;
      g.total += c.total;
    }
  );
}

/** Resumen de los complementos de pago de un grupo de CFDI. */
function resumenPagos(cfdis: CFDI[]): ResumenPagos | null {
  const conPagos = cfdis.filter((c) => c.pagos);
  if (!conPagos.length) return null;
  const todosPagos: Pago[] = [];
  conPagos.forEach((c) => {
    c.pagos!.pagos.forEach((p) => todosPagos.push(p));
  });
  let traslados: Impuesto[] = [];
  let retenciones: Impuesto[] = [];
  todosPagos.forEach((p) => {
    traslados = traslados.concat(p.traslados);
    retenciones = retenciones.concat(p.retenciones);
  });
  return {
    numComprobantes: conPagos.length,
    numPagos: todosPagos.length,
    numDoctos: conPagos.reduce((s, c) => s + c.pagos!.numDoctos, 0),
    montoTotalPagos: conPagos.reduce((s, c) => s + c.pagos!.montoTotalPagos, 0),
    porMoneda: agrupar(
      todosPagos,
      (p) => (p.moneda || '(sin moneda)') + '|' + (p.formaDePagoP || ''),
      (p): PagoPorMoneda => ({
        moneda: p.moneda || '(sin moneda)',
        formaDePagoP: p.formaDePagoP || '',
        descripcionForma: descripcionCatalogo('FormaDePagoP', p.formaDePagoP),
        numPagos: 0,
        monto: 0
      }),
      (g, p) => {
        g.numPagos += 1;
        g.monto += p.monto;
      }
    ),
    traslados: agruparImpuestos(traslados),
    retenciones: agruparImpuestos(retenciones),
    doctos: agrupar(
      todosPagos.reduce<Pago['doctos']>((acc, p) => acc.concat(p.doctos), []),
      (d) => d.idDocumento,
      (d): DoctoRelacionadoAgrupado => ({
        idDocumento: d.idDocumento,
        serie: d.serie,
        folio: d.folio,
        moneda: d.moneda,
        parcialidades: 0,
        impPagado: 0,
        impSaldoInsoluto: d.impSaldoInsoluto
      }),
      (g, d) => {
        g.parcialidades += 1;
        g.impPagado += d.impPagado;
        g.impSaldoInsoluto = d.impSaldoInsoluto;
      }
    )
  };
}

/** Impuestos locales agrupados por nombre y tasa. */
function agruparLocales(filas: ImpuestoLocal[]): ImpuestoLocalAgrupado[] {
  return agrupar(
    filas,
    (f) => f.nombre + '|' + f.tasa,
    (f): ImpuestoLocalAgrupado => ({ nombre: f.nombre, tasa: f.tasa, veces: 0, importe: 0 }),
    (g, f) => {
      g.veces += 1;
      g.importe += f.importe;
    }
  );
}

/** Resumen completo, separado por tipo de comprobante. */
export function resumenGlobal(cfdis: CFDI[]): GrupoResumen[] {
  const tipos = agrupar(
    cfdis,
    (c) => c.tipo,
    (c) => ({ tipo: c.tipo, cfdis: [] as CFDI[] }),
    (g, c) => { g.cfdis.push(c); }
  );

  return tipos.map((g): GrupoResumen => {
    let traslados: Impuesto[] = [];
    let retenciones: Impuesto[] = [];
    let localesT: ImpuestoLocal[] = [];
    let localesR: ImpuestoLocal[] = [];
    g.cfdis.forEach((c) => {
      traslados = traslados.concat(c.impuestos.traslados);
      retenciones = retenciones.concat(c.impuestos.retenciones);
      localesT = localesT.concat(c.locales.traslados);
      localesR = localesR.concat(c.locales.retenciones);
    });
    return {
      tipo: g.tipo,
      nombreTipo: CATALOGOS.TipoDeComprobante[g.tipo] || 'Tipo ' + g.tipo,
      cfdis: g.cfdis,
      cantidad: g.cfdis.length,
      totales: agruparTotales(g.cfdis),
      traslados: agruparImpuestos(traslados),
      retenciones: agruparImpuestos(retenciones),
      localesTraslados: agruparLocales(localesT),
      localesRetenciones: agruparLocales(localesR),
      conceptos: agruparConceptos(g.cfdis),
      emisores: agruparPorParte(g.cfdis, 'emisor'),
      receptores: agruparPorParte(g.cfdis, 'receptor'),
      pagos: resumenPagos(g.cfdis)
    };
  });
}
