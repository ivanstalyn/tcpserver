# Documentación del servidor TCP
Descripción, formato de tramas, ejemplos y guía rápida para ejecutar y probar el servicio TCP incluido en este repositorio.

---

## Resumen

Servidor TCP de ejemplo que genera respuestas para consultas de clientes y facturas. Acepta tramas con una cabecera fija (58 caracteres) seguida de datos específicos. Soporta respuestas en dos formatos:

- Tramas de tamaño fijo (getTrama): campos con ancho fijo.
- Tramas de tamaño variable (getTramaVariable): cada campo va precedido por un prefijo de longitud de 3 dígitos (ej. `005Juan`).

Modelos principales: Cabecera, Cliente, Factura, ItemFactura y Transaccion (encargada de enrutar y generar respuestas).

---

## Ejemplos

Ejemplo de transacción de consulta de un cliente (campos fijos):

    2025111921570800019999aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678

Ejemplo de transacción de consulta de un cliente (campos variables):

    2025111921570890019999aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678

Ejemplo de transacción de consulta de una factura (campos fijos):

    2025111921570800029999aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-000004743

Ejemplo de transacción de consulta de una factura (campos variables):

    2025111921570890029999aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-000004743


---

## Cómo probar localmente

1. Abrir terminal y situarse en el directorio del proyecto:

```bash
cd ~/Documentos/desarrollo/varios-ismf/tcpserver
```

2. Instalar dependencias:

```bash
npm ci
```

3. Enviar un mensaje de prueba al servidor (ejemplo con `nc`, sustituir puerto si procede):

```bash
nc localhost 9000
2025111921570800019999aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678
```

---

## Desarrollo y pruebas

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar linter:

```bash
npm run lint
```

3. Ejecutar tests:

```bash
npm test
```

Notas:
- `@faker-js/faker` se usa en runtime y en tests; la configuración de test permite transformar ESM si es necesario.
- Se eliminó el mock manual de faker en favor de la versión real transformada por Jest/Babel.

---

## One-liners útiles (referencia)

- Fecha yyyyMMdd:

