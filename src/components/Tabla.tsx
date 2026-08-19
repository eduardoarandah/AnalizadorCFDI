import { useRef, useState, Fragment } from 'react';
import { moneda, cantidad } from '../lib/formato.ts';
import { BotonCopiar } from './BotonCopiar.tsx';
import type { Columna, ValorCelda } from '../lib/types.ts';

const LARGO_TRUNCADO = 8;

function CeldaValor({ mostrado, truncar }: { mostrado: string | number; truncar?: boolean }) {
  const [expandido, setExpandido] = useState(false);
  if (!truncar || typeof mostrado !== 'string' || mostrado.length <= LARGO_TRUNCADO) {
    return <>{mostrado}</>;
  }
  if (expandido) {
    return (
      <span className="cursor-pointer" title="Click para contraer" onClick={() => setExpandido(false)}>
        {mostrado}
      </span>
    );
  }
  return (
    <span className="cursor-pointer text-blue-600 underline" title="Click para ver completo" onClick={() => setExpandido(true)}>
      {mostrado.slice(0, LARGO_TRUNCADO)}…
    </span>
  );
}

function numerica(col: Columna): boolean {
  return col.tipo === 'moneda' || col.tipo === 'cantidad';
}

function celda(fila: Record<string, ValorCelda>, col: Columna): { crudo: string; mostrado: string | number } {
  let v = fila[col.clave];
  if (v === undefined || v === null) v = '';
  let crudo: string | number = typeof v === 'object' ? v.valor : v;
  let mostrado: string | number = typeof v === 'object' ? v.texto : v;
  if (typeof v !== 'object') {
    if (col.tipo === 'moneda') mostrado = moneda(v as number);
    else if (col.tipo === 'cantidad') mostrado = cantidad(v as number);
  }
  return { crudo: String(crudo === undefined ? '' : crudo), mostrado };
}

const CLASE_TD = 'px-3 py-2 align-top';
const CLASE_TD_LARGA = 'whitespace-normal break-words';
const CLASE_TD_CORTA = 'whitespace-nowrap';

export interface TablaProps {
  columnas: Columna[];
  filas: Record<string, ValorCelda>[];
  filaTotales?: Record<string, ValorCelda>;
  titulo: string;
  claseTitulo?: 'titulo-nodo' | 'titulo-tabla';
}

/**
 * Tabla genérica.
 * filas: objetos con las claves de las columnas (cada valor puede ser
 * {valor, texto} para mostrar algo distinto a lo que se copia)
 */
export function Tabla({ columnas, filas, filaTotales, titulo, claseTitulo }: TablaProps) {
  const ref = useRef<HTMLTableElement>(null);
  if (!filas.length) return null;

  const cuerpo = (
    <Fragment>
      <thead>
        <tr className="border-b-2 border-gray-400 text-left">
          {columnas.map((col) => (
            <th key={col.clave} className={`${CLASE_TD} ${CLASE_TD_CORTA} ${numerica(col) ? 'text-right' : ''}`}>
              {col.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i} className="even:bg-gray-50">
            {columnas.map((col) => {
              const c = celda(fila, col);
              return (
                <td
                  key={col.clave}
                  className={`${CLASE_TD} ${col.largo || col.truncar ? CLASE_TD_LARGA : CLASE_TD_CORTA} ${numerica(col) ? 'text-right' : ''}`}
                  data-valor={c.crudo}
                  title={col.largo ? c.crudo : undefined}
                >
                  <CeldaValor mostrado={c.mostrado} truncar={col.truncar} />
                </td>
              );
            })}
          </tr>
        ))}
        {filaTotales ? (
          <tr className="fila-totales border-t-2 border-gray-400 bg-gray-100">
            {columnas.map((col) => {
              const v = filaTotales[col.clave];
              const mostrado =
                v === undefined ? '' : col.tipo === 'moneda' ? moneda(v as number) : col.tipo === 'cantidad' ? cantidad(v as number) : v;
              return (
                <td
                  key={col.clave}
                  className={`${CLASE_TD} ${CLASE_TD_CORTA} ${numerica(col) ? 'text-right' : ''}`}
                  data-valor={v === undefined ? '' : (v as string | number)}
                >
                  <strong>{mostrado as string | number}</strong>
                </td>
              );
            })}
          </tr>
        ) : null}
      </tbody>
    </Fragment>
  );

  return (
    <div className="mb-8">
      <div className={claseTitulo === 'titulo-nodo' ? 'mb-2 text-sm text-gray-500' : 'mb-2 text-sm font-bold text-gray-800'}>
        {titulo}
      </div>
      <div className="overflow-x-auto">
        <table ref={ref} className="w-auto max-w-full border-collapse text-sm">
          {cuerpo}
        </table>
      </div>
      <BotonCopiar tablaRef={ref} />
    </div>
  );
}
