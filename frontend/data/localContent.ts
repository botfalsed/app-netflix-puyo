import { BaseDatosRaw } from './drop';

export interface LocalItem {
  id: number;
  titulo: string;
  genero: string;
  ano: number;
  imagen: string;
  url: string;
  descripcion: string;
}

// Convierte un enlace de compartición de Dropbox en un enlace directo de contenido
export function toDropboxRawUrl(shareUrl: string): string {
  try {
    const clean = shareUrl.trim();
    const url = new URL(clean);
    // Fuerza entrega directa del archivo; útil para players y descargas
    url.searchParams.set('dl', '1');
    // Reemplaza host de página por host de contenido
    const asString = url.toString().replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    return asString;
  } catch {
    return shareUrl;
  }
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x450?text=Sin+imagen';

function sanitizeItem(raw: any, index: number): LocalItem {
  return {
    id: typeof raw.id === 'number' ? raw.id : index + 1,
    titulo: String(raw.titulo ?? '').trim(),
    genero: String(raw.genero ?? 'Sin género'),
    ano: Number(raw.ano ?? 0),
    imagen: String(raw.imagen ?? PLACEHOLDER_IMAGE).trim(),
    url: toDropboxRawUrl(String(raw.url ?? '').trim()),
    descripcion: String(raw.descripcion ?? '').trim(),
  };
}

export const BaseDatos: LocalItem[] = Array.from(BaseDatosRaw).map(sanitizeItem);