import { SeccionNodos } from './SeccionNodos.tsx';
import { Tabla } from './Tabla.tsx';
import { TablasImpuestos } from './TablasImpuestos.tsx';
import { agruparImpuestos } from '../lib/resumen.ts';
import type { CFDI, Columna, ValorCelda } from '../lib/types.ts';

const COLUMNAS_CONCEPTOS: Columna[] = [
  { clave: 'claveProdServ', titulo: 'ClaveProdServ' },
  { clave: 'noIdentificacion', titulo: 'NoIdentificacion' },
  { clave: 'descripcion', titulo: 'Descripción', largo: true },
  { clave: 'claveUnidad', titulo: 'ClaveUnidad' },
  { clave: 'unidad', titulo: 'Unidad' },
  { clave: 'cantidad', titulo: 'Cantidad', tipo: 'cantidad' },
  { clave: 'valorUnitario', titulo: 'Valor unitario', tipo: 'moneda' },
  { clave: 'importe', titulo: 'Importe', tipo: 'moneda' },
  { clave: 'descuento', titulo: 'Descuento', tipo: 'moneda' },
  { clave: 'trasladados', titulo: 'Trasladados', tipo: 'moneda' },
  { clave: 'retenidos', titulo: 'Retenidos', tipo: 'moneda' }
];

function suma(filas: Record<string, ValorCelda>[], clave: string): number {
  return filas.reduce((s, f) => s + ((f[clave] as number) || 0), 0);
}

function filasConceptos(cfdi: CFDI): Record<string, ValorCelda>[] {
  return cfdi.conceptos.map((co) => ({
    claveProdServ: co.claveProdServ,
    noIdentificacion: co.noIdentificacion,
    descripcion: co.descripcion,
    claveUnidad: co.claveUnidad,
    unidad: co.unidad,
    cantidad: co.cantidad,
    valorUnitario: co.valorUnitario,
    importe: co.importe,
    descuento: co.descuento,
    trasladados: co.traslados.reduce((s, t) => s + t.importe, 0),
    retenidos: co.retenciones.reduce((s, r) => s + r.importe, 0)
  }));
}

export function DetalleCFDI({ cfdi }: { cfdi: CFDI }) {
  const filas = filasConceptos(cfdi);

  return (
    <div>
      <h4 className="mb-4 text-lg font-semibold">{cfdi.archivo}</h4>
      {cfdi.desconocidos.length ? (
        <div className="mb-5 rounded border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
          <strong>No se reconocen los siguientes datos:</strong>
          <ul className="mb-0 list-disc pl-6">
            {cfdi.desconocidos.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          Se muestran completos más abajo, pero no se suman en el resumen.
        </div>
      ) : null}

      <Tabla
        titulo="Conceptos"
        columnas={COLUMNAS_CONCEPTOS}
        filas={filas}
        filaTotales={{
          claveProdServ: 'TOTAL',
          cantidad: suma(filas, 'cantidad'),
          importe: suma(filas, 'importe'),
          descuento: suma(filas, 'descuento'),
          trasladados: suma(filas, 'trasladados'),
          retenidos: suma(filas, 'retenidos')
        }}
      />
      <TablasImpuestos titulo="Impuestos trasladados" filas={agruparImpuestos(cfdi.impuestos.traslados)} />
      <TablasImpuestos titulo="Impuestos retenidos" filas={agruparImpuestos(cfdi.impuestos.retenciones)} />

      <SeccionNodos nodos={[cfdi.raiz]} titulo={cfdi.raiz.nombre} excluirHijos={['Conceptos', 'Impuestos']} />
    </div>
  );
}
