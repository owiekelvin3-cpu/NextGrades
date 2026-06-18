#!/usr/bin/env node
/**
 * Apply owner change-list terminology (G-01) across German locale JSON files.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  join(root, "src/locales/de/common.json"),
  join(root, "src/locales/de/site.json"),
];

const replacements = [
  ["Schüler:innen", "SchülerInnen"],
  ["Schüler:in", "SchülerIn"],
  ["Lehrer:innen", "LehrerInnen"],
  ["Lehrer:in", "LehrerIn"],
  ["Expert:innen", "ExpertInnen"],
  ["Expert:in", "ExpertIn"],
  ["Tutor:innen", "TutorInnen"],
  ["Tutor:in", "TutorIn"],
  ["Freund:innen", "FreundInnen"],
  ["Dozent:innen", "DozentInnen"],
  ["Visionär:innen", "VisionärInnen"],
  ["Lernexpert:innen", "LernexpertInnen"],
  ["Nachhilfelehrer:innen", "NachhilfelehrerInnen"],
  ["Nachhilfelehrer:in", "NachhilfelehrerIn"],
];

for (const file of files) {
  let text = readFileSync(file, "utf8");
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  writeFileSync(file, text, "utf8");
  console.log("Updated:", file.replace(root + "\\", "").replace(root + "/", ""));
}
