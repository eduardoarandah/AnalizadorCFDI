import { Fragment } from 'react';
import { Tabla } from './Tabla.tsx';
import type { Columna, GrupoResumen, ValorCelda } from '../lib/types.ts';

function suma<T extends object>(filas: T[], clave: keyof T): number {
  return filas.reduce((s, f) => s + ((f[clave] as unknown as number) || 0), 0);
}

function filas<T>(arr: T[]): Record<string, ValorCelda>[] {
  return arr as unknown as Record<string, ValorCelda>[];
}

function TablasImpuestos({ titulo, filas: datos }: { titulo: string; filas: GrupoResumen['traslados'] }) {
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
      filas={filas(datos)}
      filaTotales={{
        impuesto: 'TOTAL',
        veces: suma(datos, 'veces'),
        base: suma(datos, 'base'),
        importe: suma(datos, 'importe')
      }}
    />
  );
}

function TablaLocales({ titulo, filas: datos }: { titulo: string; filas: GrupoResumen['localesTraslados'] }) {
  if (!datos.length) return null;
  return (
    <Tabla
      titulo={titulo}
      columnas={[
        { clave: 'nombre', titulo: 'Impuesto local' },
        { clave: 'tasa', titulo: 'Tasa' },
        { clave: 'veces', titulo: 'Partidas', tipo: 'cantidad' },
        { clave: 'importe', titulo: 'Importe', tipo: 'moneda' }
      ]}
      filas={filas(datos)}
      filaTotales={{
        nombre: 'TOTAL',
        veces: suma(datos, 'veces'),
        importe: suma(datos, 'importe')
      }}
    />
  );
}

export function ResumenGrupo({ grupo: g }: { grupo: GrupoResumen }) {
  // en un complemento de pago el SubTotal y el Total siempre son cero:
  // lo que importa son los montos pagados y sus impuestos
  const esPago = g.tipo === 'P' && !!g.pagos;

  const columnasParte: Columna[] = esPago
    ? [
        { clave: 'rfc', titulo: 'RFC' },
        { clave: 'nombre', titulo: 'Nombre' },
        { clave: 'cantidad', titulo: 'Comprobantes', tipo: 'cantidad' },
        { clave: 'pagado', titulo: 'Monto pagado', tipo: 'moneda' }
      ]
    : [
        { clave: 'rfc', titulo: 'RFC' },
        { clave: 'nombre', titulo: 'Nombre' },
        { clave: 'cantidad', titulo: 'Comprobantes', tipo: 'cantidad' },
        { clave: 'subTotal', titulo: 'SubTotal', tipo: 'moneda' },
        { clave: 'trasladados', titulo: 'Trasladados', tipo: 'moneda' },
        { clave: 'retenidos', titulo: 'Retenidos', tipo: 'moneda' },
        { clave: 'total', titulo: 'Total', tipo: 'moneda' }
      ];

  return (
    <div className="mb-12">
      <h3 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl">
        {g.nombreTipo}{' '}
        <small className="font-normal text-gray-500">
          ({g.tipo}) — {g.cantidad} comprobante{g.cantidad === 1 ? '' : 's'}
        </small>
      </h3>

      {esPago ? null : (
        <Fragment>
          <Tabla
            titulo="Totales por moneda"
            columnas={[
              { clave: 'moneda', titulo: 'Moneda' },
              { clave: 'cantidad', titulo: 'Comprobantes', tipo: 'cantidad' },
              { clave: 'subTotal', titulo: 'SubTotal', tipo: 'moneda' },
              { clave: 'descuento', titulo: 'Descuento', tipo: 'moneda' },
              { clave: 'trasladados', titulo: 'Impuestos trasladados', tipo: 'moneda' },
              { clave: 'retenidos', titulo: 'Impuestos retenidos', tipo: 'moneda' },
              { clave: 'total', titulo: 'Total', tipo: 'moneda' }
            ]}
            filas={filas(g.totales)}
            filaTotales={{
              moneda: 'TOTAL',
              cantidad: suma(g.totales, 'cantidad'),
              subTotal: suma(g.totales, 'subTotal'),
              descuento: suma(g.totales, 'descuento'),
              trasladados: suma(g.totales, 'trasladados'),
              retenidos: suma(g.totales, 'retenidos'),
              total: suma(g.totales, 'total')
            }}
          />

          <TablasImpuestos titulo="Impuestos trasladados" filas={g.traslados} />
          <TablasImpuestos titulo="Impuestos retenidos" filas={g.retenciones} />
          <TablaLocales titulo="Impuestos locales trasladados" filas={g.localesTraslados} />
          <TablaLocales titulo="Impuestos locales retenidos" filas={g.localesRetenciones} />
        </Fragment>
      )}

      {(['emisores', 'receptores'] as const).map((cual) => {
        const totales: Record<string, ValorCelda> = { rfc: 'TOTAL' };
        columnasParte.forEach((c) => {
          if (c.tipo) totales[c.clave] = suma(g[cual], c.clave as keyof (typeof g)[typeof cual][number]);
        });
        return (
          <Tabla
            key={cual}
            titulo={cual === 'emisores' ? 'Por emisor' : 'Por receptor'}
            columnas={columnasParte}
            filas={filas(g[cual])}
            filaTotales={totales}
          />
        );
      })}

      {g.pagos ? (
        <Fragment>
          <Tabla
            titulo="Pagos recibidos por moneda y forma de pago"
            columnas={[
              { clave: 'moneda', titulo: 'Moneda' },
              { clave: 'formaDePagoP', titulo: 'Forma de pago' },
              { clave: 'descripcionForma', titulo: 'Descripción' },
              { clave: 'numPagos', titulo: 'Pagos', tipo: 'cantidad' },
              { clave: 'monto', titulo: 'Monto', tipo: 'moneda' }
            ]}
            filas={filas(g.pagos.porMoneda)}
            filaTotales={{
              moneda: 'TOTAL',
              numPagos: suma(g.pagos.porMoneda, 'numPagos'),
              monto: suma(g.pagos.porMoneda, 'monto')
            }}
          />
          <TablasImpuestos titulo="Impuestos trasladados del pago" filas={g.pagos.traslados} />
          <TablasImpuestos titulo="Impuestos retenidos del pago" filas={g.pagos.retenciones} />
          <Tabla
            titulo="Documentos relacionados"
            columnas={[
              { clave: 'idDocumento', titulo: 'IdDocumento (UUID)' },
              { clave: 'serie', titulo: 'Serie' },
              { clave: 'folio', titulo: 'Folio' },
              { clave: 'moneda', titulo: 'Moneda' },
              { clave: 'parcialidades', titulo: 'Parcialidades', tipo: 'cantidad' },
              { clave: 'impPagado', titulo: 'Importe pagado', tipo: 'moneda' },
              { clave: 'impSaldoInsoluto', titulo: 'Saldo insoluto', tipo: 'moneda' }
            ]}
            filas={filas(g.pagos.doctos)}
            filaTotales={{
              idDocumento: 'TOTAL',
              parcialidades: suma(g.pagos.doctos, 'parcialidades'),
              impPagado: suma(g.pagos.doctos, 'impPagado'),
              impSaldoInsoluto: suma(g.pagos.doctos, 'impSaldoInsoluto')
            }}
          />
        </Fragment>
      ) : null}
    </div>
  );
}
