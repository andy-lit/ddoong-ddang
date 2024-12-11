"use client";

import { supabase } from "@/app/utils/supabase";
import { Suspense, useEffect, useState } from "react";
import { userInfo } from "../userInfo";
import { useSearchParams } from "next/navigation";

interface Registration {
  id: string;
  name: string;
  phone: string;
  referrer: string;
  companions: number;
  confirmed: boolean;
  createdAt: string;
  joinParty: boolean;
  arrived: boolean;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
function AdminContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferrers, setSelectedReferrers] = useState<string[]>(
    userInfo.map(({ name }) => name)
  );
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";
  const [filters, setFilters] = useState({
    joinParty: false,
    arrived: false,
    notArrived: false,
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

  const toggleArrival = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ arrived: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setRegistrations(
        registrations.map((reg) =>
          reg.id === id ? { ...reg, arrived: !currentStatus } : reg
        )
      );
    } catch (error) {
      console.error("도착 여부 업데이트 실패:", error);
      alert("도착 여부 업데이트에 실패했습니다.");
    }
  };

  const filteredRegistrations = registrations
    .filter((reg) => {
      if (filters.joinParty && !reg.joinParty) return false;
      if (filters.arrived && !reg.arrived) return false; // 도착한 사람만 보기
      if (filters.notArrived && reg.arrived) return false; // 도착하지 않은 사람만 보기
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

  const handleReferrerClick = (referrer: string) => {
    if (referrer === "전체") {
      if (selectedReferrers.length === userInfo.length) {
        setSelectedReferrers([]);
      } else {
        setSelectedReferrers(userInfo.map((user) => user.name));
      }
    } else {
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
            checked={filters.joinParty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, joinParty: e.target.checked }))
            }
          />
          뒤풀이 참석
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.arrived}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                arrived: e.target.checked,
                notArrived: false,
              }))
            }
          />
          도착함
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.notArrived}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                notArrived: e.target.checked,
                arrived: false,
              }))
            }
          />
          도착하지 않음
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
              <th className="px-2 py-1 border">도착</th>
              {isAdmin && <th className="px-2 py-1 border">업데이트</th>}
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredRegistrations.map((registration: Registration) => (
              <tr key={registration.id} className="h-16">
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
                    {registration.arrived ? "✅" : "❌"}
                  </button>
                </td>
                {isAdmin && (
                  <td
                    className={`px-2 py-1 border text-center ${
                      registration.arrived ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    <button
                      onClick={() =>
                        toggleArrival(registration.id, registration.arrived)
                      }
                      className="hover:opacity-70"
                    >
                      {registration.arrived ? "잘못누름" : "도착 처리"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
