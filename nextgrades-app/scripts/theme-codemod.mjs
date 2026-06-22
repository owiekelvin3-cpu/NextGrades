/**
 * One-time codemod: replace common theme ternaries with semantic token classes.
 * Run: node scripts/theme-codemod.mjs
 */
import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  [/\$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}/g, ""],
  [/theme === "dark" \? "bg-\[#112240\]" : "bg-white"/g, ""],
  [/\$\{isDark \? "bg-\[#112240\]" : "bg-white"\}/g, ""],
  [/isDark \? "bg-\[#112240\]" : "bg-white"/g, ""],
  [/\$\{theme === "dark" \? "text-white" : "text-\[#0D1B2A\]"\}/g, "text-foreground"],
  [/theme === "dark" \? "text-white" : "text-\[#0D1B2A\]"/g, "text-foreground"],
  [/\$\{isDark \? "text-white" : "text-\[#0D1B2A\]"\}/g, "text-foreground"],
  [/isDark \? "text-white" : "text-\[#0D1B2A\]"/g, "text-foreground"],
  [/\$\{theme === "dark" \? "text-gray-400" : "text-gray-600"\}/g, "text-text-muted"],
  [/theme === "dark" \? "text-gray-400" : "text-gray-600"/g, "text-text-muted"],
  [/\$\{theme === "dark" \? "text-gray-400" : "text-gray-500"\}/g, "text-text-muted"],
  [/theme === "dark" \? "text-gray-400" : "text-gray-500"/g, "text-text-muted"],
  [/\$\{theme === "dark" \? "text-gray-300" : "text-gray-600"\}/g, "text-foreground-secondary"],
  [/theme === "dark" \? "text-gray-300" : "text-gray-600"/g, "text-foreground-secondary"],
  [/\$\{theme === "dark" \? "border-white\/10" : "border-gray-100"\}/g, "border-border-default"],
  [/theme === "dark" \? "border-white\/10" : "border-gray-100"/g, "border-border-default"],
  [/\$\{theme === "dark" \? "border-white\/10" : "border-gray-200"\}/g, "border-border-default"],
  [/theme === "dark" \? "border-white\/10" : "border-gray-200"/g, "border-border-default"],
  [/className=\{\`p-6 \$\{\}\`\}/g, 'className="p-6"'],
  [/className=\{\`p-5 \$\{\}\`\}/g, 'className="p-5"'],
  [/className=\{\`p-8 \$\{\}\`\}/g, 'className="p-8"'],
  [/className=\{\`p-4 \$\{\}\`\}/g, 'className="p-4"'],
  [/className=\{\`p-12 \$\{\}\`\}/g, 'className="p-12"'],
  [/className=\{\`overflow-hidden \$\{\}\`\}/g, 'className="overflow-hidden"'],
  [/className=\{\`p-6 \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-6"'],
  [/className=\{\`p-5 \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-5"'],
  [/className=\{\`p-8 \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-8"'],
  [/className=\{\`p-4 mb-6 \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-4 mb-6"'],
  [/className=\{\`p-12 text-center \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-12 text-center"'],
  [/className=\{\`overflow-hidden \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="overflow-hidden"'],
  [/className=\{\`mb-6 border-l-4 border-red-500 p-4 \$\{theme === "dark" \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="mb-6 border-l-4 border-red-500 p-4"'],
  [/className=\{\`p-6 \$\{isDark \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-6"'],
  [/className=\{\`p-5 \$\{isDark \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-5"'],
  [/className=\{\`p-6 \$\{isDark \? "bg-\[#112240\]" : "bg-white"\}\`\}/g, 'className="p-6"'],
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
  // Clean up empty template interpolations in className
  content = content.replace(/className=\{`([^`]*)\s+`\}/g, (m, inner) => {
    const cleaned = inner.replace(/\s{2,}/g, " ").trim();
    return cleaned ? `className={\`${cleaned}\`}` : 'className=""';
  });
  content = content.replace(/className="([^"]*)\s+"/g, 'className="$1"');
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log("updated:", path.relative(process.cwd(), file));
  }
}

console.log(`\nDone. ${changed} files updated.`);
