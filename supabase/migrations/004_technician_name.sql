-- 매칭된 기사님 이름을 고객 화면에 보여주기 위한 컬럼.
--
-- partners 테이블을 고객(비회원, RLS상 본인 것만 조회 가능)이 직접
-- 조회하게 하면 전화번호 등 다른 정보까지 막아야 하는 번거로움이 생겨서,
-- 기사님이 호출을 수락하는 시점에 이름만 jobs 테이블에 그대로 복사해
-- 두는 방식을 택함 — jobs는 이미 누구나 조회 가능(migration 002)하니
-- 그대로 재사용.
alter table jobs add column if not exists technician_name text;
