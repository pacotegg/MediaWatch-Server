# MediaWatch Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Platform: Windows | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0078D6.svg)](https://github.com/pacotegg/MediaWatch-Server/releases)
[![Electron](https://img.shields.io/badge/Electron-34%2B-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26%2B-green.svg)](https://nodejs.org/)

[English](README.md) · [Español](README.es.md)

**MediaWatch Server** is an all-in-one, self-hosted personal movie and TV series streaming server for **Windows and Linux**. It enables anyone to easily run and stream their personal media collection across local networks, web browsers, Smart TVs, and mobile devices — fully private, without subscriptions, cloud dependencies, or telemetry.

Designed as a lightweight desktop wrapper using **Electron** that bundles and runs the core engine of [Media Watch](https://github.com/pacotegg/mediawatch), featuring an unobtrusive system tray resident, a visual first-run setup wizard, and an automated name-based TMDb metadata scraper (no local `.nfo` files required).

---

## Key Features

- **Silent Background Execution**: Lives in your system tray (next to the clock on Windows or in your Linux panel). Your server stays active in the background ready for your TV, tablet, or phone.
- **Guided Setup Wizard**: Add and organize your movies and series libraries with simple folder pickers — zero manual JSON or YAML configuration needed.
- **Untouched Media Files**: MediaWatch Server **never** renames, moves, or deletes your source video files or directories.
- **Intelligent NFO-Free Scanner**: Automatically cleans scene release naming tags (e.g., `1080p.BluRay.x264-GRP`), detects movie titles and release years, and downloads official artwork, plots, cast, and episode details from [The Movie Database (TMDb)](https://themoviedb.org).
- **Universal Hardware Acceleration**: Seamless real-time video transcoding powered by your dedicated or integrated GPU:
  - **Intel**: Quick Sync Video (QSV) on Intel UHD Graphics, Iris Xe, and dedicated Intel Arc GPUs (`h264_qsv`).
  - **NVIDIA**: Hardware-accelerated NVENC for GeForce GTX and RTX graphics cards (`h264_nvenc`).
  - **AMD**: Hardware-accelerated AMF for Radeon GPUs (`h264_amf`).
  - **CPU**: Reliable universal software fallback (`libx264`).
- **Instant Mobile Pairing via QR Code**: Right-click the tray icon, click *«Connect mobile or tablet»*, and scan the generated QR code with your phone camera to stream immediately.
- **Full Multi-Device Ecosystem**:
  - **Web Client / PWA**: Responsive React 19 interface with hero trailer banners, interactive 3D steelbook viewer, and seamless audio/subtitle track switching.
  - **Android (Mobile / Tablet / Cast)**: Native Jetpack Compose & Media3 client with Google Cast integration (available in the core [MediaWatch repository](https://github.com/pacotegg/mediawatch)).
  - **Smart TV (Samsung Tizen / LG webOS)**: Optimized for 60 FPS remote-control D-pad spatial navigation.

---

## MediaWatch Ecosystem Architecture

```
 ┌──────────────────────────────────────────────────────────────┐
 │                MediaWatch Server (This Repository)           │
 │  Desktop Application · Windows (.exe) & Linux (AppImage/deb) │
 └──────────────────────────────┬───────────────────────────────┘
                                │ executes internally
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │             MediaWatch Core Engine (pacotegg/mediawatch)     │
 │        Fastify API Server · Streaming Transcoder · TMDb      │
 └──────┬───────────────────────┼───────────────────────┬───────┘
        │ serves                │ serves                │ serves
        ▼                       ▼                       ▼
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │  Web Client  │        │  Android App │        │   Smart TV   │
 │   React 19   │        │ Native Media3│        │ Samsung Tizen│
 └──────────────┘        └──────────────┘        └──────────────┘
```

- **[MediaWatch Core](https://github.com/pacotegg/mediawatch)**: The central open-source engine powering the Fastify backend, web application, Samsung Tizen Smart TV app, and native Android client.
- **MediaWatch Server** (this repo): Packages the core engine into a standalone desktop application with native system installers, bundled FFmpeg binaries, and an intuitive graphical setup interface.

---

## Organizing Your Media Files

MediaWatch Server automatically matches movies and shows using their **title and release year**. For optimal scraping accuracy, standard naming conventions are recommended:

```text
Movies\Blade Runner (1982)\Blade Runner (1982).mkv
Movies\The Matrix (1999)\The Matrix (1999).mkv
Shows\Breaking Bad (2008)\Season 01\Breaking Bad - S01E01.mkv
Shows\Friends (1994)\Season 01\Friends - S01E01.mkv
```

> **Tip**: If your filenames include scene tags such as `The.Matrix.1999.1080p.BluRay.x264-GRP`, the scanner cleans them automatically. Any ambiguous matches will be queued under **Settings &rarr; Metadata &rarr; Pending Review** so you can pick the exact match with a single click.

---

## System Tray Quick Controls

Right-clicking the MediaWatch Server tray icon provides instant shortcuts:
1. **Open MediaWatch in Browser**: Launches the web player in your default browser (`http://localhost:8730`).
2. **Copy Local Network URL**: Copies your local LAN address (e.g. `http://192.168.1.50:8730`) to paste into TV or mobile clients.
3. **Connect Mobile or Tablet (QR Code)**: Displays a popup with a high-contrast QR code for instant phone pairing.
4. **Start with Windows / System Login**: Toggles automatic startup when you log in.
5. **Open Data and Logs Folder**: Direct access to `%APPDATA%\MediaWatchServer\data` (or `~/.config/MediaWatchServer/data` on Linux).
6. **Restart / Start / Quit**: Manage the server process cleanly without opening terminal windows.

---

## Download & Installation

### Windows
1. Head over to **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** and download `MediaWatch-Server-Setup.exe`.
2. Run the downloaded installer.

> [!NOTE]
> **Windows SmartScreen Notice**:
> Because MediaWatch Server is an independent open-source project without a costly commercial code-signing certificate, Windows Defender SmartScreen may display the prompt:  
> *«Windows protected your PC»*.  
> 
> To proceed, click **«More info»** and then click the **«Run anyway»** button. The application is completely open-source and auditable under the GNU AGPL v3 license.

3. Follow the visual setup wizard to select your movie and series folders. Done!

### Linux
1. Head over to **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** and download the package for your distribution:
   - **AppImage** (universal, works on any modern Linux distribution):
     ```bash
     chmod +x MediaWatch-Server-*.AppImage
     ./MediaWatch-Server-*.AppImage
     ```
   - **DEB Package** (Ubuntu, Debian, Linux Mint):
     ```bash
     sudo dpkg -i mediawatch-server_*_amd64.deb
     ```
2. The app will launch the setup wizard and minimize to your desktop notification area.

---

## Repository Structure

```text
MediaWatch-Server/
├── app/               # Electron desktop shell
│   ├── src/           # Main process, system tray, process supervisor & IPC
│   ├── wizard/        # First-run guided setup wizard HTML/CSS/JS
│   └── connect/       # Interactive mobile pairing QR code window
├── assets/            # App icons and graphics
├── core/              # Git submodule -> pacotegg/mediawatch (Fastify server & React web)
├── scripts/           # Portable binary preparation tools
├── LICENSE            # GNU AGPL v3.0 License
└── package.json       # Electron packaging & electron-builder configuration
```

---

## Local Development & Building from Source

### Prerequisites
- Windows 10/11 or modern Linux distribution (Ubuntu 22.04+)
- [Node.js](https://nodejs.org) v22+ (v26 recommended)
- Git with submodule recursion enabled:
  ```bash
  git clone --recurse-submodules https://github.com/pacotegg/MediaWatch-Server.git
  ```

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   cd core && npm install && npm run build --workspace web && cd ..
   ```

2. Compile and run in development mode:
   ```bash
   npm run dev
   ```

3. Package desktop installer:
   - For Windows (`.exe` NSIS):
     ```bash
     npm run dist
     ```
   - For Linux (`.AppImage` & `.deb`):
     ```bash
     npm run dist:linux
     ```
   Packaged artifacts will be saved in the `release/` directory.

---

## License

MediaWatch Server is free and open-source software distributed under the terms of the **GNU Affero General Public License v3.0 (AGPLv3)**. See the [LICENSE](LICENSE) file for complete details.