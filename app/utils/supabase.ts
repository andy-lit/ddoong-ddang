import { createClient } from "@supabase/supabase-js";

// 클라이언트를 한 번만 생성
export const supabase = createClient(
  "https://syowzfsgrtqeavqvqmzf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3d6ZnNncnRxZWF2cXZxbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1OTAwMzMsImV4cCI6MjA0ODE2NjAzM30.ZUqYrIlmzER1-IdCkRghXYllTe4PaBnM8zm2GZMOwKc"
);
