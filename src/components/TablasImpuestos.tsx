import { Tabla } from './Tabla.tsx';
import type { Columna, ImpuestoAgrupado, ValorCelda } from '../lib/types.ts';

function suma(filas: ImpuestoAgrupado[], clave: keyof ImpuestoAgrupado): number {
  return filas.reduce((s, f) => s + ((f[clave] as unknown as number) || 0), 0);
}

/** Tabla de impuestos (trasladados o retenidos) ya agrupados por impuesto, factor y tasa. */
export function TablasImpuestos({ titulo, filas: datos }: { titulo: string; filas: ImpuestoAgrupado[] }) {
  const cols: Columna[] = [
    { clave: 'impuesto', titulo: 'Impuesto' },
    { clave: 'nombreImpuesto', titulo: 'Nombre' },
    { clave: 'tipoFactor', titulo: 'Tipo factor' },
    { clave: 'tasa', titulo: 'Tasa o cuota' },
    { clave: 'veces', titulo: 'Partidas', tipo: 'cantidad' },
    { clave: 'base', titulo: 'Base', tipo: 'moneda' },
    { clave: 'importe', titulo: 'Importe', tipo: 'moneda' }
  ];
  if (!datos.length) return null;
  return (
    <Tabla
      titulo={titulo}
      columnas={cols}
      filas={datos as unknown as Record<string, ValorCelda>[]}
      filaTotales={{
        impuesto: 'TOTAL',
        veces: suma(datos, 'veces'),
        base: suma(datos, 'base'),
        importe: suma(datos, 'importe')
      }}
    />
  );
}
