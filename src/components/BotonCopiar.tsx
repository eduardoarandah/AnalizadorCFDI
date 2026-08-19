import { useState, type RefObject } from 'react';
import { tablaATexto, copiarAlPortapapeles } from '../lib/formato.ts';

export function BotonCopiar({ tablaRef }: { tablaRef: RefObject<HTMLTableElement | null> }) {
  const [texto, setTexto] = useState('Copiar');

  function copiar() {
    const tabla = tablaRef.current;
    if (!tabla) return;
    copiarAlPortapapeles(tablaATexto(tabla), tabla.outerHTML).then(
      () => {
        setTexto('¡Copiado!');
        setTimeout(() => setTexto('Copiar'), 1500);
      },
      () => setTexto('No se pudo copiar')
    );
  }

  return (
    <button
      type="button"
      className="mt-2 rounded border border-gray-400 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
      onClick={copiar}
    >
      {texto}
    </button>
  );
}
