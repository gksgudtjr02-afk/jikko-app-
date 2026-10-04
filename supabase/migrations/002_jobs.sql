create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new' check (status in ('new', 'matched', 'done', 'canceled')),
  equipment text not null,
  symptom text not null,
  error_code text,
  memo text,
  price_low integer not null default 0,
  price_high integer not null default 0,
  urgent boolean not null default false,
  technician_id uuid references partners(id),
  matched_at timestamptz,
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;

-- 고객은 비회원이라 누구나(익명 포함) 새 요청을 만들 수 있어야 함.
create policy "Anyone can create a job"
  on jobs for insert
  with check (true);

-- 콜보드(기사님 화면)가 전체 목록을 읽어야 하고, 고객도 자기 요청 상태를
-- 확인해야 해서 전체 공개 조회로 둠 — 주소/연락처 같은 민감정보는 아직
-- 이 테이블에 안 담겨있어서 당장은 문제 없음.
create policy "Anyone can view jobs"
  on jobs for select
  using (true);

-- 신규(new) 상태인 요청만, 로그인한 기사님이 자기 자신을 담당자로
-- 지정하며 matched로 바꾸는 것만 허용. WHERE id=X AND status='new' 조건과
-- 결합되면 동시에 여러 기사님이 눌러도 한 명만 성공하는 원자적 처리가 됨.
create policy "Partners can accept open jobs"
  on jobs for update
  using (status = 'new' and auth.uid() is not null)
  with check (technician_id = auth.uid() and status = 'matched');
