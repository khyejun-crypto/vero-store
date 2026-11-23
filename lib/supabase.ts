import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 숨겨둔 URL과 열쇠를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이 supabase 변수가 바로 우리가 사용할 '전용 무전기'입니다.
export const supabase = createClient(supabaseUrl, supabaseKey);