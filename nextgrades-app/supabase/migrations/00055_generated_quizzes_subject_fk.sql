-- Allow PostgREST embeds: generated_quizzes -> subjects
alter table public.generated_quizzes
  drop constraint if exists generated_quizzes_subject_id_fkey;

alter table public.generated_quizzes
  add constraint generated_quizzes_subject_id_fkey
  foreign key (subject_id) references public.subjects(id) on delete set null;
