-- 뚱땅뚱땅 밴드 두번째 공연 (2025년 5월 30일) 참가신청 테이블
CREATE TABLE IF NOT EXISTS public.registrations_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    referrer TEXT NOT NULL,
    companions INTEGER DEFAULT 0,
    confirmed BOOLEAN DEFAULT false,
    join_party BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.registrations_v2 ENABLE ROW LEVEL SECURITY;

-- Everyone can insert
CREATE POLICY "Anyone can insert registrations_v2" ON public.registrations_v2
    FOR INSERT WITH CHECK (true);

-- Everyone can read (for confirmation lookup)
CREATE POLICY "Anyone can read registrations_v2" ON public.registrations_v2
    FOR SELECT USING (true);

-- Only service role can update/delete
CREATE POLICY "Service role can update registrations_v2" ON public.registrations_v2
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete registrations_v2" ON public.registrations_v2
    FOR DELETE USING (auth.role() = 'service_role');

-- Index for phone + name lookup
CREATE INDEX idx_registrations_v2_phone ON public.registrations_v2(phone);
CREATE INDEX idx_registrations_v2_name ON public.registrations_v2(name);
