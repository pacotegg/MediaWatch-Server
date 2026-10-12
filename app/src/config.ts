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
  return {
    port: 8730,
    host: '0.0.0.0',
    libraries: [],
  };
}

export function saveConfig(cfg: AppConfig): void {
  const file = getConfigPath();
  writeFileSync(file, JSON.stringify(cfg, null, 2), 'utf8');
}

export function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
