import { Fragment } from 'react';
import { descripcionCatalogo } from '../lib/catalogos.ts';
import { Tabla } from './Tabla.tsx';
import type { Columna, Nodo, ValorCelda } from '../lib/types.ts';

const ATRIBUTOS_LARGOS: Record<string, boolean> = { Descripcion: true };

const ATRIBUTOS_TRUNCADOS: Record<string, boolean> = {
  Sello: true, Certificado: true, SelloCFD: true, SelloSAT: true, schemaLocation: true
};

/**
 * Muestra un grupo de nodos hermanos del XML como tabla y baja
 * recursivamente a sus hijos. Sirve para cualquier elemento, incluso los
 * que no conocemos.
 */
export function SeccionNodos({
  nodos,
  titulo,
  excluirHijos
}: {
  nodos: Nodo[];
  titulo: string;
  /** Nombres locales de hijos que no se recorren (para no repetir tablas ya mostradas aparte). */
  excluirHijos?: string[];
}) {
  if (!nodos.length) return null;

  // columnas = unión de los atributos de todos los nodos hermanos
  const claves: string[] = [];
  nodos.forEach((n) => {
    n.atributos.forEach((a) => {
      if (claves.indexOf(a.nombre) === -1) claves.push(a.nombre);
    });
  });
  const hayTexto = nodos.some((n) => n.texto);

  const columnas: Columna[] = [];
  if (nodos.length > 1) columnas.push({ clave: '__n', titulo: '#' });
  claves.forEach((k) => {
    columnas.push({ clave: k, titulo: k, largo: !!ATRIBUTOS_LARGOS[k], truncar: !!ATRIBUTOS_TRUNCADOS[k] });
  });
  if (hayTexto) columnas.push({ clave: '__texto', titulo: 'Valor' });

  function filaDe(n: Nodo, i: number): Record<string, ValorCelda> {
    const fila: Record<string, ValorCelda> = { __n: String(i + 1), __texto: n.texto || '' };
    const a: Record<string, string> = {};
    n.atributos.forEach((at) => { a[at.nombre] = at.valor; });
    claves.forEach((k) => {
      const valor = a[k] === undefined ? '' : a[k];
      const desc = descripcionCatalogo(k, valor);
      fila[k] = desc ? { valor, texto: valor + ' — ' + desc } : valor;
    });
    return fila;
  }

  return (
    <Fragment>
      {nodos.map((n, i) => {
        // hijos agrupados por nombre, respetando el orden del XML
        const grupos: { nombre: string; nodos: Nodo[] }[] = [];
        n.hijos.forEach((h) => {
          if (excluirHijos && excluirHijos.indexOf(h.local) !== -1) return;
          let g = grupos.filter((x) => x.nombre === h.nombre)[0];
          if (!g) {
            g = { nombre: h.nombre, nodos: [] };
            grupos.push(g);
          }
          g.nodos.push(h);
        });
        const prefijo = titulo + (nodos.length > 1 ? ' #' + (i + 1) : '');
        return (
          <Fragment key={prefijo}>
            {columnas.length ? (
              <Tabla titulo={titulo} columnas={columnas} filas={[filaDe(n, i)]} claseTitulo="titulo-nodo" />
            ) : null}
            {grupos.map((g) => (
              <SeccionNodos key={prefijo + g.nombre} nodos={g.nodos} titulo={prefijo + ' › ' + g.nombre} />
            ))}
          </Fragment>
        );
      })}
    </Fragment>
  );
}
