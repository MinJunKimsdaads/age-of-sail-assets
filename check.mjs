#!/usr/bin/env node
/**
 * age-of-sail-assets 검사 (Pages 배포 전, CI에서) — node check.mjs
 * 이 파일은 age-of-sail 레포의 tools/asset-repo/ 에서 복사됩니다. 여기서 고치지 말고 그쪽에서.
 *
 * 1. hires/ 아래 해시 이름 파일(이름.<해시8>.확장자)의 해시 = 내용 sha256 앞 8자리
 * 2. manifests/*.json 이 가리키는 파일이 모두 있고 크기가 맞음 (내용은 1의 이름 해시로)
 * 3. 맨 위 asset-manifest.json = 가장 최근 manifests/ 와 같음
 * 외부 패키지 없이 Node만으로 돕니다.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const HASHED = /\.([0-9a-f]{8})\.[^./]+$/;

/** 폴더 아래 모든 파일 (상대 경로, / 구분) */
export function walk(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split(sep).join('/'));
  }
  return out.sort();
}

/** 문제 목록 (빈 배열이면 통과). read(path) → Buffer, list() → hires/ 아래 파일 경로 */
export function checkRepo({ files, manifests, latest, read, size }) {
  const problems = [];
  for (const f of files) {
    const m = HASHED.exec(f);
    if (!m) {
      problems.push(`해시 이름이 아님: ${f}`);
      continue;
    }
    const sha = createHash('sha256').update(read(f)).digest('hex');
    if (!sha.startsWith(m[1])) problems.push(`내용이 이름의 해시와 다름: ${f}`);
  }
  const have = new Set(files);
  for (const [name, man] of manifests) {
    for (const e of Object.values(man.files ?? {})) {
      if (!have.has(e.file)) problems.push(`${name}: 파일 없음 ${e.file}`);
      else if (size(e.file) !== e.size) problems.push(`${name}: 크기 다름 ${e.file}`);
    }
  }
  if (manifests.length && latest !== undefined) {
    const [lastName, last] = manifests.at(-1);
    if (JSON.stringify(last) !== JSON.stringify(latest))
      problems.push(`asset-manifest.json 이 가장 최근 목록(${lastName})과 다름`);
  }
  return problems;
}

function main() {
  const root = resolve(import.meta.dirname);
  const files = walk(join(root, 'hires')).map((f) => `hires/${f}`);
  const manDir = join(root, 'manifests');
  const manifests = walk(manDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, JSON.parse(readFileSync(join(manDir, f), 'utf8'))]);
  const latestPath = join(root, 'asset-manifest.json');
  const latest = existsSync(latestPath) ? JSON.parse(readFileSync(latestPath, 'utf8')) : undefined;
  const problems = checkRepo({
    files,
    manifests,
    latest,
    read: (f) => readFileSync(join(root, f)),
    size: (f) => statSync(join(root, f)).size,
  });
  if (problems.length) {
    console.error(`검사 실패 ${problems.length}건:`);
    for (const p of problems.slice(0, 30)) console.error('  ' + p);
    process.exit(1);
  }
  console.log(`검사 통과: 파일 ${files.length}개 · 목록 ${manifests.length}개`);
}

if (process.argv[1] === import.meta.filename) main();
