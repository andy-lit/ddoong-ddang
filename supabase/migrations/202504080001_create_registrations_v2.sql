-- 뚱땅뚱땅 밴드 두번째 공연 (2025년 5월 30일) 참가신청 테이블
-- 코드(app/page.tsx, app/admin/page.tsx)와 컬럼명이 일치하도록 camelCase 사용
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    referrer TEXT NOT NULL,
    companions INTEGER DEFAULT 0,
    confirmed BOOLEAN DEFAULT false,
    "joinParty" BOOLEAN DEFAULT false,
    arrived BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 누구나 신청(insert) 가능
CREATE POLICY "Anyone can insert registrations" ON public.registrations
    FOR INSERT WITH CHECK (true);

-- 누구나 조회(select) 가능 (참가 확정 여부 확인용)
CREATE POLICY "Anyone can read registrations" ON public.registrations
    FOR SELECT USING (true);

-- 어드민 페이지에서 confirmed/arrived 토글이 가능해야 하므로 anon update 허용
-- (admin 페이지는 ?admin=true 쿼리 파라미터로만 접근하는 운영용)
CREATE POLICY "Anyone can update registrations" ON public.registrations
    FOR UPDATE USING (true);

-- 삭제는 service_role만
CREATE POLICY "Service role can delete registrations" ON public.registrations
    FOR DELETE USING (auth.role() = 'service_role');

-- phone + name 조회 인덱스
CREATE INDEX idx_registrations_phone ON public.registrations(phone);
CREATE INDEX idx_registrations_name ON public.registrations(name);
