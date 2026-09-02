-- The "next action" pipeline runs in the background (Next.js after()), so a row
-- is created as 'pending' first and updated when the work finishes.
alter table public.recommendations
  drop constraint if exists recommendations_status_check;
alter table public.recommendations
  add constraint recommendations_status_check
  check (status in ('pending', 'completed', 'failed'));

alter table public.recommendations
  add column if not exists started_at timestamptz;

-- The background task updates the pending row it created.
drop policy if exists "public update recommendations" on public.recommendations;
create policy "public update recommendations"
  on public.recommendations for update using (true) with check (true);
