import { createClient } from "@supabase/supabase-js";

// Vercel 빌드 시 env가 없어도 createClient가 throw하지 않도록 placeholder 폴백.
// 실제 동작은 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 설정된 환경에서만 정상.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

if (
  typeof window !== "undefined" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
