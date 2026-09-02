-- gong_signals gains last_detected_date: when the signal was most recently
-- heard on a call. The scoring model counts a positive signal only if it was
-- detected within the last 6 months.

alter table public.gong_signals add column if not exists last_detected_date date;

-- Backfill deterministically from md5(transcript_id): positive signals skew
-- recent (within ~260 days of the reference date), others spread wider.
update public.gong_signals set last_detected_date =
  date '2026-08-25' - (
    (('x' || substr(md5(transcript_id), 1, 8))::bit(32)::bigint)
    % (case when sentiment = 'Positive' then 260 else 400 end)
  )::int
where last_detected_date is null;

alter table public.gong_signals alter column last_detected_date set not null;

create index if not exists gong_signals_last_detected_idx
  on public.gong_signals (last_detected_date);
