-- Cap public catalog at grade 9; allow empty url when file is in storage
ALTER TABLE public.materials ALTER COLUMN url DROP NOT NULL;
