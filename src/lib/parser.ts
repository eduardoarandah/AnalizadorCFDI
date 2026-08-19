/**
 * Lectura de XML del SAT.
 *
 * El XML se convierte en un árbol genérico (nombre, atributos, hijos) para
 * poder mostrarlo completo, y además se extraen los campos que se usan en el
 * resumen y en la lista.
 */
import { SET_ELEMENTOS_CONOCIDOS } from './catalogos.ts';
import type { CFDI, Concepto, DoctoRelacionado, Impuesto, ImpuestoLocal, Nodo, Pago } from './types.ts';

function num(v: string | undefined): number {
  const n = parseFloat(v ?? '');
  return isNaN(n) ? 0 : n;
}

/** Convierte un elemento del DOM en un nodo genérico. */
function nodoDesdeElemento(el: Element): Nodo {
  const atributos: { nombre: string; valor: string }[] = [];
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    // los namespaces no son datos de la factura
    if (a.name === 'xmlns' || a.name.indexOf('xmlns:') === 0) continue;
    atributos.push({ nombre: a.localName || a.name, valor: a.value });
  }
  const hijos: Nodo[] = [];
  for (let j = 0; j < el.childNodes.length; j++) {
    const c = el.childNodes[j];
    if (c.nodeType === 1) hijos.push(nodoDesdeElemento(c as Element));
  }
  let texto = '';
  if (!hijos.length && el.textContent && el.textContent.trim()) {
    texto = el.textContent.trim();
  }
  return {
    nombre: el.nodeName,
    local: el.localName || el.nodeName.replace(/^.*:/, ''),
    atributos,
    hijos,
    texto
  };
}

/** Mapa nombre -> valor de los atributos de un nodo. */
function attrs(nodo: Nodo | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!nodo) return out;
  nodo.atributos.forEach((a) => {
    out[a.nombre] = a.valor;
  });
  return out;
}

/** Primer hijo con ese nombre local. */
function hijo(nodo: Nodo | null, local: string): Nodo | null {
  if (!nodo) return null;
  for (let i = 0; i < nodo.hijos.length; i++) {
    if (nodo.hijos[i].local === local) return nodo.hijos[i];
  }
  return null;
}

/** Todos los hijos con ese nombre local. */
function hijos(nodo: Nodo | null, local: string): Nodo[] {
  if (!nodo) return [];
  return nodo.hijos.filter((h) => h.local === local);
}

/** Busca en profundidad todos los descendientes con ese nombre local. */
function descendientes(nodo: Nodo | null, local: string, acc: Nodo[] = []): Nodo[] {
  if (!nodo) return acc;
  nodo.hijos.forEach((h) => {
    if (h.local === local) acc.push(h);
    descendientes(h, local, acc);
  });
  return acc;
}

/** Lista de nombres de elementos que no están en el catálogo conocido. */
function buscarDesconocidos(nodo: Nodo, ruta = '', acc: string[] = []): string[] {
  const aqui = ruta ? ruta + ' › ' + nodo.nombre : nodo.nombre;
  if (!SET_ELEMENTOS_CONOCIDOS[nodo.local] && acc.indexOf(aqui) === -1) {
    acc.push(aqui);
  }
  nodo.hijos.forEach((h) => {
    buscarDesconocidos(h, aqui, acc);
  });
  return acc;
}

/** Traslados/Retenciones de un nodo cfdi:Impuestos (o de un concepto). */
function leerImpuestos(nodoImpuestos: Nodo | null): { traslados: Impuesto[]; retenciones: Impuesto[] } {
  const res: { traslados: Impuesto[]; retenciones: Impuesto[] } = { traslados: [], retenciones: [] };
  if (!nodoImpuestos) return res;
  hijos(nodoImpuestos, 'Traslados').forEach((g) => {
    hijos(g, 'Traslado').forEach((t) => {
      const a = attrs(t);
      res.traslados.push({
        impuesto: a.Impuesto || '',
        tipoFactor: a.TipoFactor || '',
        tasa: a.TasaOCuota || '',
        base: num(a.Base),
        importe: num(a.Importe)
      });
    });
  });
  hijos(nodoImpuestos, 'Retenciones').forEach((g) => {
    hijos(g, 'Retencion').forEach((r) => {
      const a = attrs(r);
      res.retenciones.push({
        impuesto: a.Impuesto || '',
        tipoFactor: a.TipoFactor || '',
        tasa: a.TasaOCuota || '',
        base: num(a.Base),
        importe: num(a.Importe)
      });
    });
  });
  return res;
}

