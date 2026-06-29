'use client';

export type GeolocationErrorType =
  | 'unsupported'
  | 'insecure_context'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unknown';

const GEOLOCATION_ERROR_MESSAGES: Record<GeolocationErrorType, string> = {
  unsupported: '이 브라우저는 위치 정보를 지원하지 않아요.',
  insecure_context: '현재 접속 환경에서는 위치 권한을 사용할 수 없어요. HTTPS 또는 localhost에서 다시 시도해 주세요.',
  permission_denied: '위치 권한이 차단되어 있어요. 브라우저 사이트 설정에서 위치 권한을 허용해 주세요.',
  position_unavailable: '현재 위치를 확인하지 못했어요. 지도를 움직여 원하는 위치를 설정해 주세요.',
  timeout: '위치 확인 시간이 초과됐어요. 지도를 움직여 원하는 위치를 설정해 주세요.',
  unknown: '위치 정보를 확인하지 못했어요. 지도를 움직여 원하는 위치를 설정해 주세요.',
};

export class GeolocationAppError extends Error {
  type: GeolocationErrorType;

  constructor(type: GeolocationErrorType) {
    super(GEOLOCATION_ERROR_MESSAGES[type]);
    this.name = 'GeolocationAppError';
    this.type = type;
  }
}

export function createGeolocationError(type: GeolocationErrorType) {
  return new GeolocationAppError(type);
}

export function normalizeGeolocationError(error: unknown): GeolocationAppError {
  if (error instanceof GeolocationAppError) return error;

  if (error instanceof Error && error.message === 'GEOLOCATION_INSECURE_CONTEXT') {
    return createGeolocationError('insecure_context');
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = Number((error as { code: unknown }).code);

    if (code === 1) return createGeolocationError('permission_denied');
    if (code === 2) return createGeolocationError('position_unavailable');
    if (code === 3) return createGeolocationError('timeout');
  }

  return createGeolocationError('unknown');
}

export function getGeolocationErrorMessage(error: unknown): string {
  return normalizeGeolocationError(error).message;
}

export function getGeolocationErrorMessageByType(
  type: GeolocationErrorType | null | undefined,
): string {
  return GEOLOCATION_ERROR_MESSAGES[type ?? 'unknown'];
}

