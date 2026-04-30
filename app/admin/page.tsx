"use client";

import { supabase } from "@/app/utils/supabase";
import { Suspense, useEffect, useMemo, useState } from "react";
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

type StatusFilter = "all" | "unpaid" | "paid" | "notArrived" | "arrived";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">로딩중…</div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferrers, setSelectedReferrers] = useState<string[]>(
    userInfo.map(({ name }) => name),
  );
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [partyOnly, setPartyOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setIsLoading(true);
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
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ confirmed: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === id ? { ...reg, confirmed: !currentStatus } : reg,
        ),
      );
    } catch (error) {
      console.error("입금 확인 업데이트 실패:", error);
      alert("입금 확인 업데이트에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleArrival = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("registrations")
        .update({ arrived: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === id ? { ...reg, arrived: !currentStatus } : reg,
        ),
      );
    } catch (error) {
      console.error("도착 여부 업데이트 실패:", error);
      alert("도착 여부 업데이트에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations
      .filter((reg) => {
        if (statusFilter === "unpaid" && reg.confirmed) return false;
        if (statusFilter === "paid" && !reg.confirmed) return false;
        if (statusFilter === "notArrived" && reg.arrived) return false;
        if (statusFilter === "arrived" && !reg.arrived) return false;
        if (partyOnly && !reg.joinParty) return false;
        if (selectedReferrers.length === 0) return false;
        if (
          selectedReferrers.length !== userInfo.length &&
          !selectedReferrers.includes(reg.referrer)
        )
          return false;
        if (q) {
          const hay = `${reg.name} ${reg.phone}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.confirmed !== b.confirmed) return a.confirmed ? 1 : -1;
        return a.name.localeCompare(b.name, "ko");
      });
  }, [registrations, statusFilter, partyOnly, selectedReferrers, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const companions = filtered.reduce((s, r) => s + r.companions, 0);
    const paid = filtered.filter((r) => r.confirmed).length;
    const arrived = filtered.filter((r) => r.arrived).length;
    return { total, companions, paid, arrived, totalCount: total + companions };
  }, [filtered]);

  const toggleReferrer = (name: string) => {
    if (name === "전체") {
      setSelectedReferrers((prev) =>
        prev.length === userInfo.length ? [] : userInfo.map((u) => u.name),
      );
    } else {
      setSelectedReferrers((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
      );
    }
  };

  const allReferrersSelected = selectedReferrers.length === userInfo.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[480px] pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-base font-semibold tracking-tight">
              등록 현황
            </h1>
            <button
              onClick={fetchRegistrations}
              aria-label="새로고침"
              className="h-9 w-9 rounded-full bg-white border border-gray-200 grid place-items-center hover:bg-gray-100 active:scale-95 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992V4.356M19.5 14.25a7.5 7.5 0 1 1-2.197-5.303"
                />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="px-4 pb-3 grid grid-cols-3 gap-2 text-xs">
            <Stat label="총 인원" value={`${stats.totalCount}명`} />
            <Stat
              label="입금"
              value={`${stats.paid}/${stats.total}`}
              tone="green"
            />
            <Stat
              label="도착"
              value={`${stats.arrived}/${stats.total}`}
              tone="blue"
            />
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 전화번호 검색"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            <FilterChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              전체
            </FilterChip>
            <FilterChip
              active={statusFilter === "unpaid"}
              onClick={() =>
                setStatusFilter(statusFilter === "unpaid" ? "all" : "unpaid")
              }
              tone="red"
            >
              미입금
            </FilterChip>
            <FilterChip
              active={statusFilter === "paid"}
              onClick={() =>
                setStatusFilter(statusFilter === "paid" ? "all" : "paid")
              }
              tone="green"
            >
              입금완료
            </FilterChip>
            {isAdmin && (
              <>
                <FilterChip
                  active={statusFilter === "notArrived"}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "notArrived" ? "all" : "notArrived",
                    )
                  }
                  tone="gray"
                >
                  미도착
                </FilterChip>
                <FilterChip
                  active={statusFilter === "arrived"}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "arrived" ? "all" : "arrived",
                    )
                  }
                  tone="blue"
                >
                  도착
                </FilterChip>
              </>
            )}
            <FilterChip
              active={partyOnly}
              onClick={() => setPartyOnly((v) => !v)}
              tone="purple"
            >
              뒤풀이만
            </FilterChip>
          </div>

          {/* Referrer chips */}
          <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            <ReferrerChip
              active={allReferrersSelected}
              onClick={() => toggleReferrer("전체")}
            >
              전체
            </ReferrerChip>
            {userInfo.map((user) => (
              <ReferrerChip
                key={user.name}
                active={selectedReferrers.includes(user.name)}
                onClick={() => toggleReferrer(user.name)}
              >
                {user.name}
              </ReferrerChip>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-4 py-3 flex flex-col gap-2">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500 py-12">
              로딩중…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-12">
              조건에 맞는 등록이 없습니다.
            </div>
          ) : (
            filtered.map((reg) => (
              <RegistrationCard
                key={reg.id}
                reg={reg}
                isAdmin={isAdmin}
                isUpdating={updatingId === reg.id}
                onToggleConfirm={() =>
                  toggleConfirmation(reg.id, reg.confirmed)
                }
                onToggleArrived={() => toggleArrival(reg.id, reg.arrived)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "blue"
        ? "text-blue-700"
        : "text-gray-900";
  return (
    <div className="bg-white rounded-xl px-3 py-2 border border-gray-200">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        {label}
      </div>
      <div className={`text-sm font-semibold ${toneClass} mt-0.5`}>{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  tone = "default",
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone?: "default" | "red" | "green" | "blue" | "gray" | "purple";
  children: React.ReactNode;
}) {
  const toneMap = {
    default: "bg-gray-900 text-white",
    red: "bg-red-500 text-white",
    green: "bg-green-600 text-white",
    blue: "bg-blue-600 text-white",
    gray: "bg-gray-500 text-white",
    purple: "bg-purple-600 text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium transition border ${
        active
          ? `${toneMap[tone]} border-transparent`
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function ReferrerChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-7 px-2.5 rounded-full text-xs font-medium transition border ${
        active
          ? "bg-gray-100 text-gray-900 border-gray-300"
          : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function RegistrationCard({
  reg,
  isAdmin,
  isUpdating,
  onToggleConfirm,
  onToggleArrived,
}: {
  reg: Registration;
  isAdmin: boolean;
  isUpdating: boolean;
  onToggleConfirm: () => void;
  onToggleArrived: () => void;
}) {
  const totalPeople = 1 + reg.companions;
  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition ${
        reg.confirmed ? "border-gray-200" : "border-red-200 bg-red-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-gray-900">
              {reg.name}
            </span>
            {reg.companions > 0 && (
              <span className="text-[11px] px-1.5 h-5 inline-flex items-center rounded-full bg-gray-900 text-white font-medium">
                +{reg.companions}
              </span>
            )}
            {reg.joinParty && (
              <span className="text-[11px] px-1.5 h-5 inline-flex items-center rounded-full bg-purple-100 text-purple-700 font-medium">
                뒤풀이
              </span>
            )}
          </div>
          <a
            href={`tel:${reg.phone.replace(/-/g, "")}`}
            className="text-sm text-gray-500 hover:text-gray-900 transition mt-0.5 inline-block"
          >
            {reg.phone}
          </a>
          <div className="text-xs text-gray-500 mt-1">
            지인: <span className="text-gray-700">{reg.referrer}</span>
            <span className="mx-1.5 text-gray-300">·</span>
            총 {totalPeople}명
          </div>
        </div>
      </div>

      <div
        className={`grid gap-2 mt-3 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}
      >
        <button
          onClick={onToggleConfirm}
          disabled={isUpdating}
          className={`h-10 rounded-xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 ${
            reg.confirmed
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          }`}
        >
          {reg.confirmed ? "✓ 입금 확인됨" : "입금 확인하기"}
        </button>
        {isAdmin && (
          <button
            onClick={onToggleArrived}
            disabled={isUpdating}
            className={`h-10 rounded-xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 ${
              reg.arrived
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {reg.arrived ? "✓ 도착함" : "도착 처리"}
          </button>
        )}
      </div>
    </div>
  );
}