/** Impuestos de un complemento de pago (pago20:ImpuestosP). */
function leerImpuestosP(nodoPago: Nodo | null): { traslados: Impuesto[]; retenciones: Impuesto[] } {
  const res: { traslados: Impuesto[]; retenciones: Impuesto[] } = { traslados: [], retenciones: [] };
  hijos(nodoPago, 'ImpuestosP').forEach((imp) => {
    hijos(imp, 'TrasladosP').forEach((g) => {
      hijos(g, 'TrasladoP').forEach((t) => {
        const a = attrs(t);
        res.traslados.push({
          impuesto: a.ImpuestoP || '',
          tipoFactor: a.TipoFactorP || '',
          tasa: a.TasaOCuotaP || '',
          base: num(a.BaseP),
          importe: num(a.ImporteP)
        });
      });
    });
    hijos(imp, 'RetencionesP').forEach((g) => {
      hijos(g, 'RetencionP').forEach((r) => {
        const a = attrs(r);
        res.retenciones.push({
          impuesto: a.ImpuestoP || '',
          tipoFactor: a.TipoFactorP || '',
          tasa: a.TasaOCuotaP || '',
          base: num(a.BaseP),
          importe: num(a.ImporteP)
        });
      });
    });
  });
  return res;
}

/**
 * Lee el texto de un XML y devuelve el CFDI listo para mostrar.
 * Lanza una excepción con un mensaje en español si el archivo no sirve.
 */
