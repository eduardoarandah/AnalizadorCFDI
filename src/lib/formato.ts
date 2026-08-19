import type { CFDI, ErrorArchivo } from './types.ts';

/** Número con 2 decimales y separador de miles. */
export function moneda(n: number | undefined): string {
  return (n || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Número con los decimales que traiga (hasta 6). */
export function cantidad(n: number | undefined): string {
  return (n || 0).toLocaleString('es-MX', { maximumFractionDigits: 6 });
}

/** Texto tabulado de una tabla, listo para pegar en Excel. */
export function tablaATexto(tabla: HTMLTableElement): string {
  const filas = tabla.querySelectorAll<HTMLTableRowElement>(':scope > thead > tr, :scope > tbody > tr');
  const lineas: string[] = [];
  filas.forEach((tr) => {
    if (tr.classList.contains('no-copiar')) return;
    const celdas: string[] = [];
    Array.prototype.forEach.call(tr.children, (td: HTMLTableCellElement) => {
      if (td.classList.contains('no-copiar')) return;
      const v = td.dataset.valor !== undefined ? td.dataset.valor : td.textContent;
      celdas.push(String(v ?? '').replace(/[\t\r\n]+/g, ' ').trim());
    });
    lineas.push(celdas.join('\t'));
  });
  return lineas.join('\n');
}

export function copiarAlPortapapeles(texto: string, htmlTexto?: string): Promise<void> {
  if (navigator.clipboard && window.ClipboardItem && htmlTexto) {
    return navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([texto], { type: 'text/plain' }),
        'text/html': new Blob([htmlTexto], { type: 'text/html' })
      })
    ]);
  }
  if (navigator.clipboard) return navigator.clipboard.writeText(texto);
  const ta = document.createElement('textarea');
  ta.value = texto;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

export type ResultadoLectura = { ok: CFDI } | { error: ErrorArchivo };

/** Lee un archivo XML y lo convierte en un CFDI (o un error con mensaje). */
export function leerArchivo(file: File, parsearCFDI: (texto: string, archivo: string) => CFDI): Promise<ResultadoLectura> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve({ ok: parsearCFDI(e.target!.result as string, file.name) });
      } catch (err) {
        resolve({ error: { archivo: file.name, mensaje: (err as Error).message } });
      }
    };
    reader.onerror = () => {
      resolve({ error: { archivo: file.name, mensaje: 'No se pudo leer el archivo' } });
    };
    reader.readAsText(file);
  });
}
