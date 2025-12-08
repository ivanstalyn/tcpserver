# Documentación del servidor TCP (varios-ismf/tcpserver)

Esta documentación describe el formato de las transacciones y cómo probar el servidor usando los ejemplos incluidos en este archivo.

## Resumen

El servidor acepta mensajes de transacción en una única línea de texto con formato fijo. Cada mensaje es una cadena numérica larga que representa diferentes campos concatenados. Los ejemplos provistos muestran dos tipos principales de transacción: consulta de cliente y consulta de factura.

## Ejemplos

Ejemplo de transacción de consulta de un cliente:

    2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936

Ejemplo de transacción de consulta de una factura:

    2025111921570800029999faf89fc4-22a8-43a9-9a69-ebf1ed95996470000000123


## Cómo probar localmente

1. Abrir un terminal y situarse en el directorio del proyecto:

```bash
cd ~/Documentos/desarrollo/varios-ismf/tcpserver
```

2. Enviar un mensaje de prueba al servidor (suponiendo que el servidor escucha en localhost:12345). Reemplace el puerto si es distinto.

```bash
# Ejemplo usando netcat (nc).
echo -n "2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936" | nc localhost 12345
```

3. Observar la respuesta del servidor en la consola o en los logs del proyecto.

Nota: Si no dispone de `nc`, puede usar `socat` u otra herramienta de cliente TCP.

## Mensajes de ejemplo para pruebas

- Consulta de cliente (ejemplo):

    2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936

- Consulta de factura (ejemplo):

    2025111921570800029999faf89fc4-22a8-43a9-9a69-ebf1ed95996470000000123

---


## Descripción técnica de componentes

Esta sección describe los componentes principales que integran la solución `tcpserver`, sus responsabilidades y cómo interactúan.

### 1) `app.js` (punto de entrada)

- Responsabilidad: Cargar variables de entorno y arrancar la instancia del servidor TCP.
- Comportamiento: Lee `PORT` y `HOST` desde `.env` (vía `dotenv`), instancia `TCPServer` y llama `start()`.

### 2) `servidor/models/server.js` (TCPServer)

- Responsabilidad: Crear y gestionar el servidor TCP, manejar conexiones y el ciclo de vida de sockets.
- Funcionalidades clave:
    - Crea el servidor TCP con `net.createServer()`.
    - Maneja eventos: `connection`, `error`, `close`.
    - Para cada socket: `data` (recibe trama), `drain`, `end`, `error`.
    - Mantiene `connections` (Set) y asigna un `clientId` incremental.
    - Al recibir `data` crea un objeto `Transaccion` y escribe la respuesta en el socket.

### 3) `servidor/models/transaccion.js` (Procesamiento de trama)

- Responsabilidad: Analizar la trama entrante, enrutar por tipo de transacción y generar la respuesta adecuada.
- Comportamiento:
    - Instancia `Cabecera` con los primeros 58 caracteres.
    - Extrae `datos` desde la posición 58 en adelante.
    - Según `cabecera.codigoTransaccion` ejecuta:
        - `0001` -> `getDatoscliente()` (genera trama de cliente y responde con código transacción `1001`).
        - `0002` -> `getDatosFactura()` (genera trama de factura y responde con código transacción `2002`).
        - default -> establece `codigoRespuesta = '5555'` y devuelve la cabecera+nulos.

### 4) Modelos de dominio (`servidor/models/*.js`)

- `cabecera.js`:
    - Representa los primeros 58 caracteres de la trama.
    - Campos: `fecha(8)`, `hora(6)`, `codigoTransaccion(4)`, `codigoRespuesta(4)`, `idTrx(36)`.
    - `getTrama()` devuelve la cabecera formateada (58 caracteres).

- `cliente.js`:
    - Representa la información del cliente.
    - Entrada: ID de cliente (10 caracteres) extraído desde la trama.
    - `consultar()` genera datos aleatorios con `@faker-js/faker` y construye una `trama` de 234 caracteres con campos: ID(10), NOMBRE(20), APELLIDO(20), CELULAR(14), DIRECCION(100), CIUDAD(20), EMAIL(50).

- `factura.js`:
    - Representa la factura.
    - Entrada: número de factura (10 caracteres).
    - Contiene un `cliente` (234 chars) y `detalleItems` con 10 `ItemFactura`.
    - `getTrama()` devuelve NRO(10) + CLIENTE(234) + DETALLE(1240) = 1484 caracteres.

- `itemfactura.js`:
    - Representa un item dentro de la factura.
    - Campos y longitudes fijas; `getTrama()` devuelve 124 caracteres por item.

### 5) Helpers

- `servidor/helpers/logger.js`:
    - Wrapper sobre `log4js` con niveles personalizados (`TRACE`, `DEBUG`, `INFO`, ...).
    - Permite cambiar el nivel desde `process.env.LOG_LEVEL`.
    - Provee funciones: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `mark`, `logCatch`.

- `servidor/helpers/util.js`:
    - Función `delay(ms)` que retorna una promesa y simula latencia.
    - Si `DELAY_RANDOM_ENABLED` está en `true`, usa `DELAY_MIN`/`DELAY_MAX` para calcular un retraso aleatorio.

### 6) Configuración y despliegue

- Variables de entorno principales (archivo `.env`):
    - `LOG_LEVEL` — nivel de logs (ej. TRACE, INFO).
    - `PORT` — puerto en el que escucha el servidor (ej. 9000).
    - `HOST` — host a escuchar (ej. 127.0.0.1).
    - `DELAY_RANDOM_ENABLED` — si se habilita delay aleatorio (`"true"`/`"false"`).
    - `DELAY_MAX`, `DELAY_MIN` — límites en ms para delay aleatorio.

