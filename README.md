# age-of-sail-assets

**부서진 나침반(age-of-sail)** 의 그림·소리 서버입니다. GitHub Pages로 열립니다:
`https://minjunkimsdaads.github.io/age-of-sail-assets/`

- 직접 고치지 마세요. 이 레포의 내용은 age-of-sail 레포에서 `pnpm assets:publish` 가 만듭니다
  (파일 복사 · 목록 · 정리 · 커밋). 그다음 여기서 `git push` 하면 Actions(`pages.yml`)가 검사 후 배포합니다.
- `hires/` — 해시 이름 파일(`이름.<sha256 앞 8자리>.png|ktx2|ogg`). 내용이 바뀌면 이름도 바뀝니다.
- `manifests/` — 올릴 때마다의 목록 사본. 최근 3개가 쓰는 파일만 남깁니다(예전 게임을 켜 둔 사람을 위해).
- `asset-manifest.json` — 가장 최근 목록.
- 소리의 출처·라이선스(CC0)는 age-of-sail 레포 `docs/slice-act1/소리_출처.txt`.