```javascript
const yyyyMMdd = (()=>{const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`})();
```

- Hora HHmmss:

```javascript
const HHmmss = (()=>{const d=new Date();return `${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`})();
```

---

## Contenedorización

Containerfile incluido (base: `registry.access.redhat.com/ubi8/nodejs-24-minimal`).

Construir imagen:

```bash
podman build -f Containerfile -t tcpserver .
# o
docker build -f Containerfile -t tcpserver .
```

Ejecutar:

```bash
podman run --rm -p 3000:3000 -e FACTURA_MIN=1 -e FACTURA_MAX=10 tcpserver
```

---

## Descripción técnica de componentes

Resumen de responsabilidades y comportamientos por componente.

### 1) app.js
- Carga variables de entorno (dotenv) y arranca el servidor TCP.
- Lee `PORT`, `HOST` y demás variables de configuración.

### 2) servidor/models/server.js (TCPServer)
- Crea y gestiona el servidor TCP (`net.createServer()`).
- Maneja eventos globales (`connection`, `error`, `close`) y por socket (`data`, `drain`, `end`, `error`).
- Mantiene `connections` (Set) y asigna `clientId`.
- Al recibir datos crea `Transaccion(trama)` y escribe la respuesta al socket.
- Todas las tramas de respuesta tienen como delimitador el caracter `\x03` (End Of Text - EOT).

### 3) servidor/models/transaccion.js
- Parsea la trama entrante: instancia `Cabecera(trama.substring(0,58))` y guarda `this.datos = trama.substring(58)`.
- Enruta según `cabecera.tipoTransaccion`:
  - `0001` → consulta cliente (fijo) → respuesta `1001` + cliente fijo.
  - `9001` → consulta cliente (variable) → respuesta `9101` + cliente variable.
  - `0002` → consulta factura (fijo) → respuesta `2002` + factura fija.
  - `9002` → consulta factura (variable) → respuesta `9202` + factura variable.
  - default → marca error (`codigoRespuesta = '9999'` o similar) y devuelve cabecera + datos sin procesar.
- Recomendación: validar longitud mínima de la trama y datos antes de extractar campos; devolver cabecera con error si faltan datos.

### 4) servidor/models/*.js (modelos)
- `cabecera.js`: representa la cabecera (58 chars). `getTrama()` devuelve la cabecera formada.
- `cliente.js`: maneja ID (10 chars), `consultar()` genera datos con faker, `getTrama()` y `getTramaVariable()` devuelven payloads correspondientes. `getTramaVariable()` usa `withLenPrefix` para prefijos a 3 dígitos y evita mutar innecesariamente propiedades.
- `factura.js`: recibe NRO (17 chars), contiene `cliente` y `detalleItems`. `generarDetalle()` produce 10 items fijos; `generarDetalleVariable()` produce n items aleatorios entre `FACTURA_MIN` y `FACTURA_MAX` usando `crypto.randomInt`.
- `itemfactura.js`: representa un item; `getTrama()` devuelve 124 chars por item con formatos y paddings específicos.

### 5) Helpers
- `servidor/helpers/logger.js`: wrapper sobre log4js; nivel configurable por `LOG_LEVEL`.
- `servidor/helpers/util.js`:
  - `withLenPrefix(value, width = 3)`: normaliza, calcula longitud y devuelve `len.padStart(width,'0') + value`.
  - `delay(ms)` y lógica de delays aleatorios controlada por `DELAY_RANDOM_ENABLED`, `DELAY_MIN`, `DELAY_MAX`.

---

## Especificación detallada de campos y longitudes (actualizada)

Especificación precisa inferida del código. Offsets 0-based; longitudes en caracteres.

### A) Cabecera (común)
- Longitud total: 58 caracteres
- Campos:
  - 0:8  — `fecha` (YYYYMMDD) — 8
  - 8:6  — `hora` (HHmmss) — 6
  - 14:4 — `tipoTransaccion` — 4
  - 18:4 — `codigoRespuesta` — 4
  - 22:36 — `trxId` (uuid v4) — 36

Ejemplo (58 chars):

    2025111921570800019999aa93d406-9cb2-4e94-94ba-2b1897e97a55

### B) Trama de entrada (solicitud)
Formato general: `CABECERA(58)` + `DATOS(...)`

- `0001` — Consulta de cliente:
  - Datos esperados: ID cliente — 10 chars
  - Longitud mínima entrada: 58 + 10 = 68
  - ejemplo: `2025111921570800019999aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678`

- `9001` — Consulta de cliente (respuesta tamaño variable):
  - Datos esperados: ID cliente — 10 chars
  - Longitud mínima entrada: 58 + 10 = 68
  - ejemplo: `2025111921570890019999aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678`

- `0002` — Consulta de factura:
  - Datos esperados: NRO factura — 17 chars
  - Longitud mínima entrada: 58 + 17 = 75
  - ejemplo: `2025111921570800029999aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-000004743`
  
- `9002` — Consulta de factura (respuesta tamaño variable):
  - Datos esperados: NRO factura — 17 chars
  - Longitud mínima entrada: 58 + 17 = 75
  - ejemplo: `2025111921570890029999aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-000004743`

### C) Tramas de respuesta

Respuestas = `cabecera.getTrama()` (58) + payload.

1) Respuesta a `0001` (cliente fijo)
- Cabecera: `tipoTransaccion` → `1001`, `codigoRespuesta` → `0000`
- Payload: `Cliente.getTrama()` — 234 chars
  - Campos:
    - ID: 10
    - NOMBRE: 20
    - APELLIDO: 20
    - CELULAR: 14
    - DIRECCION: 100
    - CIUDAD: 20
    - EMAIL: 50
- Longitud total respuesta = 58 + 234 = 292
- Ejemplo: 
```plaintext
'2025111921570810010000aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678Benjamín            Borrego Urrutia       954 88 56 76Masía Gregorio 20                                                                                   Cartagena           Benjamin_BorregoUrrutia@hotmail.com               '
```

2) Respuesta a `9001` (cliente variable)
- Cabecera: `tipoTransaccion` → `9101`, `codigoRespuesta` → `0000`
- Payload: `Cliente.getTramaVariable()` — variable
  - Cada campo (salvo ID fijo de 10 chars) va precedido por prefijo de longitud de 3 dígitos (`NNN`).
- Ejemplo:
```plaintext
'2025111921570891010000aa93d406-9cb2-4e94-94ba-2b1897e97a551712345678003Ana016Montemayor Adame012999 56 95 60026Gran Subida Tomás Pagan, 6005Cádiz031Ana.MontemayorAdame87@gmail.com'
```

3) Respuesta a `0002` (factura fija)
- Cabecera: `tipoTransaccion` → `2002`, `codigoRespuesta` → `0000`
- Payload: `Factura.getTrama()` — 1491 chars
  - Desglose:
    - NRO: 17
    - CLIENTE: 234
    - DETALLE_ITEMS: 10 * 124 = 1240
- Longitud total respuesta = 58 + 1491 = 1549
- Ejemplo:
```plaintext
'2025111921570820020000aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-0000047434348696954Teresa              Uribe Delrío          987 20 11 01Terrenos Concepción Enríquez 2                                                                      Oviedo              Teresa_UribeDelrio@hotmail.com                    0001JVNSSCoche               Atún                0000000000018000000000000061390000000001105020000000000165750000000001270770002XRRIAMesa                Sopa                0000000000018000000000000024890000000000448020000000000067200000000000515220003DDWXYCamiseta            Pollo               0000000000017000000000000120590000000002050030000000000307500000000002357530004R075AOrdenador           Mesa                0000000000017000000000000062890000000001069130000000000160370000000001229500005LCF5VRaton               Pizza               0000000000015000000000000041850000000000627750000000000094160000000000721910006DMW3URaton               Guantes             00000000000100000000000000673900000000006739000000000001010900000000007749900074SD80Pizza               Coche               0000000000017000000000000192250000000003268250000000000490240000000003758490008LX1HTGorro               Salchichas          0000000000012000000000000111290000000001335480000000000200320000000001535800009V8WCGTeclado             Pescado             0000000000015000000000000196450000000002946750000000000442010000000003388760010M517LGuantes             Queso               000000000000400000000000008049000000000032196000000000004829000000000037025'
```

4) Respuesta a `9002` (factura variable)
- Cabecera: `tipoTransaccion` → `9202`, `codigoRespuesta` → `0000`
- Payload: `Factura.getTramaVariable()` — variable (NRO + cliente variable + detalle factura variable)
  - `generarDetalleVariable()` produce n items con `n = crypto.randomInt(min, max + 1)`.
- Ejemplo:
```plaintext
'2025111921570892020000aa93d406-9cb2-4e94-94ba-2b1897e97a55002-003-0000047437519508437009José Luis012Magaña Garay012967 06 65 41027Urbanización Rosa Solano, 7016Collado Villalba032JoseLuis.MaganaGaray@hotmail.com0011005TXGG5007Guantes007Guantes0041300003215004279500341900432140012005EM5GI007Guantes007Pescado00330000475090052252700433790052590600130059AZXP007Toallas007Guantes00370000494000056580000498700057567000140059SSOS009Bicicleta005Bacon004150000516715006250725005376090062883340015005PSTAY005Pollo005Silla00340000510290005411600046174005473340016005IGZNG007Toallas007Guantes004190000513169006250211005375320062877430017005TJVTS005Gorro007Toallas004140000510839006151746005227620061745080018005BOZZQ006Pelota010Salchichas00390000511509006103581005155370061191180019005FYDBG008Ensalada007Toallas0041500004741900611128500516693006127978002100059ZQIO005Bacon005Pizza003800005130390061043120051564700611995900211005K8BDS014Patatas fritas008Ensalada003100004864900486490041297004994600212005A8X0Q004Atún014Patatas fritas004150000434490055173500477600055949500213005JDVXF007Zapatos005Bacon003900005169090061521810052282700617500800214005GUWNR006Pelota005Coche003400005163850056554000498310057537100215005OFKOO005Bacon004Atún004130000422750052957500444360053401100216005T9YAM008Ensalada004Mesa0041100005164190061806090052709100620770000217005YPVZO010Pantalones007Teclado00370000453550053748500456230054310800218005QIPEO005Pizza007Toallas0034000051452900558116004871700566833'
```

### D) ItemFactura tamaño fijo (124 chars por item)
Campos, longitudes y tipo de dato:
- ORDEN (4) — texto
- CODIGO (5) — texto
- PRODUCTO (20) — texto
- PRODUCTO_NOMBRE (20) — texto
- CANTIDAD (15) — numérico
- PRECIO (15) — numérico
- SUBTOTAL (15) — numérico
- IVA (15) — numérico
- TOTAL (15) — numérico

Suma = 124 chars por item.

Formato numérico: valores con 2 decimales, punto eliminado, left-pad con ceros a 15 posiciones.

### E) ItemFactura tamaño variable
Campos, longitudes y tipo de dato:
- ORDEN (n) — texto
- CODIGO (n) — texto
- PRODUCTO (n) — texto
- PRODUCTO_NOMBRE (n) — texto
- CANTIDAD (n) — numérico
- PRECIO (1) — numérico
- SUBTOTAL (n) — numérico
- IVA (n) — numérico
- TOTAL (n) — numérico

Formato numérico: valores con 2 decimales, punto eliminado, sin padding.

Cada campo va precedido por prefijo de longitud de 3 dígitos. Ejemplo para un campo PRODUCTO_NOMBRE con valor "Atún": `004Atún`

### F) Errores / transacción no soportada
- Si `tipoTransaccion` desconocido: `cabecera.codigoRespuesta` marcado con `'9999'`.

### G) Resumen rápido de tamaños
- Entrada mínima consulta cliente: 68 chars
  - Respuesta `0001` (cliente campos tamaño fijo): 292 chars
  - Respuesta `9001` (cliente campos tamaño variable): variable

- Entrada mínima consulta factura: 75 chars
  - Respuesta `0002` (factura campos tamaño fijo): 1549 chars
  - Respuesta `9002` (factura campos tamaño variable): variable

---

## Variables de entorno relevantes

- PORT: puerto en que escucha el servidor TCP
- HOST: dirección del servidor
- LOG_LEVEL: nivel de log (ej. info, debug)
- FACTURA_MIN — mínimo items por factura (recomendado: entero >= 1)
- FACTURA_MAX — máximo items por factura (recomendado: entero >= FACTURA_MIN)
- DELAY_RANDOM_ENABLED: habilita delays aleatorios en respuestas (true/false)
- DELAY_MIN: tiempo mínimo de delay (en ms)
- DELAY_MAX: tiempo máximo de delay (en ms)
- ASYNC: si true, maneja conexiones de forma asíncrona (default: false)

## Cambios recientes relevantes

### versión v1.1
- parsear variables numéricas con `parseInt(process.env.FACTURA_MIN, 10) || 1` en lugar de usar bitwise OR (`|`) para defaults.
- Corrección y mejoras en README.MD: 
  - Ejemplos de tramas de consulta de cliente y factura (tipos `9001` y `9002`) ahora correctamente etiquetados como "respuesta tamaño variable".
  - Mejora en especificación detallada de campos y longitudes actualizada para reflejar correctamente los formatos de tramas fijas y variables.
  - Corrección en ejemplos de respuestas variables en README.MD para reflejar el uso correcto de prefijos de longitud de 3 dígitos.

### versión v1.0
- getTramaVariable añade prefijos de longitud formateados a 3 dígitos (`padStart(3, '0')`) para cada campo; utilizable desde `servidor/helpers/util.js` (`withLenPrefix`).
- Mejor manejo de valores nulos/undefined y reducción de mutaciones de propiedades al generar tramas variables.
- `Factura.generarDetalleVariable()` usa `crypto.randomInt(min, max + 1)` para elegir número de items; rango controlado por `FACTURA_MIN` y `FACTURA_MAX`.
- Containerfile añadido (base: UBI NodeJS 24 minimal).
- Se proporcionan one-liners de utilidad para fecha (`yyyyMMdd`) y hora (`HHmmss`).




