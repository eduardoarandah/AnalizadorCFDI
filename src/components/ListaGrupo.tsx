import { useRef, useState, Fragment } from 'react';
import { moneda, cantidad } from '../lib/formato.ts';
import { BotonCopiar } from './BotonCopiar.tsx';
import { DetalleCFDI } from './DetalleCFDI.tsx';
import type { CFDI, Columna, ValorCelda } from '../lib/types.ts';

const COLUMNAS_FACTURA: Columna[] = [
  { clave: 'fecha', titulo: 'Fecha' },
  { clave: 'serieFolio', titulo: 'Serie-Folio' },
  { clave: 'emisorRfc', titulo: 'RFC emisor' },
  { clave: 'emisorNombre', titulo: 'Emisor' },
  { clave: 'receptorRfc', titulo: 'RFC receptor' },
  { clave: 'receptorNombre', titulo: 'Receptor' },
  { clave: 'numConceptos', titulo: 'Conceptos', tipo: 'cantidad' },
  { clave: 'subTotal', titulo: 'SubTotal', tipo: 'moneda' },
  { clave: 'descuento', titulo: 'Descuento', tipo: 'moneda' },
  { clave: 'trasladados', titulo: 'Trasladados', tipo: 'moneda' },
  { clave: 'retenidos', titulo: 'Retenidos', tipo: 'moneda' },
  { clave: 'total', titulo: 'Total', tipo: 'moneda' },
  { clave: 'uuid', titulo: 'UUID' },
  { clave: 'archivo', titulo: 'Archivo' }
];

const COLUMNAS_PAGO: Columna[] = [
  { clave: 'fecha', titulo: 'Fecha' },
  { clave: 'serieFolio', titulo: 'Serie-Folio' },
  { clave: 'emisorRfc', titulo: 'RFC emisor' },
  { clave: 'emisorNombre', titulo: 'Emisor' },
  { clave: 'receptorRfc', titulo: 'RFC receptor' },
  { clave: 'receptorNombre', titulo: 'Receptor' },
  { clave: 'numPagos', titulo: 'Pagos', tipo: 'cantidad' },
  { clave: 'numDoctos', titulo: 'Documentos', tipo: 'cantidad' },
  { clave: 'montoTotalPagos', titulo: 'Monto total pagos', tipo: 'moneda' },
  { clave: 'trasladados', titulo: 'Trasladados', tipo: 'moneda' },
  { clave: 'retenidos', titulo: 'Retenidos', tipo: 'moneda' },
  { clave: 'uuid', titulo: 'UUID' },
  { clave: 'archivo', titulo: 'Archivo' }
];

function suma(filas: Record<string, ValorCelda>[], clave: string): number {
  return filas.reduce((s, f) => s + ((f[clave] as number) || 0), 0);
}

function filaLista(cfdi: CFDI): Record<string, ValorCelda> {
  const esPago = !!cfdi.pagos;
  const base: Record<string, ValorCelda> = {
    fecha: cfdi.fecha,
    serieFolio: [cfdi.serie, cfdi.folio].filter(Boolean).join('-'),
    emisorRfc: cfdi.emisor.Rfc || '',
    emisorNombre: cfdi.emisor.Nombre || '',
    receptorRfc: cfdi.receptor.Rfc || '',
    receptorNombre: cfdi.receptor.Nombre || '',
    uuid: cfdi.uuid,
    archivo: cfdi.archivo
  };
  if (esPago) {
    let trasP = 0;
    let retP = 0;
    cfdi.pagos!.pagos.forEach((p) => {
      p.traslados.forEach((t) => { trasP += t.importe; });
      p.retenciones.forEach((r) => { retP += r.importe; });
    });
    base.numPagos = cfdi.pagos!.pagos.length;
    base.numDoctos = cfdi.pagos!.numDoctos;
    base.montoTotalPagos = cfdi.pagos!.montoTotalPagos;
    base.trasladados = trasP;
    base.retenidos = retP;
  } else {
    base.numConceptos = cfdi.conceptos.length;
    base.subTotal = cfdi.subTotal;
    base.descuento = cfdi.descuento;
    base.trasladados = cfdi.totalTrasladados;
    base.retenidos = cfdi.totalRetenidos;
    base.total = cfdi.total;
  }
  return base;
}