- `container-compose.yml` expone `${PORT}` y pasa las variables de entorno a la imagen.

### 7) Dependencias principales

- En `package.json` las dependencias usadas en runtime:
    - `@faker-js/faker` — generación de datos de ejemplo.
    - `dotenv` — carga variables de entorno.
    - `log4js` — logging.
    - `uuid` — generación de uuidV4.

### 8) Flujo de una petición (resumen)

1. `app.js` arranca la aplicación.
2. `server.js` acepta una conexión TCP.
3. Cliente envía una `trama` en una línea.
4. `socket.on('data')` crea `Transaccion(trama)`.
5. `Transaccion` usa `Cabecera` para leer `codigoTransaccion` y enruta a `Cliente` o `Factura`.
6. Se genera una `trama` de respuesta y se escribe de vuelta al socket.


## Especificación detallada de campos y longitudes

La siguiente especificación recoge los campos y longitudes tal y como se infieren del código fuente (`cabecera.js`, `cliente.js`, `factura.js`, `itemfactura.js`, `transaccion.js`). Los offsets son 0-based y las longitudes son en caracteres (bytes si se usa ASCII/UTF-8 sin multibyte).

NOTA: El servidor trata las tramas como cadenas de texto con padding mediante espacios en algunos casos; los ejemplos iniciales están compuestos por dígitos.

### A) Cabecera (común a todas las tramas)
- Longitud total: 58 caracteres
- Campos (offset:longitud — descripción):
    - 0:8 — `fecha` (YYYYMMDD) — 8 chars
    - 8:6 — `hora` (hhmmss) — 6 chars
    - 14:4 — `tipoTransaccion` — 4 chars (ej. `0001`, `0002`)
    - 18:4 — `codigoRespuesta` — 4 chars (retorno; por ejemplo `0000` o `5555`)
    - 22:36 — `trxId` — 36 chars (identificador único de transacción uuidv4)

Ejemplo (58 chars):

    20251119 215708 0001 9999 faf89fc4-22a8-43a9-9a69-ebf1ed959964

### B) Trama de entrada (solicitud)

Las tramas de entrada contienen la cabecera (58 chars) seguida de los datos específicos de la transacción.

- Formato general: `CABECERA(58)` + `DATOS(...)`

- Para los tipos soportados en el código:
    1) Transacción `0001` — Consulta de cliente
         - Datos esperados: ID de cliente — 10 caracteres
         - Longitud mínima total de la trama de entrada: 58 + 10 = 68 caracteres
         - Ejemplo (entrada):

             2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936

         - Observación: en el ejemplo real hay dígitos adicionales al final; la implementación en `Transaccion` toma `this.datos = trama.substring(58)` y luego en `getDatoscliente()` usa `this.datos.substring(0, 10)` para construir el `Cliente`.

    2) Transacción `0002` — Consulta de factura
         - Datos esperados: Número de factura — 10 caracteres
         - Longitud mínima total de la trama de entrada: 58 + 10 = 68 caracteres
         - Ejemplo (entrada):

             2025111921570800029999faf89fc4-22a8-43a9-9a69-ebf1ed95996470000000123

         - Observación: `Transaccion` extrae los primeros 10 caracteres de `datos` para crear `Factura`.

### C) Tramas de respuesta

Las respuestas se construyen concatenando `cabecera.getTrama()` (58 chars) más la `trama` del modelo solicitado.

1) Respuesta a `0001` (cliente)
     - Cabecera en respuesta:
         - `codigoRespuesta` se fija a `0000` en caso de éxito.
         - `tipoTransaccion` se cambia a `1001` (código de respuesta para cliente).
     - Payload: `Cliente.getTrama()` — 234 caracteres.
         - Cliente detalle (campos y longitudes):
             - ID: 10
             - NOMBRE: 20
             - APELLIDO: 20
             - CELULAR: 14
             - DIRECCION: 100
             - CIUDAD: 20
             - EMAIL: 50
         - Total payload cliente = 234
     - Longitud total respuesta cliente = 58 (cabecera) + 234 = 292 caracteres

2) Respuesta a `0002` (factura)
     - Cabecera en respuesta:
         - `codigoRespuesta` se fija a `0000` en caso de éxito.
         - `tipoTransaccion` se cambia a `2002` (código de respuesta para factura).
     - Payload: `Factura.getTrama()` — 1484 caracteres.
         - Detalle:
             - NRO: 10
             - CLIENTE: 234 (ver arriba)
             - DETALLE_ITEMS: 10 items * 124 chars = 1240
         - Total payload factura = 10 + 234 + 1240 = 1484
     - Longitud total respuesta factura = 58 (cabecera) + 1484 = 1542 caracteres

### D) Respuesta en caso de error o transacción no soportada

- Si `tipoTransaccion` no es reconocido, `Transaccion` establece `cabecera.codigoRespuesta = '5555'` y devuelve `cabecera.getTrama()` concatenada con `this.datos` (sin procesar).
- Longitud: 58 + longitud de `datos` (dependiente de la entrada). Si la entrada solo lleva 10 bytes de `datos`, la respuesta será 68 caracteres.

### E) Resumen de tamaños

- Trama de entrada mínima (ambos tipos): 68 chars (58 cabecera + 10 dato clave)
- Respuesta `0001` (cliente): 292 chars
- Respuesta `0002` (factura): 1542 chars



