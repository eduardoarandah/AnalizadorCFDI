/**
 * Catálogos del SAT (CFDI 4.0) y nombres de elementos conocidos.
 * Se usan para mostrar la descripción junto al código y para detectar
 * elementos del XML que el analizador no reconoce.
 */
export const CATALOGOS: Record<string, Record<string, string>> = {
  TipoDeComprobante: {
    I: 'Ingreso',
    E: 'Egreso',
    T: 'Traslado',
    N: 'Nómina',
    P: 'Pago'
  },
  Exportacion: {
    '01': 'No aplica',
    '02': 'Definitiva con clave A1',
    '03': 'Temporal',
    '04': 'Definitiva con clave distinta a A1'
  },
  MetodoPago: {
    PUE: 'Pago en una sola exhibición',
    PPD: 'Pago en parcialidades o diferido'
  },
  FormaPago: {
    '01': 'Efectivo',
    '02': 'Cheque nominativo',
    '03': 'Transferencia electrónica de fondos',
    '04': 'Tarjeta de crédito',
    '05': 'Monedero electrónico',
    '06': 'Dinero electrónico',
    '08': 'Vales de despensa',
    '12': 'Dación en pago',
    '13': 'Pago por subrogación',
    '14': 'Pago por consignación',
    '15': 'Condonación',
    '17': 'Compensación',
    '23': 'Novación',
    '24': 'Confusión',
    '25': 'Remisión de deuda',
    '26': 'Prescripción o caducidad',
    '27': 'A satisfacción del acreedor',
    '28': 'Tarjeta de débito',
    '29': 'Tarjeta de servicios',
    '30': 'Aplicación de anticipos',
    '31': 'Intermediario pagos',
    '99': 'Por definir'
  },
  UsoCFDI: {
    G01: 'Adquisición de mercancías',
    G02: 'Devoluciones, descuentos o bonificaciones',
    G03: 'Gastos en general',
    I01: 'Construcciones',
    I02: 'Mobiliario y equipo de oficina por inversiones',
    I03: 'Equipo de transporte',
    I04: 'Equipo de cómputo y accesorios',
    I05: 'Dados, troqueles, moldes, matrices y herramental',
    I06: 'Comunicaciones telefónicas',
    I07: 'Comunicaciones satelitales',
    I08: 'Otra maquinaria y equipo',
    D01: 'Honorarios médicos, dentales y gastos hospitalarios',
    D02: 'Gastos médicos por incapacidad o discapacidad',
    D03: 'Gastos funerales',
    D04: 'Donativos',
    D05: 'Intereses reales efectivamente pagados por créditos hipotecarios',
    D06: 'Aportaciones voluntarias al SAR',
    D07: 'Primas por seguros de gastos médicos',
    D08: 'Gastos de transportación escolar obligatoria',
    D09: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
    D10: 'Pagos por servicios educativos (colegiaturas)',
    S01: 'Sin efectos fiscales',
    CP01: 'Pagos',
    CN01: 'Nómina',
    P01: 'Por definir'
  },
  RegimenFiscal: {
    '601': 'General de Ley Personas Morales',
    '603': 'Personas Morales con Fines no Lucrativos',
    '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    '606': 'Arrendamiento',
    '607': 'Régimen de Enajenación o Adquisición de Bienes',
    '608': 'Demás ingresos',
    '609': 'Consolidación',
    '610': 'Residentes en el Extranjero sin Establecimiento Permanente en México',
    '611': 'Ingresos por Dividendos (socios y accionistas)',
    '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
    '614': 'Ingresos por intereses',
    '615': 'Régimen de los ingresos por obtención de premios',
    '616': 'Sin obligaciones fiscales',
    '620': 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
    '621': 'Incorporación Fiscal',
    '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    '623': 'Opcional para Grupos de Sociedades',
    '624': 'Coordinados',
    '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    '626': 'Régimen Simplificado de Confianza'
  },
  ObjetoImp: {
    '01': 'No objeto de impuesto',
    '02': 'Sí objeto de impuesto',
    '03': 'Sí objeto del impuesto y no obligado al desglose',
    '04': 'Sí objeto del impuesto y no causa impuesto',
    '05': 'Sí objeto, IVA crédito PODEBI',
    '06': 'Sí objeto, IVA actos no objeto',
    '07': 'No traslado del IVA, sí desglose IEPS'
  },
  Impuesto: {
    '001': 'ISR',
    '002': 'IVA',
    '003': 'IEPS'
  },
  TipoFactor: {
    Tasa: 'Tasa',
    Cuota: 'Cuota',
    Exento: 'Exento'
  },
  TipoRelacion: {
    '01': 'Nota de crédito de los documentos relacionados',
    '02': 'Nota de débito de los documentos relacionados',
    '03': 'Devolución de mercancía sobre facturas o traslados previos',
    '04': 'Sustitución de los CFDI previos',
    '05': 'Traslados de mercancías facturados previamente',
    '06': 'Factura generada por los traslados previos',
    '07': 'CFDI por aplicación de anticipo'
  },
  Periodicidad: {
    '01': 'Diario',
    '02': 'Semanal',
    '03': 'Quincenal',
    '04': 'Mensual',
    '05': 'Bimestral'
  },
  Meses: {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
    '13': 'Enero-Febrero', '14': 'Marzo-Abril', '15': 'Mayo-Junio',
    '16': 'Julio-Agosto', '17': 'Septiembre-Octubre', '18': 'Noviembre-Diciembre'
  }
};

