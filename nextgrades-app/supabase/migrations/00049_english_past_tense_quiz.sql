-- Starter English past-tense quiz for students (Aufgaben).

INSERT INTO public.generated_quizzes (
  id,
  created_by,
  title,
  description,
  subject_id,
  topic,
  difficulty,
  question_types,
  status,
  is_published,
  published_at,
  time_limit_minutes,
  ai_model,
  raw_generation
)
SELECT
  'a1e8c4d2-7b3f-4e91-9c5a-2f8d6b1e0a47'::uuid,
  p.id,
  'Englisch: Past Tense',
  'Wähle die richtige Past Tense. Regelmäßige und unregelmäßige Verben – ein kurzes Übungsquiz zum Start.',
  s.id,
  'Past Tense',
  'easy',
  '["mcq"]'::jsonb,
  'published',
  TRUE,
  NOW(),
  12,
  'seed-v1',
  '{"engine":"seed","kind":"english-past-tense"}'::jsonb
FROM public.profiles p
LEFT JOIN public.subjects s ON s.name = 'Englisch'
WHERE p.role = 'admin'
ORDER BY p.created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  topic = EXCLUDED.topic,
  is_published = TRUE,
  status = 'published',
  published_at = COALESCE(public.generated_quizzes.published_at, NOW());

DELETE FROM public.quiz_questions
WHERE quiz_id = 'a1e8c4d2-7b3f-4e91-9c5a-2f8d6b1e0a47'::uuid;

INSERT INTO public.quiz_questions (
  quiz_id, question_type, question_text, options, correct_answer, explanation, points, sort_order
)
SELECT
  'a1e8c4d2-7b3f-4e91-9c5a-2f8d6b1e0a47'::uuid,
  'mcq',
  q.question_text,
  q.options::jsonb,
  q.correct_answer,
  q.explanation,
  1,
  q.sort_order
FROM (
  VALUES
    (1, 'Past Tense von „go“?', '["went","goed","gone","going"]', 'went', 'go → went (unregelmäßig).'),
    (2, 'Past Tense von „buy“?', '["bought","buyed","boughten","buying"]', 'bought', 'buy → bought (unregelmäßig).'),
    (3, 'Past Tense von „take“?', '["took","taked","taken","taking"]', 'took', 'take → took (unregelmäßig).'),
    (4, 'Past Tense von „make“?', '["made","maked","maid","making"]', 'made', 'make → made (unregelmäßig).'),
    (5, 'Past Tense von „see“?', '["saw","seed","seen","seeing"]', 'saw', 'see → saw (unregelmäßig).'),
    (6, 'Past Tense von „write“?', '["wrote","writed","written","writing"]', 'wrote', 'write → wrote (unregelmäßig).'),
    (7, 'Past Tense von „eat“?', '["ate","eated","eaten","eating"]', 'ate', 'eat → ate (unregelmäßig).'),
    (8, 'Past Tense von „drink“?', '["drank","drinked","drunk","drinking"]', 'drank', 'drink → drank (unregelmäßig).'),
    (9, 'Past Tense von „sleep“?', '["slept","sleeped","sleep","sleeping"]', 'slept', 'sleep → slept (unregelmäßig).'),
    (10, 'Past Tense von „think“?', '["thought","thinked","thank","thinking"]', 'thought', 'think → thought (unregelmäßig).'),
    (11, 'Past Tense von „catch“?', '["caught","catched","catch","catching"]', 'caught', 'catch → caught (unregelmäßig).'),
    (12, 'Past Tense von „teach“?', '["taught","teached","teach","teaching"]', 'taught', 'teach → taught (unregelmäßig).'),
    (13, 'Past Tense von „have“?', '["had","haved","has","having"]', 'had', 'have → had (unregelmäßig).'),
    (14, 'Past Tense von „play“?', '["played","playd","plaied","playing"]', 'played', 'play → played (regelmäßig: -ed).'),
    (15, 'Past Tense von „walk“?', '["walked","walkt","walk","walking"]', 'walked', 'walk → walked (regelmäßig: -ed).'),
    (16, 'Past Tense von „study“?', '["studied","studyed","studyd","studying"]', 'studied', 'study → studied (y wird zu ied).')
) AS q(sort_order, question_text, options, correct_answer, explanation)
WHERE EXISTS (
  SELECT 1 FROM public.generated_quizzes WHERE id = 'a1e8c4d2-7b3f-4e91-9c5a-2f8d6b1e0a47'::uuid
);
