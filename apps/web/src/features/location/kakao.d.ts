declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number, options?: { animate?: boolean }): void;
    getLevel(): number;
    getBounds(): LatLngBounds;
  }

  interface MouseEvent {
    latLng: LatLng;
  }

  namespace event {
    function addListener(
      target: object,
      type: string,
      handler: (event: MouseEvent) => void,
    ): void;
    function removeListener(
      target: object,
      type: string,
      handler: (event: MouseEvent) => void,
    ): void;
  }

  interface CustomOverlayOptions {
    position: LatLng;
    content: string | HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class MarkerImage {
    constructor(src: string, size: Size);
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
    setImage(image: MarkerImage): void;
  }

  namespace services {
    interface RegionCodeResult {
      region_type: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    }

    const Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };

    class Geocoder {
      coord2RegionCode(
        lng: number,
        lat: number,
        callback: (result: RegionCodeResult[], status: string) => void,
      ): void;
    }
  }
}

interface Window {
  kakao: typeof kakao;
}