/** Atributos cuyo valor es un código de catálogo. */
const ATRIBUTO_CATALOGO: Record<string, string> = {
  TipoDeComprobante: 'TipoDeComprobante',
  Exportacion: 'Exportacion',
  MetodoPago: 'MetodoPago',
  FormaPago: 'FormaPago',
  FormaDePagoP: 'FormaPago',
  UsoCFDI: 'UsoCFDI',
  RegimenFiscal: 'RegimenFiscal',
  RegimenFiscalReceptor: 'RegimenFiscal',
  ObjetoImp: 'ObjetoImp',
  ObjetoImpDR: 'ObjetoImp',
  Impuesto: 'Impuesto',
  ImpuestoDR: 'Impuesto',
  ImpuestoP: 'Impuesto',
  TipoFactor: 'TipoFactor',
  TipoFactorDR: 'TipoFactor',
  TipoFactorP: 'TipoFactor',
  TipoRelacion: 'TipoRelacion',
  Periodicidad: 'Periodicidad',
  Meses: 'Meses'
};

/** Descripción de un código de catálogo, o cadena vacía si no se conoce. */
export function descripcionCatalogo(atributo: string, valor: string | number | undefined | null): string {
  const cat = ATRIBUTO_CATALOGO[atributo];
  if (!cat || valor === undefined || valor === null) return '';
  const limpio = String(valor).trim();
  const desc = CATALOGOS[cat][limpio] || '';
  // si la descripción es igual al código (TipoFactor: "Tasa") no aporta nada
  return desc === limpio ? '' : desc;
}

/**
 * Elementos que el analizador reconoce (nombre local, sin prefijo de namespace).
 * Todo lo que no esté aquí se muestra igual, pero avisando al usuario.
 */
const ELEMENTOS_CONOCIDOS = [
  // cfdi 4.0
  'Comprobante', 'InformacionGlobal', 'CfdiRelacionados', 'CfdiRelacionado',
  'Emisor', 'Receptor', 'Conceptos', 'Concepto', 'Impuestos', 'Traslados',
  'Traslado', 'Retenciones', 'Retencion', 'ACuentaTerceros',
  'InformacionAduanera', 'CuentaPredial', 'ComplementoConcepto', 'Parte',
  'Complemento', 'Addenda',
  // Timbre fiscal digital
  'TimbreFiscalDigital',
  // Pagos 2.0
  'Pagos', 'Totales', 'Pago', 'DoctoRelacionado', 'ImpuestosDR',
  'RetencionesDR', 'RetencionDR', 'TrasladosDR', 'TrasladoDR',
  'ImpuestosP', 'RetencionesP', 'RetencionP', 'TrasladosP', 'TrasladoP',
  // Nómina 1.2
  'Nomina', 'Percepciones', 'Percepcion', 'AccionesOTitulos',
  'HorasExtra', 'JubilacionPensionRetiro', 'SeparacionIndemnizacion',
  'Deducciones', 'Deduccion', 'OtrosPagos', 'OtroPago', 'SubsidioAlEmpleo',
  'CompensacionSaldosAFavor', 'Incapacidades', 'Incapacidad', 'EntidadSNCF',
  // Impuestos locales
  'ImpuestosLocales', 'TrasladosLocales', 'RetencionesLocales'
];

export const SET_ELEMENTOS_CONOCIDOS: Record<string, boolean> = {};
ELEMENTOS_CONOCIDOS.forEach((n) => {
  SET_ELEMENTOS_CONOCIDOS[n] = true;
});
