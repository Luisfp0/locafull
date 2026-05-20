#!/usr/bin/env node

import { formatViolations, runCheck } from "./folder-conventions/check.mjs";

const explicitFiles = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--"));
const violations = runCheck(explicitFiles);

if (violations.length > 0) {
  console.error(
    "Convenções de pastas violadas (admin-checkout-front):\n\n" +
      formatViolations(violations) +
      "\n\nVeja AGENTS.md e docs/superpowers/specs/2026-05-19-folder-conventions-design.md",
  );
  process.exit(1);
}

console.log("Convenções de pastas OK.");
