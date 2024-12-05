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
  const [selectedReferrer, setSelectedReferrer] = useState<string>("");
  const [filters, setFilters] = useState({
    confirmed: false,
    joinParty: false,
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

  const filteredRegistrations = registrations.filter((reg) => {
    if (selectedReferrer && reg.referrer !== selectedReferrer) return false;
    if (filters.confirmed && !reg.confirmed) return false;
    if (filters.joinParty && !reg.joinParty) return false;
    return true;
  });

  const totalCompanions = filteredRegistrations.reduce(
    (sum, reg) => sum + reg.companions,
    0
  );
  const totalCount = filteredRegistrations.length + totalCompanions;

  const handleSendSMS = async (registration: Registration) => {
    try {
      const paymentUrl = `https://ddoong-ddang.vercel.app?id=${registration.id}`;

      const message = `[뚱땅뚱땅 밴드 참여 확정 안내]안녕하세요 ${registration.name}님, 뚱땅뚱땅 밴드 공연 입금이 확인되었습니다. ${paymentUrl}`;

      const response = await fetch("/api/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: registration.phone,
          content: message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      alert("문자메시지가 발송되었습니다.");
    } catch (error) {
      console.error("문자 발송 실패:", error);
      alert("문자 발송에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">로딩중...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">등록 현황</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        <select
          value={selectedReferrer}
          onChange={(e) => setSelectedReferrer(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">모든 지인</option>
          {userInfo.map((user) => (
            <option key={user.name} value={user.name}>
              {user.name}의 지인
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.confirmed}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, confirmed: e.target.checked }))
            }
          />
          입금 확인된 사람만 보기
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.joinParty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, joinParty: e.target.checked }))
            }
          />
          뒤풀이 참석자만 보기
        </label>
      </div>

      <div className="mb-4 text-sm">
        <p>
          총 인원: {totalCount}명 (동반인원 {totalCompanions}명 포함)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">이름</th>
              <th className="px-4 py-2 border">전화번호</th>
              <th className="px-4 py-2 border">지인</th>
              <th className="px-4 py-2 border">동반인원</th>
              <th className="px-4 py-2 border">뒤풀이</th>
              <th className="px-4 py-2 border">입금확인/문자발송</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((registration: Registration) => (
              <tr key={registration.id}>
                <td className="px-4 py-2 border">{registration.name}</td>
                <td className="px-4 py-2 border">{registration.phone}</td>
                <td className="px-4 py-2 border">{registration.referrer}</td>
                <td className="px-4 py-2 border text-center">
                  {registration.companions}
                </td>
                <td className="px-4 py-2 border text-center">
                  {registration.joinParty ? "참석" : "불참"}
                </td>
                <td className="px-4 py-2 border text-center">
                  <div className="flex items-center justify-center gap-2">
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
                    {/* {!registration.confirmed && (
                      <button
                        onClick={() => handleSendSMS(registration)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        문자발송
                      </button>
                    )} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
