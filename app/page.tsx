/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import "swiper/css/autoplay";
import "swiper/css/bundle";
import { Autoplay, Pagination } from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import { userInfo } from "./userInfo";
import { musicInfo } from "./music-info";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase";

// music.youtubeUrl이 전체 URL인 경우 (예: https://youtube.com/watch?v=abcd1234)
// ID만 추출하는 함수를 만듭니다

interface RegisteralInfo {
  id: string;
  name: string;
  phone: string;
  referrer: string;
  companions: number;
  confirmed: boolean;
}

const STORAGE_KEY = "STORAGE_KEY";
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
};

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const playerRefs = useRef<{ [key: string]: HTMLIFrameElement }>({});
  const formRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "010",
    referrer: "",
    companions: 1,
    hasCompanions: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const storedInfo = localStorage.getItem(STORAGE_KEY);
    if (storedInfo) {
      supabase
        .from("registrations")
        .select("*")
        .eq("id", JSON.parse(storedInfo).id)
        .then(({ data }) => {
          const registrationInfo = data?.[0];
          if (!registrationInfo) return;
          setFormData(registrationInfo);
          setIsConfirmationVisible(true);
          setConfirmed(registrationInfo.confirmed);
          setHasStoredData(Boolean(registrationInfo.id));
        });
    }
  }, []);

  useEffect(() => {
    if (!submitButtonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(submitButtonRef.current);

    return () => observer.disconnect();
  }, []);

  const togglePlay = (youtubeId: string) => {
    const player = playerRefs.current[youtubeId];
    if (player) {
      // 현재 선택된 비디오의 상태를 토글하기 전에 모든 비디오를 중지
      Object.keys(playerRefs.current).forEach((id) => {
        if (id !== youtubeId) {
          playerRefs.current[id].contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "pauseVideo",
            }),
            "*"
          );
        }
      });

      // 선택된 비디오 재생/중지
      player.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: isPlaying[youtubeId] ? "pauseVideo" : "playVideo",
        }),
        "*"
      );

      // 모든 비디오의 상태를 false로 설정하고 현재 비디오만 토글
      setIsPlaying((prev) => {
        const newState = Object.keys(prev).reduce(
          (acc: { [key: string]: boolean }, key) => {
            acc[key] = false;
            return acc;
          },
          {}
        );
        newState[youtubeId] = !prev[youtubeId];
        return newState;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { hasCompanions, ...body } = formData;
      const { data, error } = await supabase
        .from("registrations")
        .insert([body])
        .select("*");

      if (error) throw error;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data[0]));
      setIsConfirmationVisible(true);
      setHasStoredData(true);

      alert("신청이 완료되었습니다!");
    } catch (error) {
      console.error(error);
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { hasCompanions, ...body } = formData;
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("name", formData.name)
        .eq("phone", formData.phone);

      if (error) throw error;
      const userInfo = data?.[0];
      if (!userInfo)
        return window.alert("입력하신 정보로 참가신청한 내역을 찾을 수 없어요");

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
      // setIsConfirmationVisible(true);
      setHasStoredData(true);

      // alert("신청이 완료되었습니다!");
    } catch (error) {
      console.error(error);
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 숫자를 형식에 맞게 변환
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    // 최대 13자리로 제한 (010-1234-5678 형식)
    if (formatted.length <= 13) {
      setFormData((prev) => ({ ...prev, phone: formatted }));
    }
  };

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
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
              stopOnLastSlide: true,
            }}
            className="w-[100vw] h-[70vh] sm:w-[390px] sm:h-[60vh] z-2"
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

          <div className="mt-2 text-center flex items-center justify-between w-full px-4 text-md text-gray-600 gap-2">
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
          <div className="flex items-center justify-between w-full gap-2 px-4 text-md text-gray-600">
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
                    src={`/${user.name}.png`}
                    alt={user.name}
                    className="w-16 h-16 rounded-md"
                  />

                  <div className="flex flex-col justify-between h-full">
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-500">{user.session}</div>
                  </div>
                </div>
                <div>
                  <button
                    // href={`instagram://user?username=${user.instagram}`}
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
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-row items-center justify-between mt-12 px-4 mb-2">
            <div className="text-lg ">PLAYLIST</div>
            <div className=" font-light text-xs  ">
              재생까지 조금 시간이 걸릴 수 있어요
            </div>
          </div>
          <div className="flex flex-col px-4 items-start justify-center">
            {musicInfo.map((music, idx) => (
              <div
                key={music.title + idx}
                className="flex items-center w-full justify-between gap-4 mb-2"
              >
                <div className="relative">
                  <img
                    src={music.imageUrl}
                    alt={music.title}
                    className="w-16 h-16 rounded-md"
                  />
                  <button
                    onClick={() => togglePlay(music.youtubeUrl)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md hover:bg-opacity-50 transition-all"
                  >
                    {isPlaying[music.youtubeUrl] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-8 h-8"
                      >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-8 h-8"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <iframe
                    ref={(el) => {
                      if (el) playerRefs.current[music.youtubeUrl] = el;
                    }}
                    src={`https://www.youtube.com/embed/${music.youtubeUrl}?enablejsapi=1`}
                    className="hidden"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm flex flex-col items-end justify-between h-full">
                    <div className="">{music.title}</div>
                    <div className="text-sm text-gray-600 ">{music.artist}</div>
                    <div className="text-xs text-gray-400">
                      {music.sessions.join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedVideo && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setSelectedVideo(null)}
            >
              <div className="w-full h-full sm:w-[80%] sm:h-[60%] max-w-3xl p-4">
                <div className="relative pt-[56.25%] w-full h-0">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYoutubeId(
                      selectedVideo
                    )}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          <div className="text-lg mt-12 px-4 mb-2">NOTICE</div>
          <div className="flex flex-col px-4 items-start justify-center text-sm text-gray-600 mb-8 gap-2">
            <div>
              - 소중한 주말에 시간 내어주셔서 감사합니다. 최선을 다해 좋은 시간
              되실 수 있게 노력하겠습니다.
            </div>
            <div>
              - 다만 초보 밴드이니만큼 부족한 모습이 보이더라도 따뜻한 격려
              보내주시면 감사하겠습니다
            </div>
            <div>
              - 공연장 공간 확보 및 원활한 행사 진행을 위해{" "}
              <b>사전 신청한 인원만 입장이 가능</b>합니다.
            </div>
            <div>
              - 신청 가능일은 <b>12월 5일(목)부터 12월 8일(일)</b>까지입니다.
              신청 시 입력하는 정보가 틀리지 않도록, 정확하게 확인해주세요!
            </div>
            <div>
              - <b>공연 참여 확정의 절차로 5,000원</b> 입금 부탁드립니다. 1잔의
              Free Drink와 멋진 공연으로 돌려드리겠습니다
            </div>
            <div>
              - 공연이 종료된 후 해당 공간에서 <b>송년회겸 뒤풀이</b>를 진행할
              예정이니 모두 즐겁게 즐겨주세요
            </div>
            <div>
              - 오시는 순서대로 입장을 도와드릴 예정이며,{" "}
              <b>먼저 오시는 분들은 앉아서 관람</b>하실 수 있다는 고급정보를
              전달드립니다
            </div>
            <div>
              - 뚱땅뚱땅하게 예쁜 포스터를 만들어준{" "}
              <b>신정초등학교 5학년 9반 친구들</b>께 이 영광을 바칩니다.{" "}
              <span className="line-through">5959 예뻐라 자란다 자란다</span>
            </div>
          </div>

          <div ref={formRef} className="w-full px-4 pt-8 bg-gray-50">
            <div className="text-lg mb-2">
              {isConfirmationVisible ? "CHECK-IN" : "REGISTRATION"}
            </div>
            <form
              onSubmit={
                isConfirmationVisible ? handleCheckSubmit : handleSubmit
              }
              className="flex flex-col gap-4"
            >
              {isConfirmationVisible && hasStoredData ? (
                <>
                  <div>
                    <b>{formData.name}님</b>{" "}
                    {formData.companions > 0
                      ? `외 ${formData.companions}명 님의`
                      : ""}
                    참가 {confirmed ? "확정" : "신청"}이 완료 되었습니다!
                  </div>
                  {!confirmed ? (
                    <>
                      <img src="/qr.png" alt="QR Code" className="w-full" />
                      <button
                        className="w-full py-2 bg-black text-white"
                        onClick={() => {
                          window.open(
                            "https://qr.kakaopay.com/Ej8bOmDb69c409360",
                            "_blank"
                          );
                        }}
                      >
                        입금하기
                      </button>
                      <div className="text-sm text-gray-600 gap-2">
                        <div>
                          - 참여 확정을 위해 5,000원을 입금 부탁드립니다.{" "}
                          <span className="line-through">
                            후원의 의미로 더 주신다면, 그건 정말 감사합니다
                          </span>
                        </div>
                        <div>
                          - 위의 입금하기 버튼을 누르거나 QR 코드를 통해 입금을
                          완료해주세요!
                        </div>
                        <div>
                          - 입금 확인이 수동으로 이뤄지는 관계로 즉각 반영되지는
                          않지만, 공연날까지는 확정 안내문을 보실 수 있도록
                          할게요!
                        </div>
                        <div>
                          - 문제가 생길 경우 기재해주신 연락처로 연락을
                          드리겠습니다! 혹은 밴드 내 지인을 통해 연락드리도록
                          하겠습니다!
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 gap-2">
                      <div>
                        - 입금이 확인되어, <b>참여 확정</b>이 되셨습니다!
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      이름이 어떻게 되세요?
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="이름을 입력해주세요"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      전화번호가 어떻게 되세요?
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="p-2 border rounded"
                      required
                      maxLength={13}
                      pattern="[0-9]{3}-[0-9]{3,4}-[0-9]{4}"
                      title="전화번호 형식을 맞춰주세요 (예: 010-1234-5678)"
                    />
                  </div>
                </>
              )}

              {!isConfirmationVisible && (
                <>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="referrer"
                      className="text-sm font-medium text-gray-700"
                    >
                      누구의 지인이신가요?
                    </label>
                    <select
                      id="referrer"
                      value={formData.referrer}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          referrer: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                      required
                    >
                      <option value="">누구 지인이신가요?</option>
                      {userInfo.map((user) => (
                        <option key={user.name} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="hasCompanions"
                        type="checkbox"
                        checked={formData.hasCompanions}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            hasCompanions: e.target.checked,
                            companions: e.target.checked ? prev.companions : 0,
                          }));
                        }}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="hasCompanions"
                        className="text-sm font-medium text-gray-700"
                      >
                        동반인원이 있으신가요?(본인을 제외한 인원이 있을 경우)
                      </label>
                    </div>

                    {formData.hasCompanions && (
                      <div className="flex flex-col gap-1 ml-6">
                        <label
                          htmlFor="companions"
                          className="text-sm font-medium text-gray-700"
                        >
                          동반 인원 수(본인을 제외한 인원 수를 입력해주세요)
                        </label>
                        <input
                          id="companions"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={formData.companions}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              companions: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="p-2 border rounded"
                          required
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {isConfirmationVisible ? (
                hasStoredData ? null : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    ref={submitButtonRef}
                    className="p-3 bg-black text-white rounded disabled:bg-gray-400 mt-2"
                  >
                    {isSubmitting ? "제출 중..." : "신청결과 확인하기"}
                  </button>
                )
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  ref={submitButtonRef}
                  className="p-3 bg-black text-white rounded disabled:bg-gray-400 mt-2"
                >
                  {isSubmitting ? "제출 중..." : "신청하기"}
                </button>
              )}
            </form>
            <button
              className="text-center w-full text-gray-400 text-xs underline my-4"
              onClick={() => setIsConfirmationVisible(!isConfirmationVisible)}
            >
              {isConfirmationVisible
                ? "신청한 적이 없어요. 참가 신청을 할게요"
                : "이미 신청했고, 확정 여부를 보고 싶어요"}
            </button>
          </div>

          {!isFormVisible && (
            <button
              onClick={() =>
                formRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="fixed bottom-0 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[390px] sm:py-6 py-4 bg-black text-white sm:rounded-b-[55px]"
            >
              참가 신청하기
            </button>
          )}

          <div className="flex flex-col justify-center align-items font-light text-center text-xs py-4 ">
            <div>Copyright © 2024 DDOONG DDANG BAND.</div>
            <div> All rights reserved.</div>
          </div>
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
