/* eslint-disable @next/next/no-img-element */
"use client";

import "swiper/css/autoplay";
import "swiper/css/bundle";
import { Autoplay, Pagination } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { userInfo } from "./userInfo";
import { musicInfo } from "./music-info";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative ">
      <div className="flex justify-center items-center h-screen bg-white ">
        <div
          className="relative  bg-white
          
          sm:w-[390px] sm:h-[844px] sm:border-8  sm:border-gray-800 overflow-x-hidden overflow-y-auto   transition-all ease-in-out sm:rounded-[55px]
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

          <div className="text-2xl mt-8 mb-6 font-bold text-center">
            뚱땅뚱땅 밴드 첫공연
          </div>

          <div className="mt-2 text-center flex items-center justify-between w-full px-4 text-lg text-gray-600 gap-2">
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
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center justify-between w-full gap-2 px-4 text-lg text-gray-600">
            <span className=" mt-2 text-center ">홍대 우주정거장</span>
            <div className="flex items-center rounded-sm gap-2">
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
                  className="w-6 h- rounded-sm"
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
                className="flex items-center gap-1 rounded-sm text-sm mt-1 hover:text-yellow-500 cursor-pointer"
              >
                <img
                  src="https://play-lh.googleusercontent.com/pPTTNz433EYFurg2j__bFU5ONdMoU_bs_-yS2JLZriua3iHrksGP6XBPF5VtDPlpGcW4"
                  alt="카카오 지도"
                  className="w-6 h-6 rounded-sm"
                />
              </a>
            </div>
          </div>
          {/* <div className="p-4">
            <NaverMap />
          </div> */}

          <div className="text-lg mt-12 px-4 mb-2">SESSION</div>
          <div className="flex flex-col px-4 items-start justify-center">
            {userInfo.map((user, idx) => (
              <div
                key={user.name + idx}
                className="flex items-center w-full justify-between gap-4 mb-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-16 h-16 rounded-md"
                  />

                  <div className="flex flex-col justify-between h-full">
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-500">{user.session}</div>
                  </div>
                </div>
                <div>
                  <a
                    href={`instagram://user?username=${user.instagram}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const instagramUrl = /Android|iPhone|iPad|iPod/i.test(
                        navigator.userAgent
                      )
                        ? `instagram://user?username=${user.instagram}`
                        : `https://instagram.com/${user.instagram}`;
                      window.location.href = instagramUrl;
                    }}
                    className="hover:text-pink-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="currentColor"
                      strokeWidth={0.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-lg mt-12 px-4 mb-2">PLAYLIST</div>
          <div className="flex flex-col px-4 items-start justify-center">
            {musicInfo.map((music, idx) => (
              <div
                key={music.title + idx}
                className="flex items-center w-full justify-between gap-4 mb-2"
              >
                <div>
                  <img
                    src={music.imageUrl}
                    alt={music.title}
                    className="w-16 h-16 rounded-md"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end justify-between h-full">
                    <div>
                      {music.title} - {music.artist}
                    </div>
                    <div className="text-sm text-gray-500">
                      {music.sessions.join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="fixed bottom-0 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[390px] sm:py-6 py-4 bg-black text-white sm:rounded-b-[55px]">
            참가 신청하기
          </button>

          <div className="h-16"></div>
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
