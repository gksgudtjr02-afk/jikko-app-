-- 거리 계산(무료 버전 — 지도 API 없이 직선거리만)을 위한 좌표 저장.
--
-- job_addresses에 넣는 이유: 정확한 좌표도 정확한 주소만큼 민감한
-- 정보라(그 위치가 거의 그대로 드러남), 기존 address 컬럼과 똑같이
-- "수락한 기사님에게만 공개" 규칙을 그대로 적용받게 하기 위함.
-- 수락 전 콜보드에서는 좌표를 직접 내려주지 않고, 서버가 계산한
-- "거리(숫자)"만 내려줌(/api/job-distance).
alter table job_addresses add column if not exists lat double precision;
alter table job_addresses add column if not exists lng double precision;
