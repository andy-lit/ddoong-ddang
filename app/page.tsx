/* eslint-disable @next/next/no-img-element */
"use client";

import "swiper/css/autoplay";
import "swiper/css/bundle";
import { Autoplay, Pagination } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative ">
      <div className="flex justify-center items-center h-screen bg-white ">
        <div
          className="relative  bg-white
          
          sm:w-[390px] sm:h-[844px] sm:border-8   sm:border-gray-800 overflow-x-hidden overflow-y-auto   transition-all ease-in-out sm:rounded-[55px]
          w-full h-full "
        >
          <Swiper
            modules={[Autoplay, Pagination]}
            pagination={{
              clickable: true,
            }}
            // autoplay={{
            //   delay: 3000,
            //   pauseOnMouseEnter: true,
            //   stopOnLastSlide: true,
            // }}
            className="w-[100vw] h-[65vh] sm:w-[390px] sm:h-[60vh] z-2"
          >
            {[1, 2, 3, 4, 5, 6, 7, 1].map((item, idx) => (
              <SwiperSlide key={item + idx}>
                <img
                  src={`/band${item}.png`}
                  className="h-full w-full  z-2"
                  alt={item.toString()}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="text-2xl mt-4 font-bold text-center">
            뚱땅뚱땅 밴드 첫공연
          </div>
          {/* <div className="flex flex-col text-gray-600">
            <div className="text-sm mt-2 text-center flex items-center justify-center gap-2">
              by. 관중, 승은, 유경
            </div>
            <div className="text-sm text-center flex items-center justify-center gap-2">
              진우, 현우, 수진, 바름
            </div>
          </div> */}
          <div className="text-sm mt-2 text-center flex items-center justify-center gap-2">
            2024년 12월 14일 오후 7시 30분
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const eventTitle = "뚱땅뚱땅 밴드 첫공연";
                const eventLocation = "홍대 우주정거장";
                const eventDate = "2024-12-14T19:30:00";

                // iOS의 경우
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  const encodedTitle = encodeURIComponent(eventTitle);
                  const encodedLocation = encodeURIComponent(eventLocation);
                  window.location.href = `calshow://?title=${encodedTitle}&location=${encodedLocation}&startdate=${eventDate}`;
                }
                // Android의 경우
                else if (/Android/i.test(navigator.userAgent)) {
                  const startTime = new Date(eventDate).getTime();
                  const endTime = startTime + 2 * 60 * 60 * 1000; // 2시간 후
                  window.location.href = `content://com.android.calendar/time/${startTime}?title=${encodeURIComponent(
                    eventTitle
                  )}&description=공연&location=${encodeURIComponent(
                    eventLocation
                  )}&begin=${startTime}&end=${endTime}`;
                }
              }}
              className="flex items-center gap-1 text-sm hover:text-blue-500 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm mt-2 text-center text-gray-600">
              @홍대 우주정거장
            </span>
            <a
              href="nmap://search?query=홍대 우주정거장&appname=뚱땅뚱땅밴드"
              onClick={(e) => {
                e.preventDefault();
                const naverMapUrl = /Android|iPhone|iPad|iPod/i.test(
                  navigator.userAgent
                )
                  ? "nmap://search?query=홍대 우주정거장&appname=뚱땅뚱땅밴드"
                  : "https://map.naver.com/p/search/홍대%20우주정거장";
                window.location.href = naverMapUrl;
              }}
              className="flex items-center gap-1 text-sm mt-1 hover:text-blue-500 cursor-pointer"
            >
              <img
                src="https://i.namu.wiki/i/g1ObOjgHeGx6qsTX-DgwrwyHL8uHBhXxiPQTCu9w5M32o0po4v1ugu_ikoEIncrVO-kq3Q73lCs8MzRgH55G2A.webp"
                alt="네이버 지도"
                className="w-5 h-5"
              />
            </a>
            <a
              href="kakaomap://search?q=홍대 우주정거장"
              onClick={(e) => {
                e.preventDefault();
                const kakaoMapUrl = /Android|iPhone|iPad|iPod/i.test(
                  navigator.userAgent
                )
                  ? "kakaomap://search?q=홍대 우주정거장"
                  : "https://map.kakao.com/?q=홍대 우주정거장";
                window.location.href = kakaoMapUrl;
              }}
              className="flex items-center gap-1 text-sm mt-1 hover:text-yellow-500 cursor-pointer"
            >
              <img
                src="https://play-lh.googleusercontent.com/pPTTNz433EYFurg2j__bFU5ONdMoU_bs_-yS2JLZriua3iHrksGP6XBPF5VtDPlpGcW4"
                alt="카카오 지도"
                className="w-5 h-5"
              />
            </a>
          </div>
          {/* <div className="p-4">
            <NaverMap />
          </div> */}

          {/* Dynamic Island */}
          <div className="hidden sm:block absolute top-3 z-[5] left-1/2 transform -translate-x-1/2 w-[130px] h-[30px] bg-black rounded-[30px] border border-gray-900 opacity-50" />

          {/* Gesture Bar */}
          <div className="hidden sm:block absolute bottom-3  z-[5] left-1/2 transform -translate-x-1/2 w-[140px] h-[5px] bg-black rounded-full" />
        </div>
      </div>
      {/* 

      <div className="absolute bottom-0 flex flex-col justify-center align-items font-light text-center text-xs pb-4">
        <div>Copyright © DDOONG DDANG BAND. All rights reserved.</div>
      </div> */}
    </main>
  );
}

{
  /* <div className="w-[390px] flex  items-center bg-gray-200 p-4 rounded-md sm:hidden mb-8 h-[160px]">
  <div className="bg-white p-2 border rounded-lg shadow-sm">
    <img src="/qr.png" alt="QR Code" className="w-32" />
  </div>
  <div className="flex flex-col  px-4">
    <p className="mt-4 text-center text-sm font-medium">
      릿 앱을 설치하고 인기 브랜드를 만나보세요
    </p>
    <p className="mt-4  text-center text-xs  text-gray-500">
      QR코드를 스캔하세요.
    </p>
  </div>
</div> */
}
{
  /* <div className="absolute left-1/2 translate-x-[240px] top-1/2  w-40 sm:flex flex-col items-center bg-gray-200 p-4 rounded-md hidden ">
  <div className="bg-white p-2 border rounded-lg shadow-sm">
    <img src="/qr.png" alt="QR Code" className="" />
  </div>
  <p className="mt-4 text-center text-sm font-medium">
    릿 앱을 설치하고 인기 브랜드를 만나보세요
  </p>
  <p className="mt-4 text-center text-xs  text-gray-500">
    QR코드를 스캔하세요.
  </p>
</div> */
}
