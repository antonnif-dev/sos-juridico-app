export class ApiError extends Error {
  constructor(message: string, public status = 0, public code = '', public fields: Record<string, string> = {}) { super(message); }
}
export function requestTimeout(value=20000){if(!Number.isInteger(value)||value<1000||value>180000)throw new ApiError('Tempo de solicitação inválido.');return value;}
export function endpoint(base: string, path: string) {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\#]/.test(path)) throw new ApiError('Destino de API inválido.');
  const url = new URL(base + path);
  const root = new URL(base);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname + '/')) throw new ApiError('Destino de API inválido.');
  return url.toString();
}
type Dependencies = { baseUrl: string; token: () => Promise<string>; fetcher?: typeof fetch; onFailure?: (error: ApiError) => void };
export function createApi({ baseUrl, token, fetcher = fetch, onFailure }: Dependencies) {
  return async function request<T>(path: string, options: { method?: 'GET'|'PUT'|'POST'|'PATCH'|'DELETE'; body?: unknown; idempotencyKey?: string; timeoutMs?: number; signal?: AbortSignal } = {}): Promise<T> {
    const url = endpoint(baseUrl, path);
    if(options.idempotencyKey!==undefined&&!/^[A-Za-z0-9_-]{16,128}$/.test(options.idempotencyKey))throw new ApiError('Chave de operação inválida.');
    const timeoutMs=requestTimeout(options.timeoutMs);
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, timeoutMs);
    try {
      const idToken = await token();
      if (controller.signal.aborted) throw new ApiError('A solicitação foi interrompida.');
      const response = await fetcher(url, {
        method: options.method || 'GET', signal: controller.signal,
        headers: { Authorization: `Bearer ${idToken}`, Accept: 'application/json', ...(options.idempotencyKey?{'Idempotency-Key':options.idempotencyKey}:{}), ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      });
      const text = await response.text();
      let data: Record<string, unknown> = {};
      try { data = text ? JSON.parse(text) : {}; } catch { throw new ApiError('A API não retornou JSON. Confira a URL terminada em /api.', response.status); }
      if (!response.ok) {
        const error = new ApiError(typeof data.error === 'string' ? data.error : 'Não foi possível concluir a solicitação.', response.status, typeof data.code === 'string' ? data.code : '', (data.fields || {}) as Record<string,string>);
        onFailure?.(error);
        throw error;
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(controller.signal.aborted ? 'A conexão demorou demais ou foi interrompida. Tente novamente.' : 'Não foi possível conectar. Confira sua internet e o endereço do backend.');
    } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); }
  };
}
