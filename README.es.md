# MediaWatch Server

[![Licencia: AGPL v3](https://img.shields.io/badge/Licencia-AGPLv3-blue.svg)](LICENSE)
[![Plataformas: Windows | Linux](https://img.shields.io/badge/Plataformas-Windows%20%7C%20Linux-0078D6.svg)](https://github.com/pacotegg/MediaWatch-Server/releases)
[![Electron](https://img.shields.io/badge/Electron-34%2B-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26%2B-green.svg)](https://nodejs.org/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Invtame%20a%20un%20caf-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com/pacotegg)

[English](README.md) · [Español](README.es.md)

**MediaWatch Server** es una aplicación de servidor independiente para **Windows y Linux** que convierte tu PC, mini-PC o servidor casero en tu propio centro privado de streaming para películas y series — sin cuentas en la nube, sin suscripciones de pago y sin telemetría.

Empaqueté el motor de [Media Watch](https://github.com/pacotegg/mediawatch) dentro de esta aplicación de escritorio con **Electron** para que cualquiera pueda tener su servidor de streaming funcionando en un par de minutos, sin necesidad de pelearse con Node.js, terminales ni servicios de fondo. Vive tranquilamente en la bandeja del sistema (junto al reloj), descarga automáticamente las carátulas y sinopsis desde TMDb por nombre de archivo (sin obligarte a tener archivos `.nfo` previos) e incluye un código QR para conectar el móvil o la tablet al instante.

---

## Ecosistema MediaWatch: Cómo se complementan las dos aplicaciones

```text
 ┌──────────────────────────────────────────────────────────────┐
 │                MediaWatch Server (Este Repositorio)          │
 │  Aplicación de Escritorio · Windows (.exe) y Linux (.AppImage/deb) │
 │  Icono de bandeja · Asistente inicial · QR · FFmpeg incluido │
 └──────────────────────────────┬───────────────────────────────┘
                                │ ejecuta internamente
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             Motor Central MediaWatch (pacotegg/mediawatch)   │
 │        Servidor API Fastify · Transcodificador · TMDb        │
 └──────┬───────────────────────┼───────────────────────┬───────┘
        │ sirve a               │ sirve a               │ sirve a
        ▼                       ▼                       ▼
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │  Cliente Web │        │  App Android │        │   Smart TV   │
 │   React 19   │        │ Media3 nativo│        │ Samsung Tizen│
 └──────────────┘        └──────────────┘        └──────────────┘
```

- **[MediaWatch Core](https://github.com/pacotegg/mediawatch)**: El motor principal de código abierto que contiene la API Fastify, la aplicación web React 19, la app para Smart TV Samsung Tizen y la app nativa de Android.
- **MediaWatch Server** (este repositorio): Empaqueta ese motor en instaladores de escritorio listos para usar en Windows y Linux, con binarios portables de FFmpeg y un asistente visual muy sencillo.

---

## Requisitos de Hardware

MediaWatch está pensado para ser muy ligero. No necesitas un servidor caro ni componentes de gama alta; un mini-PC barato o un portátil antiguo rinden de sobra.

### 1. Modo Direct Play (Reproducción directa en red local)
Cuando el dispositivo que reproduce (Smart TV, móvil, tablet o PC) soporta el formato nativo del vídeo:
- **CPU**: Cualquier procesador x86 de 64 bits (Intel Celeron N5105/J4125, Intel N100, o cualquier Core i3/i5 de sobremesa antiguo).
- **RAM**: **2 GB mínimo** (la aplicación consume entre 150 y 250 MB en memoria).
- **Almacenamiento**: ~400 MB para la aplicación + 2 a 4 GB para carátulas, caché y la base de datos de metadatos.
- **Red**: Cable Ethernet Gigabit o Wi-Fi de 5 GHz recomendado para remuxes 4K de alto bitrate (50–90 Mbps).

### 2. Transcodificación por Hardware en tiempo real (GPU)
Cuando hace falta convertir el vídeo (subtítulos quemados, ver contenido fuera de casa con límite de subida o formatos no soportados por el cliente):
- **Intel (Recomendado / mayor eficiencia y calidad)**:
  - Procesadores Intel Core de 7ª generación (Kaby Lake, 2017+) o posterior con gráfica integrada **Intel UHD / HD 600+**. Mini-PCs económicos con **Intel N100 / N95 / N200** transcodifican 4K HDR a 1080p con soltura gracias a **Quick Sync (QSV)**.
  - Tarjetas gráficas dedicadas **Intel Arc** (A310, A380, A750, A770).
- **NVIDIA**:
  - GeForce **GTX 1050 o superior**, GTX 1650/1660, o cualquier tarjeta de la serie **RTX** (20xx/30xx/40xx/50xx) con chip NVENC.
- **AMD**:
  - APUs Ryzen con gráficos integrados Vega / RDNA, o tarjetas dedicadas Radeon RX 400 o superior (soporte AMF).
- **RAM**: **4 GB o más**.

### 3. Transcodificación por Software (Solo CPU, sin gráfica)
- **CPU**: Mínimo 4 núcleos / 8 hilos para transcodificar 1080p en tiempo real.  
  *(Aviso sincero: transcodificar 4K HDR por CPU pura pondrá todos los núcleos al 100% y dará tirones; para 4K se recomienda siempre usar aceleración por GPU).*

---

## Transcodificación por Hardware: H.264 y HEVC / x265

MediaWatch Server soporta aceleración gráfica tanto en **H.264** como en **HEVC (H.265)**:

- **Intel Quick Sync**: `h264_qsv` y `hevc_qsv` (HDR de 10 bits nativo con tonemapping por hardware `vpp_qsv`).
- **NVIDIA NVENC**: `h264_nvenc` y `hevc_nvenc`.
- **AMD AMF**: `h264_amf` y `hevc_amf`.
- **CPU (Fallback)**: `libx264` y `libx265`.

### ¿Qué códec de transcodificación elegir en Ajustes?
- **H.264 (Por defecto)**: Compatibilidad universal. Cualquier navegador (Firefox en Windows/Linux, navegadores Chromium sin licencias de HEVC, portátiles viejos) reproduce H.264 al instante sin pantallas negras.
- **HEVC / H.265**: Ahorra entre un 40% y un 50% de ancho de banda con la misma calidad visual y procesa HDR de 10 bits nativo por GPU. Ideal si tus clientes principales son la aplicación de Android, la Smart TV o navegadores con decodificación HEVC por hardware activa.
- Puedes cambiarlo en cualquier momento desde **Ajustes &rarr; Transcodificación &rarr; Códec de transcodificación**.

---

## Características Principales

- **Icono silencioso en la bandeja del sistema**: Vive junto al reloj en Windows o en la barra de tareas de Linux. Clic derecho para ver todos los accesos rápidos.
- **Asistente de configuración en 3 pasos**: Elige tus carpetas de películas y series con un selector de archivos visual.
- **Totalmente seguro con tus archivos**: MediaWatch Server **nunca renombra, mueve ni borra** tus archivos originales de vídeo.
- **Descarga automática de metadatos desde TMDb**: Limpia las etiquetas de la escena (tipo `1080p.BluRay.x264-GRP`), extrae el título y el año, y descarga pósteres oficiales, sinopsis, reparto y capítulos desde [The Movie Database (TMDb)](https://themoviedb.org).
- **Emparejamiento instantáneo con móvil por código QR**: Clic derecho en el icono &rarr; *«Conectar móvil o tablet»*, enfoca con la cámara de tu móvil y empieza a ver contenido de inmediato en tu red local.
- **Ecosistema multidispositivo**:
  - **Cliente Web / PWA**: Interfaz moderna en React 19 con tráilers de fondo, visor de steelbooks 3D y cambio fluido de pistas de audio y subtítulos.
  - **Android (Móvil / Tablet / Google Cast)**: App nativa en Jetpack Compose y Media3 (disponible en el [repositorio central](https://github.com/pacotegg/mediawatch)).
  - **Smart TV Samsung (Tizen)**: Navegación espacial ortogonal a 60 FPS con la cruceta del mando a distancia y menús reorganizables.

---

## Descarga e Instalación

### Windows
1. Ve a **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** y descarga `MediaWatch-Server-Setup.exe`.
2. Ejecuta el instalador y sigue el asistente.

> [!NOTE]
> **Aviso de Windows Defender SmartScreen**:  
> Como MediaWatch Server es un proyecto independiente y de código abierto sin un certificado comercial de pago (que cuestan cientos o miles de euros al año), Windows Defender SmartScreen puede mostrar el aviso:  
> *«Windows protegió su PC»*.  
> 
> Para continuar, pulsa en **«Más información»** y después en el botón **«Ejecutar de todas formas»**. El código es 100% auditable y libre bajo la licencia GNU AGPL v3.

### Linux
1. Ve a **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** y descarga el paquete para tu distribución:
   - **AppImage** (universal, ejecutable en cualquier distribución Linux moderna):
     ```bash
     chmod +x MediaWatch-Server-*.AppImage
     ./MediaWatch-Server-*.AppImage
     ```
     *Nota en Ubuntu 22.04+, Debian 12 o Fedora*: asegúrate de tener instalada la librería FUSE 2:
     ```bash
     sudo apt install libfuse2
     ```
   - **Paquete DEB** (Debian, Ubuntu, Linux Mint):
     ```bash
     sudo dpkg -i mediawatch-server_*_amd64.deb
     ```

#### Aceleración por GPU en Linux:
- **Intel QSV**: Instala los drivers de medios (`sudo apt install intel-media-va-driver-non-free vainfo`) y añade tu usuario a los grupos de vídeo y render (`sudo usermod -aG render,video $USER`).
- **NVIDIA NVENC**: Instala los drivers propietarios oficiales (`nvidia-driver-xxx`).

---

## Organización de los Archivos de Vídeo

MediaWatch identifica películas y series por el **título y el año**:

```text
Peliculas/Blade Runner (1982)/Blade Runner (1982).mkv
Peliculas/The Matrix (1999)/The Matrix (1999).mkv
Series/Breaking Bad (2008)/Temporada 01/Breaking Bad - S01E01.mkv
Series/Friends (1994)/Temporada 01/Friends - S01E01.mkv
```

Nombres complejos tipo `The.Matrix.1999.1080p.BluRay.x264-GRP` se limpian automáticamente. Si algún título resulta dudoso, aparecerá en **Ajustes &rarr; Metadatos &rarr; Pendientes de revisión** para confirmarlo con un solo clic.

---

## Accesos Rápidos desde la Bandeja del Sistema

Al hacer clic derecho en el icono de MediaWatch Server junto al reloj:
1. **Abrir MediaWatch en el navegador**: Abre el reproductor web en `http://localhost:8730`.
2. **Copiar URL de la red local**: Copia la dirección IP local (ej. `http://192.168.1.50:8730`) para pegarla en tu tele o móvil.
3. **Conectar móvil o tablet (código QR)**: Muestra una ventana con el código QR para escanearlo con el móvil.
4. **Iniciar con Windows / con el sistema**: Activa o desactiva el arranque automático al encender el ordenador.
5. **Abrir carpeta de datos y registros**: Acceso directo a `%APPDATA%\MediaWatchServer\data` (o `~/.config/MediaWatchServer/data` en Linux).
6. **Reiniciar / Detener / Salir**: Controla el servidor sin necesidad de abrir una consola de comandos.

---

## Apoya el proyecto

Si disfrutas de MediaWatch Server y quieres echarme una mano con el desarrollo continuo, puedes [invitarme a un café en Ko-fi](https://ko-fi.com/pacotegg). ¡Cualquier aportación se agradece un montón!

---

## Licencia

MediaWatch Server está publicado bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)**. Consulta el fichero [LICENSE](LICENSE) para más detalles.