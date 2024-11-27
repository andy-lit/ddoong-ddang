/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const location = new window.naver.maps.LatLng(37.5566, 126.924); // 홍대 우주정거장 좌표
      const mapOptions = {
        center: location,
        zoom: 17,
      };
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);

      // 마커 추가
      new window.naver.maps.Marker({
        position: location,
        map: map,
      });
    };

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div ref={mapRef} className="w-full h-[200px] rounded-lg" />;
}
