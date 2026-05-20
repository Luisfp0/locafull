import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const APP_PAGE_PATTERN = /\/app\/.*\/page\.tsx$/;
const APP_PAGE_ROOT = /\/app\/page\.tsx$/;

const INLINE_TYPE_PATTERN =
  /(?:^|\n)\s*(?:export\s+)?(?:type|interface)\s+[A-Z][A-Za-z0-9]*Props\b/m;
const NESTED_COMPONENT_PATTERN =
  /(?:^|\n)\s*(?:export\s+)?function\s+([A-Z][A-Za-z0-9]*)\s*\(/gm;
const INLINE_CONSTANTS_PATTERN =
  /(?:^|\n)\s*(?:export\s+)?const\s+[A-Z][A-Z0-9_]*\s*=\s[\s\S]*?\{[\s\S]*?\n\s*\};/m;

const APP_UI_IMPORT_PATTERN = /from\s+["']@\/components\/ui\//;
const APP_INLINE_UI_PATTERN =
  /<(Button|Input|Link|form|textarea|select|h1|h2|h3|section|dl|dt|dd)\b/;

export function isExcludedComponentFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");

  if (normalized.includes("/components/ui/")) return true;
  if (normalized.endsWith(".test.tsx") || normalized.endsWith(".test.ts")) {
    return true;
  }

  return false;
}

export function isAppPageFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return APP_PAGE_PATTERN.test(normalized) || APP_PAGE_ROOT.test(normalized);
}

export function isComponentIndexFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return (
    normalized.startsWith("src/components/") &&
    normalized.endsWith("/index.tsx") &&
    !isExcludedComponentFile(normalized)
  );
}

export function checkComponentIndex(content, relativePath) {
  const violations = [];

  if (INLINE_TYPE_PATTERN.test(content)) {
    violations.push(
      "types Props inline no index.tsx — mova para types.ts na mesma pasta.",
    );
  }

  const componentMatches = [...content.matchAll(NESTED_COMPONENT_PATTERN)].map(
    (match) => match[1],
  );
  const exportedComponents = [
    ...content.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
  ].map((match) => match[1]);

  const nestedComponents = componentMatches.filter(
    (name) => !exportedComponents.includes(name),
  );

  if (nestedComponents.length > 0) {
    violations.push(
      `subcomponente(s) inline (${nestedComponents.join(", ")}) — extraia para components/<Sub>/index.tsx.`,
    );
  }

  if (INLINE_CONSTANTS_PATTERN.test(content)) {
    violations.push(
      "constante estática inline no index.tsx — mova para constants.ts.",
    );
  }

  if (violations.length > 0) {
    return violations.map((message) => ({
      file: relativePath,
      rule: "component-index",
      message,
    }));
  }

  return [];
}

export function checkAppPage(content, relativePath) {
  const violations = [];

  if (APP_UI_IMPORT_PATTERN.test(content)) {
    violations.push(
      "app/ não importa @/components/ui/* — UI fica em components/<Feature>/.",
    );
  }

  if (APP_INLINE_UI_PATTERN.test(content)) {
    violations.push(
      "app/page.tsx com UI inline — use components/<Feature>/ e deixe a rota fina.",
    );
  }

  if (violations.length > 0) {
    return violations.map((message) => ({
      file: relativePath,
      rule: "app-thin",
      message,
    }));
  }

  return [];
}

export function checkFile(relativePath, content) {
  const normalized = relativePath.replaceAll("\\", "/");

  if (isComponentIndexFile(normalized)) {
    return checkComponentIndex(content, normalized);
  }

  if (isAppPageFile(normalized)) {
    return checkAppPage(content, normalized);
  }

  return [];
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (!/\.tsx?$/.test(entry.name)) continue;

    files.push(fullPath);
  }

  return files;
}

export function collectTargetFiles(explicitFiles = []) {
  if (explicitFiles.length > 0) {
    return explicitFiles
      .map((file) => path.resolve(ROOT, file))
      .filter((file) => fs.existsSync(file));
  }

  const appDir = path.join(SRC, "app");
  const componentsDir = path.join(SRC, "components");

  return [...walk(appDir), ...walk(componentsDir)];
}

export function runCheck(explicitFiles = []) {
  const files = collectTargetFiles(explicitFiles);
  const violations = [];

  for (const absolutePath of files) {
    const relativePath = path
      .relative(ROOT, absolutePath)
      .replaceAll("\\", "/");
    const content = fs.readFileSync(absolutePath, "utf8");
    violations.push(...checkFile(relativePath, content));
  }

  return violations;
}

export function formatViolations(violations) {
  return violations
    .map(
      (violation) =>
        `${violation.file}\n  [${violation.rule}] ${violation.message}`,
    )
    .join("\n\n");
}
