// Safe API client helper that validates HTTP status, redirects, and Content-Type before parsing JSON

export class ApiClientError extends Error {
  status: number;
  isHtmlResponse: boolean;

  constructor(message: string, status = 0, isHtmlResponse = false) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.isHtmlResponse = isHtmlResponse;
  }
}

export async function postJson<TResponse>(url: string, payload: unknown): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    console.error('[API Network Error]', { url, error: networkErr });
    throw new ApiClientError(
      'No se pudo conectar con el servidor de inteligencia artificial. Verifica tu conexión e inténtalo nuevamente.',
      0,
      false
    );
  }

  // Handle auth/proxy redirect (e.g. session cookie refresh redirect to HTML auth bridge)
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    console.error('[API Unexpected Redirect]', {
      url,
      type: response.type,
      status: response.status,
      location: response.headers.get('location'),
    });
    throw new ApiClientError(
      'La sesión de la aplicación necesita renovarse. Recarga la página e inténtalo nuevamente.',
      response.status || 302,
      true
    );
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const rawText = await response.text();
  const trimmed = rawText.trim();
  const looksLikeHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<');

  if (looksLikeHtml) {
    console.error('[API Unexpected HTML Response]', {
      url,
      status: response.status,
      contentType,
      preview: trimmed.slice(0, 240),
    });

    if (response.status === 403) {
      throw new ApiClientError(
        'Acceso denegado por el servidor o proxy (HTTP 403). Recarga la página o verifica los permisos de la API Key en Settings > Secrets.',
        403,
        true
      );
    }

    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new ApiClientError(
        `El servidor está iniciando o temporalmente ocupado (HTTP ${response.status}). Espera un momento y vuelve a intentarlo.`,
        response.status,
        true
      );
    }

    throw new ApiClientError(
      `El servidor devolvió una respuesta HTML inesperada (HTTP ${response.status || 'sin estado'}) en lugar de JSON. Recarga la página e inténtalo de nuevo.`,
      response.status,
      true
    );
  }

  if (!trimmed) {
    console.error('[API Empty Response]', { url, status: response.status, contentType });
    throw new ApiClientError(
      `El servidor devolvió una respuesta vacía (HTTP ${response.status}). Intenta de nuevo en unos segundos.`,
      response.status,
      false
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (parseErr) {
    console.error('[API Invalid JSON Response]', {
      url,
      status: response.status,
      contentType,
      preview: trimmed.slice(0, 240),
      parseErr,
    });
    throw new ApiClientError(
      'La respuesta del servidor no tiene un formato JSON válido. Por favor intenta de nuevo.',
      response.status,
      false
    );
  }

  if (!response.ok) {
    const serverMessage =
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `Error del servidor (HTTP ${response.status}).`;

    console.error('[API Server Error]', {
      url,
      status: response.status,
      contentType,
      message: serverMessage,
    });
    throw new ApiClientError(serverMessage, response.status, false);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new ApiClientError('Formato de respuesta inesperado del servidor.', response.status, false);
  }

  return parsed as TResponse;
}
