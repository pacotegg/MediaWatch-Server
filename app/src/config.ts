import { app } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

export interface AppConfig {
  port: number;
  host: string;
  libraries: Array<{
    name: string;
    path: string;
    kind: 'movie' | 'show';
  }>;
  tmdbApiKey?: string;
}

export function getDataDir(): string {
  const dataDir = process.env.MEDIAWATCH_DATA_DIR || join(app.getPath('userData'), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

export function getConfigPath(): string {
  return join(getDataDir(), 'config.json');
}

export function loadConfig(): AppConfig {
  const file = getConfigPath();
  if (existsSync(file)) {
    try {
      const content = readFileSync(file, 'utf8');
      return JSON.parse(content);
    } catch {
      // Ignorar error de parseo y retornar config por defecto
    }
  }
  const defaultPort = parseInt(process.env.MEDIAWATCH_PORT || '8730', 10);
  return {
    port: defaultPort,
    host: '0.0.0.0',
    libraries: [],
  };
}

export function saveConfig(cfg: AppConfig): void {
  const file = getConfigPath();
  writeFileSync(file, JSON.stringify(cfg, null, 2), 'utf8');
}

// WSL, Docker, Hyper-V, VirtualBox/VMware y VPN (Tailscale, ZeroTier) crean interfaces con IPs
// que el móvil no alcanza; el QR y el enlace tienen que llevar la de la red doméstica.
const INTERFAZ_VIRTUAL = /vethernet|wsl|docker|hyper-v|virtualbox|vmware|vbox|tailscale|zerotier|loopback|podman|^veth|^br-|^virbr|^tun|^tap|^utun/i;

export function getLocalIP(): string {
  const candidatas: Array<{ ip: string; puntos: number }> = [];
  let cualquiera: string | undefined;
  for (const [name, lista] of Object.entries(os.networkInterfaces())) {
    for (const iface of lista || []) {
      if (iface.family !== 'IPv4' || iface.internal || iface.address.startsWith('169.254.')) continue;
      cualquiera ??= iface.address;
      if (INTERFAZ_VIRTUAL.test(name)) continue;
      const puntos = iface.address.startsWith('192.168.') ? 3 : iface.address.startsWith('10.') ? 2 : 1;
      candidatas.push({ ip: iface.address, puntos });
    }
  }
  candidatas.sort((a, b) => b.puntos - a.puntos);
  return candidatas[0]?.ip ?? cualquiera ?? 'localhost';
}