export function parsearCFDI(texto: string, archivo: string): CFDI {
  const doc = new DOMParser().parseFromString(texto, 'text/xml');
  const errorParseo = doc.getElementsByTagName('parsererror')[0];
  if (errorParseo) throw new Error('El archivo no es un XML válido');

  const raizEl = doc.documentElement;
  if (!raizEl) throw new Error('El archivo está vacío');
  const localRaiz = raizEl.localName || raizEl.nodeName.replace(/^.*:/, '');
  if (localRaiz !== 'Comprobante') {
    throw new Error('No es un CFDI: el elemento raíz es ' + raizEl.nodeName);
  }

  const raiz = nodoDesdeElemento(raizEl);
  const c = attrs(raiz);

  const nEmisor = hijo(raiz, 'Emisor');
  const nReceptor = hijo(raiz, 'Receptor');
  const nConceptos = hijo(raiz, 'Conceptos');
  const nImpuestos = hijo(raiz, 'Impuestos');
  const nComplemento = hijo(raiz, 'Complemento');
  const nTimbre = nComplemento ? hijo(nComplemento, 'TimbreFiscalDigital') : null;
  const nPagos = nComplemento ? hijo(nComplemento, 'Pagos') : null;

  const emisor = attrs(nEmisor);
  const receptor = attrs(nReceptor);

  // conceptos
  const conceptos: Concepto[] = hijos(nConceptos, 'Concepto').map((n) => {
    const a = attrs(n);
    const imp = leerImpuestos(hijo(n, 'Impuestos'));
    return {
      nodo: n,
      claveProdServ: a.ClaveProdServ || '',
      noIdentificacion: a.NoIdentificacion || '',
      descripcion: a.Descripcion || '',
      cantidad: num(a.Cantidad),
      claveUnidad: a.ClaveUnidad || '',
      unidad: a.Unidad || '',
      valorUnitario: num(a.ValorUnitario),
      importe: num(a.Importe),
      descuento: num(a.Descuento),
      objetoImp: a.ObjetoImp || '',
      traslados: imp.traslados,
      retenciones: imp.retenciones
    };
  });

  // impuestos del comprobante; si no vienen, se suman los de los conceptos
  const impuestos = leerImpuestos(nImpuestos);
  const ai = attrs(nImpuestos);
  if (!impuestos.traslados.length && !impuestos.retenciones.length) {
    conceptos.forEach((co) => {
      impuestos.traslados = impuestos.traslados.concat(co.traslados);
      impuestos.retenciones = impuestos.retenciones.concat(co.retenciones);
    });
  }
  const sumaImporte = (arr: Impuesto[]) => arr.reduce((s, x) => s + x.importe, 0);
  const totalTrasladados = nImpuestos && ai.TotalImpuestosTrasladados !== undefined
    ? num(ai.TotalImpuestosTrasladados)
    : sumaImporte(impuestos.traslados);
  const totalRetenidos = nImpuestos && ai.TotalImpuestosRetenidos !== undefined
    ? num(ai.TotalImpuestosRetenidos)
    : sumaImporte(impuestos.retenciones);

  // complemento de pagos
  let pagos: CFDI['pagos'] = null;
  if (nPagos) {
    const totales = attrs(hijo(nPagos, 'Totales'));
    const listaPagos: Pago[] = hijos(nPagos, 'Pago').map((p) => {
      const ap = attrs(p);
      const impP = leerImpuestosP(p);
      const doctos: DoctoRelacionado[] = hijos(p, 'DoctoRelacionado').map((d) => {
        const ad = attrs(d);
        return {
          nodo: d,
          idDocumento: ad.IdDocumento || '',
          serie: ad.Serie || '',
          folio: ad.Folio || '',
          moneda: ad.MonedaDR || '',
          numParcialidad: ad.NumParcialidad || '',
          impSaldoAnt: num(ad.ImpSaldoAnt),
          impPagado: num(ad.ImpPagado),
          impSaldoInsoluto: num(ad.ImpSaldoInsoluto)
        };
      });
      return {
        nodo: p,
        fechaPago: ap.FechaPago || '',
        formaDePagoP: ap.FormaDePagoP || '',
        moneda: ap.MonedaP || '',
        tipoCambio: ap.TipoCambioP || '',
        monto: num(ap.Monto),
        doctos,
        traslados: impP.traslados,
        retenciones: impP.retenciones
      };
    });
    pagos = {
      version: attrs(nPagos).Version || '',
      totales,
      pagos: listaPagos,
      montoTotalPagos: totales.MontoTotalPagos !== undefined
        ? num(totales.MontoTotalPagos)
        : listaPagos.reduce((s, p) => s + p.monto, 0),
      numDoctos: listaPagos.reduce((s, p) => s + p.doctos.length, 0)
    };
  }

  // impuestos locales (complemento implocal)
  const locales: { traslados: ImpuestoLocal[]; retenciones: ImpuestoLocal[] } = { traslados: [], retenciones: [] };
  descendientes(raiz, 'ImpuestosLocales').forEach((nl) => {
    hijos(nl, 'TrasladosLocales').forEach((t) => {
      const a = attrs(t);
      locales.traslados.push({
        nombre: a.ImpLocTrasladado || '',
        tasa: a.TasadeTraslado || '',
        importe: num(a.Importe)
      });
    });
    hijos(nl, 'RetencionesLocales').forEach((r) => {
      const a = attrs(r);
      locales.retenciones.push({
        nombre: a.ImpLocRetenido || '',
        tasa: a.TasadeRetencion || '',
        importe: num(a.Importe)
      });
    });
  });

  const timbre = attrs(nTimbre);

  return {
    archivo,
    raiz,
    comprobante: c,
    tipo: c.TipoDeComprobante || '?',
    version: c.Version || '',
    fecha: (c.Fecha || '').replace('T', ' '),
    serie: c.Serie || '',
    folio: c.Folio || '',
    moneda: c.Moneda || '',
    tipoCambio: c.TipoCambio || '',
    formaPago: c.FormaPago || '',
    metodoPago: c.MetodoPago || '',
    subTotal: num(c.SubTotal),
    descuento: num(c.Descuento),
    total: num(c.Total),
    uuid: (timbre.UUID || '').toUpperCase(),
    fechaTimbrado: (timbre.FechaTimbrado || '').replace('T', ' '),
    emisor,
    receptor,
    nodos: {
      emisor: nEmisor,
      receptor: nReceptor,
      conceptos: nConceptos,
      impuestos: nImpuestos,
      complemento: nComplemento
    },
    conceptos,
    impuestos,
    totalTrasladados,
    totalRetenidos,
    locales,
    pagos,
    desconocidos: buscarDesconocidos(raiz)
  };
}
