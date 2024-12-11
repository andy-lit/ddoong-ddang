"use client";

import { supabase } from "@/app/utils/supabase";
import { useEffect, useState } from "react";
import { userInfo } from "../userInfo";

interface Registration {
  id: string;
  name: string;
  phone: string;
  referrer: string;
  companions: number;
  confirmed: boolean;
  createdAt: string;
  joinParty: boolean;
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferrers, setSelectedReferrers] = useState<string[]>(
    userInfo.map(({ name }) => name)
  );
  const [filters, setFilters] = useState({
    confirmed: false,
    joinParty: false,
    unconfirmed: false,
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const { data, error } = await supabase.from("registrations").select("*");

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("등록 정보를 불러오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleConfirmation = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ confirmed: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setRegistrations(
        registrations.map((reg) =>
          reg.id === id ? { ...reg, confirmed: !currentStatus } : reg
        )
      );
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("상태 업데이트에 실패했습니다.");
    }
  };

  const filteredRegistrations = registrations
    .filter((reg) => {
      if (filters.confirmed && !reg.confirmed) return false;
      if (filters.unconfirmed && reg.confirmed) return false;
      if (filters.joinParty && !reg.joinParty) return false;
      return true;
    })
    .filter((reg) => {
      if (selectedReferrers.length === 0) return false;
      if (selectedReferrers.length === userInfo.length) return true;
      if (
        selectedReferrers.length > 0 &&
        !selectedReferrers.includes(reg.referrer)
      )
        return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const totalCompanions = filteredRegistrations.reduce(
    (sum, reg) => sum + reg.companions,
    0
  );
  const totalCount = filteredRegistrations.length + totalCompanions;

  //   const handleSendSMS = async (registration: Registration) => {
  //     try {
  //       const paymentUrl = `https://ddoong-ddang.vercel.app?id=${registration.id}`;

  //       const message = `[뚱땅뚱땅 밴드 참여 확정 안내]안녕하세요 ${registration.name}님, 뚱땅뚱땅 밴드 공연 입금이 확인되었습니다. ${paymentUrl}`;

  //       const response = await fetch("/api/sms", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           to: registration.phone,
  //           content: message,
  //         }),
  //       });

  //       const data = await response.json();

  //       if (!data.success) {
  //         throw new Error(data.error);
  //       }

  //       alert("문자메시지가 발송되었습니다.");
  //     } catch (error) {
  //       console.error("문자 발송 실패:", error);
  //       alert("문자 발송에 실패했습��다.");
  //     }
  //   };

  const handleReferrerClick = (referrer: string) => {
    if (referrer === "전체") {
      // 전체가 선택된 경우, 모든 선택을 해제
      if (selectedReferrers.length === userInfo.length) {
        setSelectedReferrers([]);
      }
      // 일부만 선택되었거나 아무것도 선택되지 않은 경우, 모두 선택
      else {
        setSelectedReferrers(userInfo.map((user) => user.name));
      }
    } else {
      // 개별 지인 선택/해제
      setSelectedReferrers((prev) =>
        prev.includes(referrer)
          ? prev.filter((r) => r !== referrer)
          : [...prev, referrer]
      );
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">로딩중...</div>;
  }

  return (
    <div className="container mx-auto p-2 max-w-full">
      <h1 className="text-xl font-bold mb-3">등록 현황</h1>

      <div className="mb-3 flex flex-wrap gap-1">
        <button
          onClick={() => handleReferrerClick("전체")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
            ${
              selectedReferrers.length === userInfo.length
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          전체
        </button>
        {userInfo.map((user) => (
          <button
            key={user.name}
            onClick={() => handleReferrerClick(user.name)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
              ${
                selectedReferrers.includes(user.name)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {user.name}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.confirmed}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                confirmed: e.target.checked,
                unconfirmed: false,
              }))
            }
          />
          입금 확인
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.unconfirmed}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                unconfirmed: e.target.checked,
                confirmed: false,
              }))
            }
          />
          입금 미확인
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.joinParty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, joinParty: e.target.checked }))
            }
          />
          뒤풀이 참석
        </label>
      </div>

      <div className="mb-3 text-sm">
        <p>
          총 인원: {totalCount}명 (동반 {totalCompanions}명)
        </p>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gray-100 text-xs">
              <th className="px-2 py-1 border">이름</th>
              <th className="px-2 py-1 border">연락처</th>
              <th className="px-2 py-1 border">지인</th>
              <th className="px-2 py-1 border">동반</th>
              <th className="px-2 py-1 border">뒤풀이</th>
              <th className="px-2 py-1 border">입금</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredRegistrations.map((registration: Registration) => (
              <tr key={registration.id}>
                <td className="px-2 py-1 border">{registration.name}</td>
                <td className="px-2 py-1 border">{registration.phone}</td>
                <td className="px-2 py-1 border">{registration.referrer}</td>
                <td className="px-2 py-1 border text-center">
                  {registration.companions}
                </td>
                <td className="px-2 py-1 border text-center">
                  {registration.joinParty ? "O" : "X"}
                </td>
                <td className="px-2 py-1 border text-center">
                  <button
                    onClick={() =>
                      toggleConfirmation(
                        registration.id,
                        registration.confirmed
                      )
                    }
                    className="hover:opacity-70"
                  >
                    {registration.confirmed ? "✅" : "❌"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
