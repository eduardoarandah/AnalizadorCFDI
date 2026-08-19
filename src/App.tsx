import { useEffect, useState, Fragment } from 'react';
import { parsearCFDI } from './lib/parser.ts';
import { resumenGlobal } from './lib/resumen.ts';
import { leerArchivo } from './lib/formato.ts';
import { ResumenGrupo } from './components/ResumenGrupo.tsx';
import { ListaGrupo } from './components/ListaGrupo.tsx';
import type { CFDI, ErrorArchivo } from './lib/types.ts';

const logoChrome = '/img/logo-chrome.png';
const logoFirefox = '/img/logo-firefox.png';

export function App() {
  const [cfdis, setCfdis] = useState<CFDI[]>([]);
  const [errores, setErrores] = useState<ErrorArchivo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);

  function agregarArchivos(fileList: FileList) {
    const files = Array.from(fileList).filter((f) => /\.xml$/i.test(f.name));
    if (!files.length) return;
    Promise.all(files.map((f) => leerArchivo(f, parsearCFDI))).then((resultados) => {
      const nuevos: CFDI[] = [];
      const fallas: ErrorArchivo[] = [];
      resultados.forEach((r) => {
        if ('ok' in r) nuevos.push(r.ok);
        else fallas.push(r.error);
      });
      setCfdis((previos) => {
        const nombres: Record<string, boolean> = {};
        nuevos.forEach((n) => { nombres[n.archivo] = true; });
        return previos.filter((p) => !nombres[p.archivo]).concat(nuevos);
      });
      if (fallas.length) {
        setErrores((previos) => previos.concat(fallas));
      }
    });
  }

  useEffect(() => {
    function prevenir(e: DragEvent) { e.preventDefault(); }
    window.addEventListener('dragover', prevenir);
    window.addEventListener('drop', prevenir);
    return () => {
      window.removeEventListener('dragover', prevenir);
      window.removeEventListener('drop', prevenir);
    };
  }, []);

  const grupos = resumenGlobal(cfdis);

  return (
    <div className="mx-auto max-w-[2400px] px-8">
      <h1 className="mb-4 mt-8 text-5xl font-bold">Analizador CFDIs privado</h1>

      <p className="mb-6 inline-block rounded border border-l-4 border-green-600 bg-green-50 px-5 py-3 text-base text-green-800">
        🔒 Tus XML <strong>no salen de tu computadora</strong>, todo se procesa en el navegador.
      </p>

      <div
        className={
          'mb-6 max-w-[560px] rounded-md border-2 border-dashed p-8 text-center ' +
          (arrastrando ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50')
        }
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          agregarArchivos(e.dataTransfer.files);
        }}
      >
        <p className="mb-3 text-base"><strong>Arrastra aquí los archivos XML del SAT</strong></p>
        <input
          type="file"
          multiple
          accept=".xml,text/xml"
          onChange={(e) => {
            if (e.target.files) agregarArchivos(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {errores.length ? (
        <div className="mb-6 rounded border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
          <strong>Archivos con problemas:</strong>
          <ul className="mb-0 list-disc pl-6">
            {errores.map((er, i) => (
              <li key={i}>{er.archivo}: {er.mensaje}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {cfdis.length ? (
        <Fragment>
          <div className="mb-6 flex items-center gap-6">
            <span className="text-sm text-gray-600">
              {cfdis.length} comprobante{cfdis.length === 1 ? '' : 's'} cargado{cfdis.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              className="rounded border border-red-400 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              onClick={() => { setCfdis([]); setErrores([]); }}
            >
              Limpiar
            </button>
          </div>

          <h2 className="mb-6 mt-12 border-b-[3px] border-gray-800 pb-2 text-2xl">Comprobantes</h2>
          {grupos.map((g) => (
            <ListaGrupo key={g.tipo} grupo={g} />
          ))}

          <h2 className="mb-6 mt-12 border-b-[3px] border-gray-800 pb-2 text-2xl">Resumen</h2>
          {grupos.map((g) => (
            <ResumenGrupo key={g.tipo} grupo={g} />
          ))}
        </Fragment>
      ) : null}

      <div className="my-10 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-5xl">
        <div className="flex items-center gap-4 border border-gray-200 bg-gray-50 p-5">
          <a href="https://chrome.google.com/webstore/detail/descarga-masiva-facturas/cmcidfkdmfopijnadkbdbhknfkjodmec?hl=es-419">
            <img src={logoChrome} alt="" className="h-[50px] w-auto rounded-md bg-gray-500 p-2.5" />
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/descarga-masiva-facturas/cmcidfkdmfopijnadkbdbhknfkjodmec?hl=es-419"
            target="_blank"
            rel="noreferrer"
          >
            Descarga masiva XML Chrome
          </a>
        </div>

        <div className="flex items-center gap-4 border border-gray-200 bg-gray-50 p-5">
          <a href="https://addons.mozilla.org/en-US/firefox/addon/descarga-masiva-facturas/">
            <img src={logoFirefox} alt="" className="h-[50px] w-auto rounded-md bg-gray-500 p-2.5" />
          </a>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/descarga-masiva-facturas/"
            target="_blank"
            rel="noreferrer"
          >
            Descarga masiva XML Firefox
          </a>
        </div>
      </div>

      <div className="my-10 border border-gray-200 bg-gray-50 p-5 max-w-5xl">
        <div className="float-right inline-block">
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="89UZBKNE5EK8S" />
            <input
              type="image"
              src="https://www.paypalobjects.com/es_XC/MX/i/btn/btn_donateCC_LG.gif"
              name="submit"
              alt="PayPal, la forma más segura y rápida de pagar en línea."
            />
            <img alt="" src="https://www.paypalobjects.com/es_XC/i/scr/pixel.gif" width={1} height={1} />
          </form>
        </div>

        <img
          className="float-left mr-4"
          src="https://es.gravatar.com/userimage/8114274/0cff94afc2f748b5da1096e10cf54ef0.jpeg"
          alt=""
        />
        ¡Hola! he desarrollado este plugin para ayudarnos a manejar los archivos XML del SAT México.
        <br />
        Si deseas contribuir con código puedes hacerlo en el repositorio de Github{' '}
        <a href="https://github.com/eduardoarandah/AnalizadorCFDI" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
          AnalizadorCFDI
        </a>
        <br />
        O puedes escribirme al correo{' '}
        <a href="mailto:eduardoarandah@gmail.com" className="text-blue-600 hover:underline">
          eduardoarandah@gmail.com
        </a>
        <br />
        O puedes hacer un <strong>donativo</strong> con tarjeta de crédito (pago seguro via paypal), gracias!
        <div className="clear-both" />
      </div>
    </div>
  );
}
