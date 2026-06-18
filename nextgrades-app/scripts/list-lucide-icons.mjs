import fs from "fs";
import path from "path";

const icons = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") walk(p);
    else if (/\.(tsx?|jsx?|mts)$/.test(entry.name)) {
      const text = fs.readFileSync(p, "utf8");
      const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
      let m;
      while ((m = re.exec(text))) {
        for (const part of m[1].split(",")) {
          let s = part.trim().replace(/^type\s+/, "");
          const alias = s.match(/^(\w+)\s+as\s+\w+$/);
          if (alias) icons.add(alias[1]);
          else if (s && !s.startsWith("type")) icons.add(s.split(/\s+/)[0]);
        }
      }
    }
  }
}

walk("src");
console.log([...icons].sort().join("\n"));