/** Lista de un tipo de comprobante; cada renglón se expande con el detalle. */
export function ListaGrupo({ grupo: g }: { grupo: import('../lib/types.ts').GrupoResumen }) {
  const ref = useRef<HTMLTableElement>(null);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const esPago = g.tipo === 'P';
  const columnas = esPago ? COLUMNAS_PAGO : COLUMNAS_FACTURA;

  function alternar(archivo: string) {
    const nuevo = { ...abiertos };
    if (nuevo[archivo]) delete nuevo[archivo];
    else nuevo[archivo] = true;
    setAbiertos(nuevo);
  }

  const filas = g.cfdis.map(filaLista);
  const totales: Record<string, ValorCelda> = {};
  columnas.forEach((c) => {
    if (c.tipo === 'moneda' || c.tipo === 'cantidad') {
      totales[c.clave] = suma(filas, c.clave);
    }
  });
  totales[columnas[0].clave] = 'TOTAL';

  return (
    <div className="mb-12">
      <div className="mb-2 text-sm font-bold text-gray-800">
        {g.nombreTipo} ({g.tipo}) — {g.cantidad} comprobante{g.cantidad === 1 ? '' : 's'}
      </div>
      <div className="overflow-x-auto">
        <table ref={ref} className="w-auto max-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-400 text-left">
              <th className="no-copiar whitespace-nowrap px-3 py-2">Detalle</th>
              {columnas.map((c) => (
                <th key={c.clave} className={`px-3 py-2 whitespace-nowrap ${c.tipo ? 'text-right' : ''}`}>
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.cfdis.map((cfdi, i) => {
              const fila = filas[i];
              const abierto = !!abiertos[cfdi.archivo];
              return (
                <Fragment key={cfdi.archivo}>
                  <tr className={abierto ? 'bg-blue-50' : 'even:bg-gray-50'}>
                    <td className="no-copiar whitespace-nowrap px-3 py-2 align-top">
                      <button
                        type="button"
                        className="border-0 bg-transparent p-0 text-blue-600 hover:underline"
                        onClick={() => alternar(cfdi.archivo)}
                      >
                        {abierto ? '▼ ocultar' : '▶ ver detalle'}
                      </button>
                    </td>
                    {columnas.map((c) => {
                      const v = fila[c.clave];
                      const mostrado =
                        c.tipo === 'moneda'
                          ? moneda(v as number)
                          : c.tipo === 'cantidad'
                            ? cantidad(v as number)
                            : v === undefined
                              ? ''
                              : c.clave === 'fecha'
                                ? (v as string).split(' ')[0]
                                : v;
                      return (
                        <td
                          key={c.clave}
                          className={`whitespace-nowrap px-3 py-2 align-top ${c.tipo ? 'text-right' : ''}`}
                          data-valor={v === undefined ? '' : (v as string | number)}
                        >
                          {mostrado as string | number}
                        </td>
                      );
                    })}
                  </tr>
                  {abierto ? (
                    <tr className="no-copiar">
                      <td colSpan={columnas.length + 1} className="whitespace-normal bg-gray-50 p-5">
                        <DetalleCFDI cfdi={cfdi} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            <tr className="fila-totales border-t-2 border-gray-400 bg-gray-100">
              <td className="no-copiar px-3 py-2"></td>
              {columnas.map((c) => {
                const v = totales[c.clave];
                const mostrado = v === undefined ? '' : c.tipo === 'moneda' ? moneda(v as number) : c.tipo === 'cantidad' ? cantidad(v as number) : v;
                return (
                  <td
                    key={c.clave}
                    className={`whitespace-nowrap px-3 py-2 align-top ${c.tipo ? 'text-right' : ''}`}
                    data-valor={v === undefined ? '' : (v as string | number)}
                  >
                    <strong>{mostrado as string | number}</strong>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <BotonCopiar tablaRef={ref} />
    </div>
  );
}
