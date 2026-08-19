/** Nodo genérico del árbol del XML (nombre, atributos, hijos). */
export interface Nodo {
  nombre: string;
  local: string;
  atributos: { nombre: string; valor: string }[];
  hijos: Nodo[];
  texto: string;
}

export interface Impuesto {
  impuesto: string;
  tipoFactor: string;
  tasa: string;
  base: number;
  importe: number;
}

export interface ImpuestoAgrupado {
  impuesto: string;
  nombreImpuesto: string;
  tipoFactor: string;
  tasa: string;
  base: number;
  importe: number;
  veces: number;
}

export interface ImpuestoLocal {
  nombre: string;
  tasa: string;
  importe: number;
}

export interface ImpuestoLocalAgrupado {
  nombre: string;
  tasa: string;
  veces: number;
  importe: number;
}

export interface Concepto {
  nodo: Nodo;
  claveProdServ: string;
  noIdentificacion: string;
  descripcion: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  valorUnitario: number;
  importe: number;
  descuento: number;
  objetoImp: string;
  traslados: Impuesto[];
  retenciones: Impuesto[];
}

export interface ConceptoAgrupado {
  claveProdServ: string;
  noIdentificacion: string;
  descripcion: string;
  claveUnidad: string;
  unidad: string;
  cantidad: number;
  importe: number;
  descuento: number;
  trasladados: number;
  retenidos: number;
  veces: number;
}

export interface DoctoRelacionado {
  nodo: Nodo;
  idDocumento: string;
  serie: string;
  folio: string;
  moneda: string;
  numParcialidad: string;
  impSaldoAnt: number;
  impPagado: number;
  impSaldoInsoluto: number;
}

export interface DoctoRelacionadoAgrupado {
  idDocumento: string;
  serie: string;
  folio: string;
  moneda: string;
  parcialidades: number;
  impPagado: number;
  impSaldoInsoluto: number;
}

export interface Pago {
  nodo: Nodo;
  fechaPago: string;
  formaDePagoP: string;
  moneda: string;
  tipoCambio: string;
  monto: number;
  doctos: DoctoRelacionado[];
  traslados: Impuesto[];
  retenciones: Impuesto[];
}

export interface PagoPorMoneda {
  moneda: string;
  formaDePagoP: string;
  descripcionForma: string;
  numPagos: number;
  monto: number;
}

export interface ComplementoPagos {
  version: string;
  totales: Record<string, string>;
  pagos: Pago[];
  montoTotalPagos: number;
  numDoctos: number;
}

export interface ResumenPagos {
  numComprobantes: number;
  numPagos: number;
  numDoctos: number;
  montoTotalPagos: number;
  porMoneda: PagoPorMoneda[];
  traslados: ImpuestoAgrupado[];
  retenciones: ImpuestoAgrupado[];
  doctos: DoctoRelacionadoAgrupado[];
}

export interface CFDI {
  archivo: string;
  raiz: Nodo;
  comprobante: Record<string, string>;
  tipo: string;
  version: string;
  fecha: string;
  serie: string;
  folio: string;
  moneda: string;
  tipoCambio: string;
  formaPago: string;
  metodoPago: string;
  subTotal: number;
  descuento: number;
  total: number;
  uuid: string;
  fechaTimbrado: string;
  emisor: Record<string, string>;
  receptor: Record<string, string>;
  nodos: {
    emisor: Nodo | null;
    receptor: Nodo | null;
    conceptos: Nodo | null;
    impuestos: Nodo | null;
    complemento: Nodo | null;
  };
  conceptos: Concepto[];
  impuestos: { traslados: Impuesto[]; retenciones: Impuesto[] };
  totalTrasladados: number;
  totalRetenidos: number;
  locales: { traslados: ImpuestoLocal[]; retenciones: ImpuestoLocal[] };
  pagos: ComplementoPagos | null;
  desconocidos: string[];
}

export interface TotalPorMoneda {
  moneda: string;
  cantidad: number;
  subTotal: number;
  descuento: number;
  trasladados: number;
  retenidos: number;
  total: number;
}

export interface TotalPorParte {
  rfc: string;
  nombre: string;
  cantidad: number;
  subTotal: number;
  trasladados: number;
  retenidos: number;
  total: number;
  pagado: number;
}

export interface GrupoResumen {
  tipo: string;
  nombreTipo: string;
  cfdis: CFDI[];
  cantidad: number;
  totales: TotalPorMoneda[];
  traslados: ImpuestoAgrupado[];
  retenciones: ImpuestoAgrupado[];
  localesTraslados: ImpuestoLocalAgrupado[];
  localesRetenciones: ImpuestoLocalAgrupado[];
  conceptos: ConceptoAgrupado[];
  emisores: TotalPorParte[];
  receptores: TotalPorParte[];
  pagos: ResumenPagos | null;
}

/** Valor de celda que muestra un texto distinto al que se copia. */
export interface ValorConTexto {
  valor: string | number;
  texto: string;
}

export type ValorCelda = string | number | ValorConTexto | undefined;

export interface Columna {
  clave: string;
  titulo: string;
  tipo?: 'moneda' | 'cantidad';
  largo?: boolean;
  truncar?: boolean;
}

export interface ErrorArchivo {
  archivo: string;
  mensaje: string;
}
