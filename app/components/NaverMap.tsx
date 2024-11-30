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

      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5566, 126.924), // 임시 중심점
        zoom: 17,
      };
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);

      // 주소-좌표 변환 객체를 생성
      window.naver.maps.Service.geocode(
        {
          query: "홍대 우주정거장", // 검색할 주소
        },
        function (status: any, response: any) {
          if (status === window.naver.maps.Service.Status.ERROR) {
            return alert("검색 결과가 없습니다!");
          }

          const result = response.v2.addresses[0];
          const point = new window.naver.maps.Point(result.x, result.y);

          map.setCenter(point);
          // 마커 추가
          new window.naver.maps.Marker({
            position: point,
            map: map,
          });
        }
      );
    };

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.onload = initMap;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div ref={mapRef} className="w-full h-[200px] rounded-lg" />;
}
