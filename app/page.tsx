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
import { supabase } from "@/app/utils/supabase";

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
const FORM_DRAFT_KEY = "DDOONG_FORM_DRAFT";
const TRANSFER_BANK_NAME = "토스뱅크";
const TRANSFER_ACCOUNT_NO = "100081506475";
const TICKET_PRICE = 10000;
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
};

type MusicInfoItem = (typeof musicInfo)[number];
type PlayerState = "loading" | "playing" | "paused";

const downloadEventIcs = () => {
  const eventTitle = "뚱땅뚱땅 밴드 두번째 공연";
  const eventLocation = "클럽 라이브앤라우드";
  const start = new Date("2025-05-30T18:30:00+09:00");
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ddoong-ddang//KR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:ddoong-ddang-2025-05-30@litcorp.xyz`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${eventTitle}`,
    `LOCATION:${eventLocation}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ddoong-ddang.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function Home() {
  const [activeMusic, setActiveMusic] = useState<MusicInfoItem | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("paused");
  const [copiedTransferField, setCopiedTransferField] = useState<string | null>(null);

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const playerRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const formRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    referrer: "",
    companions: 0,
    hasCompanions: false,
    // 뒷풀이 참석여부
    joinParty: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    // URL에서 id 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get("id");

    // localStorage 확인
    const storedInfo = localStorage.getItem(STORAGE_KEY);

    // URL의 id나 localStorage 중 하나라도 있으면 데이터 조회
    if (urlId || storedInfo) {
      const id = urlId || (storedInfo ? JSON.parse(storedInfo).id : null);

      if (id) {
        supabase
          .from("registrations")
          .select("*")
          .eq("id", id)
          .then(({ data }) => {
            const registrationInfo = data?.[0];
            if (!registrationInfo) return;

            // localStorage에 저장
            localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationInfo));

            setFormData({
              ...registrationInfo,
              hasCompanions: registrationInfo.companions > 0,
            });
            setIsConfirmationVisible(true);
            setConfirmed(registrationInfo.confirmed);
            setHasStoredData(Boolean(registrationInfo.id));

            if (registrationInfo.confirmed) {
              // scorll down to end
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }
          });
        return;
      }
    }

    // 등록 정보가 없으면 입력 중이던 draft 복원
    const draft = localStorage.getItem(FORM_DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    }
  }, []);

  // 폼 입력값을 localStorage에 자동 저장 (등록 전에만)
  useEffect(() => {
    if (hasStoredData) return;
    const isEmpty =
      !formData.name &&
      !formData.phone &&
      !formData.referrer &&
      !formData.companions &&
      !formData.joinParty &&
      !formData.hasCompanions;
    if (isEmpty) return;
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(formData));
  }, [formData, hasStoredData]);

  useEffect(() => {
    if (!submitButtonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(submitButtonRef.current);

    return () => observer.disconnect();
  }, []);

  const getYoutubeEmbedSrc = (youtubeUrl: string) => {
    const params = new URLSearchParams({
      autoplay: "0",
      enablejsapi: "1",
      playsinline: "1",
      rel: "0",
    });

    if (typeof window !== "undefined") {
      params.set("origin", window.location.origin);
    }

    return `https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}?${params.toString()}`;
  };

  const sendPlayerCommand = (
    youtubeId: string,
    func: "playVideo" | "pauseVideo",
  ) => {
    playerRefs.current[youtubeId]?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args: [],
      }),
      "https://www.youtube.com",
    );
  };

  const requestPlay = (youtubeId: string) => {
    // 모바일에서는 iframe을 클릭 이벤트 안에서 새로 만들면 로드가 제스처보다 늦어져
    // 첫 playVideo가 막힐 수 있다. 그래서 iframe들은 미리 마운트해두고,
    // 사용자의 재생 버튼 클릭 이벤트 안에서 즉시 playVideo를 보낸다.
    sendPlayerCommand(youtubeId, "playVideo");
    [120, 350, 800].forEach((delay) => {
      window.setTimeout(() => {
        sendPlayerCommand(youtubeId, "playVideo");
      }, delay);
    });
  };

  const handleMusicClick = (music: MusicInfoItem) => {
    const youtubeId = getYoutubeId(music.youtubeUrl);
    const activeYoutubeId = activeMusic ? getYoutubeId(activeMusic.youtubeUrl) : null;

    if (activeYoutubeId === youtubeId) {
      if (playerState === "playing" || playerState === "loading") {
        sendPlayerCommand(youtubeId, "pauseVideo");
        setPlayerState("paused");
      } else {
        requestPlay(youtubeId);
        setPlayerState("playing");
      }
      return;
    }

    if (activeYoutubeId) {
      sendPlayerCommand(activeYoutubeId, "pauseVideo");
    }

    requestPlay(youtubeId);
    setActiveMusic(music);
    setPlayerState("playing");
  };

  const closePlayer = () => {
    if (activeMusic) {
      sendPlayerCommand(getYoutubeId(activeMusic.youtubeUrl), "pauseVideo");
    }
    setActiveMusic(null);
    setPlayerState("paused");
  };

  const copyTransferInfo = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedTransferField(label);
    window.setTimeout(() => setCopiedTransferField(null), 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { hasCompanions, ...body } = formData;
      const { data: storedData, error: storedError } = await supabase
        .from("registrations")
        .select("*")
        .eq("phone", formData.phone)
        .eq("name", formData.name);
      const usersStoredData = storedData?.[0];
      if (usersStoredData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usersStoredData));
        localStorage.removeItem(FORM_DRAFT_KEY);
        setHasStoredData(true);
        setIsConfirmationVisible(true);
        setConfirmed(usersStoredData.confirmed);
        window.alert(
          usersStoredData.confirmed
            ? `입금 확인되어, 참가 확정되었습니다.`
            : `참가 신청이 완료되었습니다!`,
        );
        return;
      }

      const { data, error } = await supabase
        .from("registrations")
        .insert([{ ...body, companions: hasCompanions ? body.companions : 0 }])
        .select("*");

      if (error) throw error;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data[0]));
      localStorage.removeItem(FORM_DRAFT_KEY);
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
      setConfirmed(userInfo.confirmed);

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
        11,
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

  const activeYoutubeId = activeMusic ? getYoutubeId(activeMusic.youtubeUrl) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative">
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 h-[54px] w-24 opacity-0">
        {musicInfo.map((music) => {
          const youtubeId = getYoutubeId(music.youtubeUrl);

          return (
            <iframe
              ref={(node) => {
                playerRefs.current[youtubeId] = node;
              }}
              key={youtubeId}
              title={`${music.title} 재생 플레이어`}
              src={getYoutubeEmbedSrc(music.youtubeUrl)}
              className="h-[54px] w-24"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          );
        })}
      </div>
      <div
        className={`fixed top-3 left-1/2 z-50 w-[calc(100vw-24px)] max-w-[390px] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur transition-opacity ${
          activeMusic ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-[54px] w-[54px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {activeMusic && (
              <img
                src={activeMusic.imageUrl}
                alt={`${activeMusic.title} 앨범아트`}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-x-0 bottom-2 flex items-end justify-center gap-1">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={`w-1 rounded-full bg-white/90 ${
                    playerState === "playing" ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: `${10 + bar * 4}px`,
                    animationDelay: `${bar * 120}ms`,
                    animationDuration: `${650 + bar * 90}ms`,
                  }}
                />
              ))}
            </div>
            {playerState === "loading" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-gray-100/90 text-[10px] font-medium text-gray-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                로딩중
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Now Playing
            </div>
            <div className="truncate text-sm font-semibold text-gray-900">
              {activeMusic?.title}
            </div>
            <div className="truncate text-xs text-gray-500">
              {activeMusic?.artist}
            </div>
          </div>
          <button
            type="button"
            onClick={closePlayer}
            aria-label="재생바 닫기"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div
          className="relative bg-white max-w-[390px] w-full"
        >
          {/* Hero Swiper */}
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
            className="w-[100vw] h-[70vh] sm:w-[390px] sm:h-[70%] z-2"
          >
            {[1].map((item, idx) => (
              <SwiperSlide key={item + idx}>
                <img
                  src={`/band${item}.png`}
                  className="h-full w-full object-cover z-2"
                  alt={item.toString()}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Title */}
          <div className="text-2xl mt-8 mb-6 font-bold text-center tracking-tight px-5">
            뚱땅뚱땅 밴드 두번째 공연
          </div>

          {/* Date row */}
          <div className="mt-2 flex items-center justify-between w-full px-5 text-sm text-gray-700 gap-2">
            <span>2025년 5월 30일(토) 오후 6시 30분</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                downloadEventIcs();
              }}
              aria-label="캘린더에 추가"
              className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition grid place-items-center flex-shrink-0 text-gray-600"
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

          {/* Location row */}
          <div className="flex items-center justify-between w-full gap-2 px-5 mt-2 text-sm text-gray-700">
            <span>클럽 라이브앤라우드</span>
            <div className="flex items-center gap-1.5">
              <a
                href="nmap://search?query=클럽 라이브앤라우드&appname=뚱땅뚱땅밴드"
                onClick={(e) => {
                  e.preventDefault();
                  const naverMapUrl = /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent,
                  )
                    ? "nmap://search?query=클럽 라이브앤라우드&appname=뚱땅뚱땅밴드"
                    : "https://map.naver.com/p/search/스타이즈본%20강남";
                  window.location.href = naverMapUrl;
                }}
                aria-label="네이버 지도에서 보기"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition"
              >
                <img
                  src="https://i.namu.wiki/i/g1ObOjgHeGx6qsTX-DgwrwyHL8uHBhXxiPQTCu9w5M32o0po4v1ugu_ikoEIncrVO-kq3Q73lCs8MzRgH55G2A.webp"
                  alt="네이버 지도"
                  className="w-full h-full object-cover"
                />
              </a>
              <a
                href="kakaomap://search?q=라이브앤라우드"
                onClick={(e) => {
                  e.preventDefault();
                  const kakaoMapUrl = /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent,
                  )
                    ? "kakaomap://search?q=라이브앤라우드"
                    : "https://map.kakao.com/?q=라이브앤라우드";
                  window.location.href = kakaoMapUrl;
                }}
                aria-label="카카오 지도에서 보기"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition"
              >
                <img
                  src="https://play-lh.googleusercontent.com/pPTTNz433EYFurg2j__bFU5ONdMoU_bs_-yS2JLZriua3iHrksGP6XBPF5VtDPlpGcW4"
                  alt="카카오 지도"
                  className="w-full h-full object-cover"
                />
              </a>
            </div>
          </div>

          {/* <div className="p-4">
            <NaverMap />
          </div> */}

          {/* SESSION section */}
          <div className="mt-10 px-5 mb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
              SESSION
            </p>
          </div>
          <div className="flex flex-col px-5 items-start justify-center gap-1">
            {userInfo.map((user, idx) => (
              <div
                key={user.name + idx}
                className="flex items-center w-full justify-between hover:bg-gray-50 rounded-xl px-2 py-2 -mx-2 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`/${user.name}.png`}
                    alt={user.name}
                    className="w-[72px] h-[72px] rounded-xl object-cover"
                  />
                  <div className="flex flex-col justify-center gap-0.5">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.session}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const isMobile = /Android|iPhone|iPad|iPod/i.test(
                      navigator.userAgent,
                    );
                    if (isMobile) {
                      window.location.href = `instagram://user?username=${user.instagram}`;
                    } else {
                      window.open(
                        `https://instagram.com/${user.instagram}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                  }}
                  aria-label={`${user.name} 인스타그램`}
                  className="text-gray-400 hover:text-pink-500 transition p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* PLAYLIST section */}
          <div className="mt-10 px-5 mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
              PLAYLIST
            </p>
          </div>
          <div className="flex flex-col px-5 items-start justify-center gap-1">
            {musicInfo.map((music, idx) => {
              const isActive =
                activeMusic !== null &&
                getYoutubeId(activeMusic.youtubeUrl) === getYoutubeId(music.youtubeUrl);
              const isPlaying = isActive && playerState !== "paused";

              return (
                <div
                  key={music.title + idx}
                  className="flex items-center w-full justify-between gap-3 hover:bg-gray-50 rounded-xl px-2 py-2 -mx-2 transition"
                >
                  <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{music.title}</div>
                    <div className="text-xs text-gray-500 truncate">{music.artist}</div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <img
                      src={music.imageUrl}
                      alt={music.title}
                      className="w-[72px] h-[72px] rounded-xl object-cover"
                    />
                    <button
                      onPointerDown={() => {
                        if (!isPlaying) {
                          requestPlay(getYoutubeId(music.youtubeUrl));
                        }
                      }}
                      onClick={() => handleMusicClick(music)}
                      aria-label={isPlaying ? "일시정지" : "재생"}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl hover:bg-black/50 transition-all"
                    >
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="white"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="white"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOTICE section */}
          <div className="mt-10 px-5 mb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
              NOTICE
            </p>
          </div>
          <div className="flex flex-col px-5 items-start justify-center text-sm text-gray-600 mb-8 gap-3">
            {[
              "소중한 주말에 시간 내어주셔서 감사합니다. 최선을 다해 좋은 시간 되실 수 있게 노력하겠습니다.",
              "다만 초보 밴드이니만큼 부족한 모습이 보이더라도 따뜻한 격려 보내주시면 감사하겠습니다",
              <span key="only-pre">공연장 공간 확보 및 원활한 행사 진행을 위해 <b>사전 신청한 인원만 입장이 가능</b>합니다.</span>,
              "신청 시 입력하는 정보가 틀리지 않도록, 정확하게 확인해주세요!",
              <span key="fee"><b>공연 참여 확정의 절차로 10,000원</b> 입금 부탁드립니다. 1잔의 Free Drink와 멋진 공연으로 돌려드리겠습니다</span>,
              "공연이 종료된 후 근처에서 뒤풀이가 진행될 예정입니다.",
              <span key="early">오시는 순서대로 입장을 도와드릴 예정이며, <b>먼저 오시는 분들은 앉아서 관람</b>하실 수 있다는 고급정보를 전달드립니다</span>,
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 block" />
                </span>
                <span>{text}</span>
              </div>
            ))}
            {/* <div>
              - 뚱땅뚱땅하게 예쁜 포스터를 만들어준{" "}
              <b>신정초등학교 5학년 9반 친구들</b>께 이 영광을 바칩니다.{" "}
              <span className="line-through">5959 예뻐라 자란다 자란다</span>
            </div> */}
          </div>

          {/* REGISTRATION / CHECK-IN section */}
          <div ref={formRef} className="w-full px-5 pt-8 pb-2 bg-gray-50">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
                {isConfirmationVisible ? "CHECK-IN" : "REGISTRATION"}
              </p>
            </div>
            <form
              onSubmit={
                isConfirmationVisible ? handleCheckSubmit : handleSubmit
              }
              className="flex flex-col gap-4"
            >
              {isConfirmationVisible && hasStoredData ? (
                <>
                  <div className="text-sm text-gray-700">
                    <b>{formData.name}님</b>{" "}
                    {formData.companions > 0
                      ? `외 ${formData.companions}명의 `
                      : ""}
                    참가 {confirmed ? "확정" : "신청"}이 완료 되었습니다!
                  </div>
                  {!confirmed ? (
                    <>
                      {(() => {
                        const transferAmount = TICKET_PRICE * (1 + formData.companions);
                        const tossUrl = `supertoss://send?amount=${transferAmount}&bank=%ED%86%A0%EC%8A%A4%EB%B1%85%ED%81%AC&accountNo=${TRANSFER_ACCOUNT_NO}&origin=qr`;
                        const transferRows = [
                          { label: "은행명", value: TRANSFER_BANK_NAME },
                          { label: "계좌번호", value: TRANSFER_ACCOUNT_NO },
                          { label: "금액", value: `${transferAmount.toLocaleString()}원` },
                        ];

                        return (
                          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex flex-col gap-3">
                              {transferRows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-medium text-gray-400">{row.label}</div>
                                    <div className="text-sm font-semibold text-gray-900 truncate">{row.value}</div>
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`${row.label} 복사하기`}
                                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
                                    onClick={() => copyTransferInfo(row.label, row.value)}
                                  >
                                    {copiedTransferField === row.label ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-4 w-4 text-green-600"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="h-12 w-full rounded-xl font-medium tracking-tight bg-[#0064FF] text-white hover:bg-[#0056DB] active:scale-[0.99] transition"
                              onClick={() => {
                                window.location.href = tossUrl;
                              }}
                            >
                              토스로 송금하기
                            </button>
                            <button
                              type="button"
                              className="h-12 w-full rounded-xl font-medium tracking-tight bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-[0.99] transition flex items-center justify-center gap-2"
                              onClick={downloadEventIcs}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                />
                              </svg>
                              캘린더에 추가하기
                            </button>
                          </div>
                        );
                      })()}
                      <div className="text-sm text-gray-600 flex flex-col gap-2">
                        {[
                          <span key="amount">
                            참여 확정을 위해{" "}
                            {formData.hasCompanions && (
                              <span>총 {formData.companions + 1}명의 입장료 </span>
                            )}
                            <b>
                              {(
                                TICKET_PRICE *
                                (1 + formData.companions)
                              ).toLocaleString()}
                              원
                            </b>
                            을 입금 부탁드립니다.{" "}
                            <span className="line-through">
                              후원의 의미로 더 주신다면, 그건 정말 감사합니다
                            </span>
                          </span>,
                          "위의 토스로 송금하기 버튼을 누르거나 계좌번호를 복사해 입금을 완료해주세요!",
                          "입금 확인이 수동으로 이뤄지는 관계로 즉각 반영되지는 않지만, 공연날까지는 확정 안내문을 보실 수 있도록 할게요!",
                          "문제가 생길 경우 기재해주신 연락처로 연락을 드리겠습니다! 혹은 밴드 내 지인을 통해 연락드리도록 하겠습니다!",
                        ].map((text, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 block" />
                            </span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 flex flex-col gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 block" />
                        </span>
                        <span>입금이 확인되어, <b>참여 확정</b>이 되셨습니다!</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="실명을 입력해주세요"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="px-4 h-12 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition placeholder:text-gray-400 text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      전화번호
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onFocus={() => {
                        if (formData.phone === "") {
                          setFormData((prev) => ({
                            ...prev,
                            phone: "010",
                          }));
                        }
                      }}
                      className="px-4 h-12 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition placeholder:text-gray-400 text-sm"
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
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="referrer"
                      className="text-sm font-medium text-gray-700"
                    >
                      지인
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
                      className="px-4 h-12 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition text-sm text-gray-700"
                      required
                    >
                      <option value="">선택해주세요</option>
                      {userInfo.map((user) => (
                        <option key={user.name} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label
                    htmlFor="joinParty"
                    className="flex items-center justify-between gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      뒤풀이 참석
                    </span>
                    <input
                      id="joinParty"
                      type="checkbox"
                      checked={formData.joinParty}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          joinParty: e.target.checked,
                        }));
                      }}
                      className="accent-black w-5 h-5 rounded shrink-0"
                    />
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="hasCompanions"
                      className="flex items-center justify-between gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        동반인원 있음
                      </span>
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
                        className="accent-black w-5 h-5 rounded shrink-0"
                      />
                    </label>

                    {formData.hasCompanions && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <label
                          htmlFor="companions"
                          className="text-sm font-medium text-gray-700"
                        >
                          동반 인원 수
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            (본인 제외)
                          </span>
                        </label>
                        <input
                          id="companions"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          placeholder="1"
                          value={formData.companions || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              companions: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="px-4 h-12 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition placeholder:text-gray-400 text-sm"
                          required
                        />
                        {Boolean(formData.companions) && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formData.name || "본인"} 외 {formData.companions}
                            명, 총 {formData.companions + 1}명 참여
                          </div>
                        )}
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
                    className="h-12 w-full rounded-xl font-medium tracking-tight bg-black text-white hover:bg-gray-800 active:scale-[0.99] transition disabled:bg-gray-300 mt-2"
                  >
                    {isSubmitting ? "제출 중..." : "신청결과 확인하기"}
                  </button>
                )
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  ref={submitButtonRef}
                  className="h-12 w-full rounded-xl font-medium tracking-tight bg-black text-white hover:bg-gray-800 active:scale-[0.99] transition disabled:bg-gray-300 mt-2"
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

          {/* {!isFormVisible && (
            <button
              onClick={() =>
                formRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="sticky bottom-0 left-0  w-full sm:w-[390px] sm:py-6 py-4 bg-black text-white sm:rounded-b-[55px]"
            >
              참가 신청하기
            </button>
          )} */}

          {/* Footer */}
          <div className="flex flex-col justify-center items-center font-light text-center text-xs py-5 text-gray-400">
            <div>Copyright &copy; 2026 DDOONG DDANG BAND.</div>
            <div>All rights reserved.</div>
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
