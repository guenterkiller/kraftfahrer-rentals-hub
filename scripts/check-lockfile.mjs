#!/usr/bin/env node
// Prüft ohne Netzwerk und ohne Zusatzpakete, ob package-lock.json zu package.json passt,
// also ob `npm ci` die Installation akzeptieren wird. Exit 1 bei jeder Abweichung.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SECTIONS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

const parse = (v) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(v.trim());
  return m ? { n: [+m[1], +m[2], +m[3]], pre: m[4] ?? null } : null;
};
const cmp = (a, b) => {
  for (let i = 0; i < 3; i++) if (a.n[i] !== b.n[i]) return a.n[i] - b.n[i];
  if (a.pre === b.pre) return 0;
  if (a.pre === null) return 1;
  if (b.pre === null) return -1;
  const x = a.pre.split("."), y = b.pre.split(".");
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] === undefined) return -1;
    if (y[i] === undefined) return 1;
    if (x[i] === y[i]) continue;
    const nx = /^\d+$/.test(x[i]), ny = /^\d+$/.test(y[i]);
    if (nx && ny) return +x[i] - +y[i];
    if (nx) return -1;
    if (ny) return 1;
    return x[i] < y[i] ? -1 : 1;
  }
  return 0;
};

/** true/false, oder null wenn die Angabe nicht prüfbar ist (git, file, npm:-Alias, komplexe Bereiche). */
export function satisfies(version, spec) {
  const s = spec.trim();
  if (s === "*" || s === "" || s === "latest") return true;
  if (s.includes("||")) {
    const parts = s.split("||").map((p) => satisfies(version, p));
    return parts.includes(true) ? true : parts.includes(null) ? null : false;
  }
  const v = parse(version);
  const m = /^(\^|~|>=|=)?\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(s);
  if (!v || !m) return null;
  const base = parse(m[2]);
  if (v.pre && !(base.pre && v.n.join(".") === base.n.join("."))) return false;
  const op = m[1] ?? "=";
  if (op === "=") return cmp(v, base) === 0;
  if (cmp(v, base) < 0) return false;
  if (op === ">=") return true;
  if (op === "~") return v.n[0] === base.n[0] && v.n[1] === base.n[1];
  // ^
  if (base.n[0] > 0) return v.n[0] === base.n[0];
  if (base.n[1] > 0) return v.n[0] === 0 && v.n[1] === base.n[1];
  return v.n[0] === 0 && v.n[1] === 0 && v.n[2] === base.n[2];
}

export function checkLock(pkg, lock) {
  const errors = [];
  const warnings = [];
  if (!lock.lockfileVersion || lock.lockfileVersion < 2 || !lock.packages) {
    return { errors: ["package-lock.json hat kein lockfileVersion>=2 mit 'packages'."], warnings };
  }
  const root = lock.packages[""] ?? {};
  for (const section of SECTIONS) {
    const want = pkg[section] ?? {};
    const have = root[section] ?? {};
    for (const name of new Set([...Object.keys(want), ...Object.keys(have)])) {
      if (!(name in have)) { errors.push(`${section}: ${name} fehlt in package-lock.json (package.json: ${want[name]})`); continue; }
      if (!(name in want)) { errors.push(`${section}: ${name} steht nur in package-lock.json (${have[name]})`); continue; }
      if (want[name] !== have[name]) errors.push(`${section}: ${name} package.json "${want[name]}" ≠ package-lock.json "${have[name]}"`);
      if (section === "peerDependencies") continue;
      const entry = lock.packages[`node_modules/${name}`];
      if (!entry) {
        if (section !== "optionalDependencies") errors.push(`${name}: kein Eintrag node_modules/${name} in package-lock.json`);
        continue;
      }
      const ok = entry.version ? satisfies(entry.version, want[name]) : null;
      if (ok === false) errors.push(`${name}: gesperrte Version ${entry.version} erfüllt package.json "${want[name]}" nicht`);
      else if (ok === null) warnings.push(`${name}: Angabe "${want[name]}" nicht automatisch prüfbar (gesperrt: ${entry.version ?? "?"})`);
      if (entry.version && !entry.link && (!entry.resolved || !entry.integrity)) errors.push(`${name}: Eintrag ohne resolved/integrity`);
      else if (entry.resolved && entry.version && entry.resolved.includes("registry.npmjs.org") && !entry.resolved.endsWith(`-${entry.version}.tgz`)) {
        errors.push(`${name}: resolved-URL passt nicht zu Version ${entry.version}`);
      }
    }
  }
  if (pkg.name !== undefined && lock.name !== pkg.name) warnings.push(`name: package.json "${pkg.name}" ≠ package-lock.json "${lock.name}"`);
  return { errors, warnings };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dir = resolve(process.argv[2] ?? ".");
  const pkg = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8"));
  const lock = JSON.parse(readFileSync(resolve(dir, "package-lock.json"), "utf8"));
  const { errors, warnings } = checkLock(pkg, lock);
  for (const w of warnings) console.warn(`[lock-check] Hinweis: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`[lock-check] FEHLER: ${e}`);
    console.error(`[lock-check] package-lock.json passt nicht zu package.json (${errors.length} Abweichung(en)). npm ci würde abbrechen.`);
    console.error("[lock-check] Reparatur: 'npm install --package-lock-only --legacy-peer-deps' ausführen und package-lock.json committen.");
    process.exit(1);
  }
  console.log("[lock-check] OK: package-lock.json passt zu package.json.");
}
