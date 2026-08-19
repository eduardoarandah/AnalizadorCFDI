import { SeccionNodos } from './SeccionNodos.tsx';
import type { CFDI } from '../lib/types.ts';

export function DetalleCFDI({ cfdi }: { cfdi: CFDI }) {
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
      <SeccionNodos nodos={[cfdi.raiz]} titulo={cfdi.raiz.nombre} />
    </div>
  );
}
