#!/usr/bin/env node
/**
 * Sync cmsImages.* entries in cms_content to branded /public/marketing paths.
 * Usage: node scripts/sync-marketing-cms-images.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return process.env;
  const env = { ...process.env };
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

/** Must match src/lib/marketing-images.ts + marketing-images-registry.ts */
const CMS_IMAGES = {
  "cmsImages.home.heroStudent": "/images/marketing/hero-students-nextgrades.png",
  "cmsImages.home.studyBanner": "/images/marketing/platform-laptop.png",
  "cmsImages.home.desk": "/images/marketing/study-desk.png",
  "cmsImages.home.platformThumb": "/images/marketing/platform-laptop.png",
  "cmsImages.home.testimonialsBg": "/images/marketing/students-collab.png",
  "cmsImages.home.programCard.0": "/images/marketing/tutoring-session.png",
  "cmsImages.home.programCard.1": "/images/marketing/kleine-lerngruppen.png",
  "cmsImages.home.programCard.2": "/images/marketing/subject-books.png",
  "cmsImages.home.programCard.3": "/images/marketing/platform-laptop.png",
  "cmsImages.about.hero": "/images/marketing/students-group-4.png",
  "cmsImages.about.story": "/images/marketing/about-story.png",
  "cmsImages.about.mission.0": "/images/marketing/mission-understand.png",
  "cmsImages.about.mission.1": "/images/marketing/mission-materials.png",
  "cmsImages.about.mission.2": "/images/marketing/mission-individual.png",
  "cmsImages.about.mission.3": "/images/marketing/mission-results.png",
  "cmsImages.about.promise": "/images/marketing/about-promise.png",
  "cmsImages.programs.hero": "/images/marketing/hero-students-nextgrades.png",
  "cmsImages.programs.card.0": "/images/marketing/tutoring-session.png",
  "cmsImages.programs.card.1": "/images/marketing/kleine-lerngruppen.png",
  "cmsImages.programs.card.2": "/images/marketing/subject-books.png",
  "cmsImages.programs.card.3": "/images/marketing/platform-laptop.png",
  "cmsImages.subjects.hero": "/images/marketing/hero-students-nextgrades.png",
  "cmsImages.subjects.computer-science": "/images/marketing/subjects/subject-informatik.png",
  "cmsImages.contact.hero": "/images/marketing/study-desk.png",
  "cmsImages.consultation.hero": "/images/marketing/tutoring-session.png",
  "cmsImages.resources.hero": "/images/marketing/students-group-3.png",
  "cmsImages.help.hero": "/images/marketing/platform-laptop.png",
  "cmsImages.careers.hero": "/images/marketing/students-group-4.png",
  "cmsImages.auth.loginHero": "/images/marketing/tutoring-session.png",
  "cmsImages.privacy.hero": "/images/marketing/privacy-secure.png",
};

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const keys = Object.keys(CMS_IMAGES);
const { data: rows, error } = await supabase
  .from("cms_content")
  .select("id, i18n_key, field_key, content_json")
  .or(`i18n_key.in.(${keys.join(",")}),field_key.in.(${keys.join(",")})`);

if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

let updated = 0;
let inserted = 0;

for (const [i18nKey, imageUrl] of Object.entries(CMS_IMAGES)) {
  const json = { en: imageUrl, de: imageUrl };
  const existing = (rows ?? []).find((r) => r.i18n_key === i18nKey || r.field_key === i18nKey);

  if (existing) {
    const { error: upErr } = await supabase
      .from("cms_content")
      .update({
        content_json: json,
        draft_json: json,
        content_value: imageUrl,
        field_type: "image",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (upErr) {
      console.error(`✗ ${i18nKey}: ${upErr.message}`);
    } else {
      console.log(`✓ updated ${i18nKey}`);
      updated++;
    }
  } else {
    const pageGroup = i18nKey.split(".")[1] ?? "home";
    const { data: section } = await supabase
      .from("cms_sections")
      .select("id")
      .eq("page_name", pageGroup)
      .maybeSingle();

    const { error: insErr } = await supabase.from("cms_content").insert({
      section_id: section?.id ?? null,
      i18n_key: i18nKey,
      field_key: i18nKey,
      field_name: i18nKey,
      field_type: "image",
      content_json: json,
      draft_json: json,
      content_value: imageUrl,
    });
    if (insErr) {
      console.error(`✗ insert ${i18nKey}: ${insErr.message}`);
    } else {
      console.log(`+ inserted ${i18nKey}`);
      inserted++;
    }
  }
}

console.log(`\nDone: ${updated} updated, ${inserted} inserted.`);
