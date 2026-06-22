import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  [/, text-foreground\)/g, ', "text-foreground")'],
  [/, text-text-muted\)/g, ', "text-text-muted")'],
  [/, text-foreground-secondary\)/g, ', "text-foreground-secondary")'],
  [/, border-border-default\)/g, ', "border-border-default")'],
  [/\(text-foreground,/g, '("text-foreground",'],
  [/\(text-text-muted,/g, '("text-text-muted",'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log("fixed:", path.relative(process.cwd(), file));
  }
}
console.log(`Done. ${changed} files fixed.`);
