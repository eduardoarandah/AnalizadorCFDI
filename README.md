# Analizador CFDI

Crear un resumen de los XML de los CFDI del SAT fácil de copiar a Excel.

Arrastra los archivos XML del SAT a la pantalla y obtén un resumen del contenido de cada archivo

**Nota: El sistema no envía tus XML a ningún lugar, por lo que tu privacidad está garantizada**

## Cómo usar

**Para usar [click aquí](https://analizador-cfdi.netlify.app)**

![ejemplo1](https://user-images.githubusercontent.com/4065733/38106353-f1a258be-334b-11e8-98ac-6206ddacb1ae.png)


# Qué muestra

**Resumen** (separado por tipo de comprobante, porque las columnas que importan son distintas en una factura y en un complemento de pago):

- Totales por moneda: SubTotal, Descuento, Impuestos trasladados, Impuestos retenidos, Total
- Impuestos trasladados y retenidos agrupados por impuesto, tipo de factor y tasa (base e importe)
- Impuestos locales
- Conceptos agrupados por ClaveProdServ / NoIdentificacion / Descripción, con cantidad, importe, descuento e impuestos
- Totales por emisor y por receptor
- Complementos de pago: montos por moneda y forma de pago, impuestos del pago y documentos relacionados

**Lista de comprobantes**: un renglón por XML y, al hacer click en *ver detalle*, se muestra
**toda** la información del XML (Comprobante, Emisor, Receptor, Conceptos, Impuestos y
Complemento) en tablas generadas de forma recursiva. Los códigos del SAT se muestran con su
descripción (por ejemplo `03 — Transferencia electrónica de fondos`).

Si un XML trae elementos que el analizador no conoce, se muestran igual y se avisa con el mensaje
*"no se reconocen los siguientes datos"*.

Todas las tablas tienen un botón **Copiar** que las deja en el portapapeles listas para pegar en Excel.

# Desarrollo

Vite + React + TypeScript + Tailwind CSS, gestionado con `pnpm`.

- `src/lib/catalogos.ts` catálogos del SAT y lista de elementos conocidos
- `src/lib/parser.ts` lectura del XML con `DOMParser`
- `src/lib/resumen.ts` agrupaciones y sumas
- `src/lib/formato.ts` utilerías (formato de números, copiar al portapapeles, lectura de archivos)
- `src/components/` componentes de React
- `src/App.tsx` componente principal

```
pnpm install
pnpm dev       # servidor de desarrollo
pnpm build     # compila a la carpeta deploy/
pnpm preview   # sirve el build de deploy/ localmente
```

# Para descargar los CFDI

Puedes usar la herramienta [Descarga Masiva CFDI](https://github.com/eduardoarandah/DescargaMasivaCFDI)


**Contáctame si necesitas ayuda:** 

eduardoarandah@gmail.com

**Si deseas contribuir al desarrollo**

Puedes hacerlo via paypal en el siguiente enlace
[https://eduardoarandah.github.io/](https://eduardoarandah.github.io/)

![donar](https://user-images.githubusercontent.com/4065733/38109725-587af320-3356-11e8-941a-7215489a9286.png)
