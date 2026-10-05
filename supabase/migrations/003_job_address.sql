-- 사장님이 호출을 만들 때 상호명/동네/상세주소를 같이 받기 위한 변경.
--
-- 상호명·동네는 콜보드(기사님이 아직 안 잡은 호출 목록)에서도 보여서
-- 기사님이 거리를 가늠하고 단골 매장을 알아볼 수 있게 함 — 민감하지
-- 않다고 보고 jobs 테이블에 직접 둠.
--
-- 정확한 상세주소는 다름 — 아무나(잡지 않은 기사님 포함) 볼 수 있으면
-- 안 되므로 별도 테이블(job_addresses)로 분리하고, 그 호출을 수락한
-- 기사님 본인만 읽을 수 있도록 RLS를 건다.
alter table jobs add column if not exists business text;
alter table jobs add column if not exists dong text;

create table if not exists job_addresses (
  job_id uuid primary key references jobs(id) on delete cascade,
  address text not null,
  created_at timestamptz not null default now()
);

alter table job_addresses enable row level security;

-- 고객은 비회원이라, jobs와 동일하게 누구나 주소를 등록할 수 있어야 함.
create policy "Anyone can add a job address"
  on job_addresses for insert
  with check (true);

-- 정확한 주소는 그 호출을 맡은(matched/done) 기사님 본인에게만 공개.
create policy "Matched technician can view job address"
  on job_addresses for select
  using (
    exists (
      select 1 from jobs
      where jobs.id = job_addresses.job_id
        and jobs.technician_id = auth.uid()
    )
  );
