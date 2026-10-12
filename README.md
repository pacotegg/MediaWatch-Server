# MediaWatch Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Platform: Windows | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0078D6.svg)](https://github.com/pacotegg/MediaWatch-Server/releases)
[![Electron](https://img.shields.io/badge/Electron-34%2B-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-26%2B-green.svg)](https://nodejs.org/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com/pacotegg)

[English](README.md) · [Español](README.es.md)

> ☕ **Enjoying MediaWatch Server?** If you'd like to support ongoing development, you can [buy me a coffee on Ko-fi](https://ko-fi.com/pacotegg) or use the **Sponsor** button above!

**MediaWatch Server** is a standalone, self-hosted streaming server for **Windows and Linux**. It turns your PC, mini-PC, or home server into a private streaming hub for your movies and TV shows — no cloud accounts, no subscription paywalls, and no telemetry.

I built this desktop wrapper using **Electron** around the core [Media Watch](https://github.com/pacotegg/mediawatch) engine so anyone can get a personal streaming server running in minutes without dealing with Node.js setups, command lines, or manual service managers. It sits quietly in your system tray, includes an automatic TMDb metadata scraper (no existing `.nfo` files needed), and features a built-in QR code tool to pair your phone or tablet instantly.

---

## MediaWatch Ecosystem: How the two repositories work together

```text
 ┌──────────────────────────────────────────────────────────────┐
 │                MediaWatch Server (This Repository)           │
 │  Desktop Application · Windows (.exe) & Linux (AppImage/deb) │
 │  Tray icon · Setup wizard · QR code pairing · Bundled FFmpeg │
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

- **[MediaWatch Core](https://github.com/pacotegg/mediawatch)**: The engine powering the Fastify backend, web application, Samsung Tizen Smart TV app, and native Android app.
- **MediaWatch Server** (this repo): Packages the engine into ready-to-run desktop installers for Windows and Linux with bundled FFmpeg binaries and a simple setup wizard.

---

## Hardware Requirements

MediaWatch is designed to be lightweight. You don't need a high-end server; an inexpensive mini-PC or an old laptop handles it easily.

### 1. Direct Play Mode (Local network playback)
When your device (TV, phone, computer) natively supports the video format:
- **CPU**: Any 64-bit x86 processor (Intel Celeron N5105/J4125, Intel N100, or older desktop Core i3/i5).
- **RAM**: **2 GB minimum** (the application sits around ~150–250 MB in memory).
- **Storage**: ~400 MB for the app + 2 to 4 GB for posters, artwork cache, and metadata database.
- **Network**: Gigabit Ethernet or 5 GHz Wi-Fi recommended for 4K remuxes (50–90 Mbps).

### 2. Real-Time Hardware Transcoding (GPU Accelerated)
When transcoding is required (burned subtitles, streaming outside home, or unsupported codecs):
- **Intel (Recommended / best efficiency)**:
  - 7th Gen Core (Kaby Lake, 2017+) or newer with **Intel UHD / HD 600+** graphics. Budget chips like **Intel N100 / N95 / N200** transcode 4K HDR effortlessly using **Quick Sync (QSV)**.
  - Dedicated **Intel Arc** GPUs (A310, A380, A750, A770).
- **NVIDIA**:
  - GeForce **GTX 1050 or higher**, GTX 1650/1660, or any **RTX series** (20xx/30xx/40xx/50xx) with NVENC support.
- **AMD**:
  - Ryzen APUs with Vega / RDNA integrated graphics, or dedicated Radeon RX 400 series or newer (AMF support).
- **RAM**: **4 GB or more**.

### 3. Software Transcoding (CPU Only, without GPU)
- **CPU**: 4 cores / 8 threads minimum for real-time 1080p transcoding.  
  *(Honest note: Transcoding 4K HDR on CPU will pin all cores to 100% and will likely buffer; use hardware acceleration for 4K).*

---

## Hardware Transcoding: H.264 & HEVC / x265

MediaWatch Server supports GPU-accelerated transcoding in both **H.264** and **HEVC (H.265)**:

- **Intel Quick Sync**: `h264_qsv` & `hevc_qsv` (native 10-bit HDR with `vpp_qsv` hardware tonemapping).
- **NVIDIA NVENC**: `h264_nvenc` & `hevc_nvenc`.
- **AMD AMF**: `h264_amf` & `hevc_amf`.
- **CPU Fallback**: `libx264` & `libx265`.

### Which transcode codec should you pick?
- **H.264 (Default)**: Plays everywhere. Every browser (Firefox on Windows/Linux, Chromium browsers without HEVC licenses, old laptops) supports H.264 without black screens.
- **HEVC / H.265**: Reduces bandwidth by ~40–50% at identical visual quality and handles 10-bit HDR natively. Recommended if your primary clients are the Android app, Samsung Smart TV, or browsers with native HEVC hardware decoding.
- Toggle between them anytime in **Settings &rarr; Transcoding &rarr; Transcode Codec**.

---

## Key Features

- **Silent System Tray Operation**: Lives next to your clock on Windows or in your Linux system bar. Right-click for quick controls.
- **First-Run Wizard**: Point to your movie and series folders with a native file dialog.
- **Safe with your files**: MediaWatch Server **never renames, moves, or touches** your source video files or directories.
- **Automatic TMDb Metadata Scraper**: Cleans scene release tags (e.g. `1080p.BluRay.x264-GRP`), identifies the title and year, and downloads official artwork, plot summaries, cast, and episode info from [The Movie Database (TMDb)](https://themoviedb.org).
- **Instant Mobile Pairing via QR Code**: Right-click the tray icon &rarr; *«Connect mobile or tablet»*, scan the QR code with your phone camera, and start streaming immediately on your local network.
- **Full Multi-Device Ecosystem**:
  - **Web Client / PWA**: React 19 interface with hero trailer banners, interactive 3D steelbook viewer, and seamless audio/subtitle track switching.
  - **Android (Phone / Tablet / Google Cast)**: Native Jetpack Compose & Media3 client (available in the core [MediaWatch repository](https://github.com/pacotegg/mediawatch)).
  - **Samsung Smart TV (Tizen)**: Smooth 60 FPS remote-control D-pad spatial navigation with customizable grab-and-drop menus.

---

## Download & Installation

### Windows
1. Go to **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** and download `MediaWatch-Server-Setup.exe`.
2. Run the installer and follow the 3-step setup wizard.

> [!NOTE]
> **Windows SmartScreen Notice**:  
> Because MediaWatch Server is an independent open-source project without a costly commercial code-signing certificate, Windows Defender SmartScreen may show a prompt saying *«Windows protected your PC»*.  
> 
> To proceed, click **«More info»** and then click **«Run anyway»**. The code is completely open-source and auditable under the GNU AGPL v3 license.

### Linux
1. Go to **[Releases](https://github.com/pacotegg/MediaWatch-Server/releases/latest)** and download the package for your distro:
   - **AppImage** (universal, runs on any modern Linux distribution):
     ```bash
     chmod +x MediaWatch-Server-*.AppImage
     ./MediaWatch-Server-*.AppImage
     ```
     *Note on Ubuntu 22.04+, Debian 12, and Fedora*: make sure `libfuse2` is installed:
     ```bash
     sudo apt install libfuse2
     ```
   - **DEB Package** (Debian, Ubuntu, Linux Mint):
     ```bash
     sudo dpkg -i mediawatch-server_*_amd64.deb
     ```

#### GPU Acceleration on Linux:
- **Intel QSV**: Install the non-free media drivers (`sudo apt install intel-media-va-driver-non-free vainfo`) and ensure your user is in the `video` and `render` groups (`sudo usermod -aG render,video $USER`).
- **NVIDIA NVENC**: Install official proprietary drivers (`nvidia-driver-xxx`).

---

## Organizing Your Media Files

MediaWatch matches movies and shows using **title and release year**:

```text
Movies/Blade Runner (1982)/Blade Runner (1982).mkv
Movies/The Matrix (1999)/The Matrix (1999).mkv
Shows/Breaking Bad (2008)/Season 01/Breaking Bad - S01E01.mkv
Shows/Friends (1994)/Season 01/Friends - S01E01.mkv
```

Scene filenames like `The.Matrix.1999.1080p.BluRay.x264-GRP` are cleaned automatically. If any title is ambiguous, it appears under **Settings &rarr; Metadata &rarr; Pending Review** so you can confirm the right match with a single click.

---

## System Tray Shortcuts

Right-clicking the tray icon provides instant shortcuts:
1. **Open MediaWatch in Browser**: Opens the web player at `http://localhost:8730`.
2. **Copy Local Network URL**: Copies your LAN address (e.g. `http://192.168.1.50:8730`) to paste into Smart TVs or mobile devices.
3. **Connect Mobile or Tablet (QR Code)**: Pops up a high-contrast QR code for instant phone pairing.
4. **Start with Windows / System Login**: Toggles automatic launch on system boot.
5. **Open Data and Logs Folder**: Direct shortcut to `%APPDATA%\MediaWatchServer\data` (or `~/.config/MediaWatchServer/data` on Linux).
6. **Restart / Start / Quit**: Manage the server process cleanly without terminal windows.

---

## Support the Project

If you enjoy using MediaWatch Server and want to support its ongoing development, you can [buy me a coffee on Ko-fi](https://ko-fi.com/pacotegg). Every contribution is deeply appreciated!

---

## License

MediaWatch Server is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**. See [LICENSE](LICENSE) for details.