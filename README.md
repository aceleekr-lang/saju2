# 命鏡 · 명경 — 사주 인생행로·직설 운세 (독립 배포판)

Claude 아티팩트로 만든 앱을 외부 웹에 배포할 수 있게 변환한 버전입니다.
사주 계산(명식·신살·귀인·대운·신강약·용신·절입시각)은 전부 브라우저에서 돌고,
AI 풀이 생성만 서버(프록시)를 거쳐 Anthropic API를 호출합니다.
**API 키는 서버에만 저장되고 방문자에게 노출되지 않습니다.**

```
myeonggyeong/
├── api/saju.js        ← 서버리스 프록시 (API 키·사용량 제한은 여기서만)
├── src/App.jsx        ← 앱 본체 (사주 계산 + 화면)
├── src/main.jsx
├── public/og.png      ← 카톡 공유 썸네일 (1200×630)
├── index.html
├── package.json
└── vite.config.js
```

---

## 배포 순서 (Vercel 무료 플랜 기준, 약 15분)

### 1단계. Anthropic API 키 발급
1. https://platform.claude.com 가입
2. 좌측 **API Keys** → **Create Key** → 키 복사 (`sk-ant-...`)
3. **Settings → Limits**에서 월 지출 한도(예: $5)를 꼭 걸어두세요.
   앱이 퍼져도 이 금액 이상은 절대 청구되지 않습니다.

### 2단계. GitHub에 올리기
1. https://github.com 가입 → **New repository** (이름 예: `myeonggyeong`, Private 가능)
2. 이 폴더의 파일 전부를 업로드
   - 웹에서: repo 화면 → **Add file → Upload files** → 폴더째 드래그
   - `node_modules`, `dist` 폴더는 올리지 마세요 (없어도 됩니다)

### 3단계. Vercel 연결
1. https://vercel.com 가입 (GitHub 계정으로 로그인)
2. **Add New → Project** → 방금 만든 repo **Import**
3. Framework가 **Vite**로 자동 인식됩니다 → 그대로 두고
4. **Environment Variables**에 추가:
   - Name: `ANTHROPIC_API_KEY`
   - Value: 1단계에서 복사한 키
5. **Deploy** 클릭 → 1~2분 뒤 `https://myeonggyeong-xxx.vercel.app` 주소 완성

이후 GitHub에 파일을 수정해 올리면 자동으로 재배포됩니다.

### 로컬에서 테스트하려면 (선택)
```bash
npm install
npx vercel dev        # /api 프록시까지 포함해 http://localhost:3000 실행
```
(`npm run dev`는 화면만 뜨고 AI 호출은 안 됩니다 — 프록시가 Vercel 전용이라서요.)

---

## 이 배포판의 구조 (아티팩트판과 다른 점)

- **호출 통합**: 아티팩트에서는 응답 길이 제한 때문에 감정 1회에 12건을 호출했지만,
  배포판은 max_tokens 3,000으로 **4건**(인생행로 1 + 운세 1 + 대운 4개씩 2)에 끝냅니다.
  비용과 로딩 시간이 약 1/3입니다.
- **감정 1회 비용**: 4건 호출 ≈ $0.08 안팎 (Sonnet 4.6 기준, 약 110원)
  - 비용을 1/3로: `api/saju.js`에서 model을 `claude-haiku-4-5-20251001`로 변경
    (단, 풀이 문장의 깊이는 Sonnet이 확실히 좋습니다)
- **결과 캐시**: 감정 결과가 방문자 기기(localStorage)에 저장돼,
  같은 기기에서 같은 사주를 다시 보면 API 호출 없이 즉시 뜹니다.

## 포함된 보호·공유 기능

### IP당 하루 3회 감정 제한 (이미 적용됨)
`api/saju.js`에 IP당 **하루 3회 감정**(한국시간 0시 리셋) 제한이 들어 있습니다.
감정 1회는 runId로 묶여서, 일부 호출이 실패해 **다시 읽어도 횟수가 깎이지 않습니다.**
초과하면 "오늘 사용 한도는 다 소진했습니다. 내일 다시 시도하세요."가 화면에 뜹니다.
한도를 바꾸려면 파일 상단의 `LIMIT_RUNS` 숫자만 수정하면 됩니다.
(서버리스 특성상 서버가 재시동되면 카운트가 초기화될 수 있는 1차 방어선입니다.
반드시 Anthropic 콘솔의 월 지출 한도와 함께 쓰세요.)

### 카카오톡 공유 썸네일 (배포 후 1분 마무리 필요)
`public/og.png`(1200×630 썸네일)와 `index.html`의 OG 태그가 포함돼 있습니다.
배포가 끝나 실제 주소가 나오면:
1. `index.html`에서 `YOUR-DOMAIN.vercel.app` 3곳을 실제 주소로 교체 → 재배포
2. 카카오톡은 미리보기를 캐시하므로, 이미 한 번 공유해봤다면
   https://developers.kakao.com/tool/clear/og 에서 주소를 넣고 캐시 초기화
이후 카카오톡·문자·페이스북 공유 시 命鏡 썸네일 카드가 뜹니다.
썸네일을 바꾸고 싶으면 `public/og.png`만 교체하면 됩니다.

## 주의
- `ANTHROPIC_API_KEY`를 코드에 직접 쓰거나 GitHub에 올리지 마세요.
  반드시 Vercel 환경변수로만 넣어야 합니다.
- 본 앱은 고전 명리 해석 전통에 따른 참고용이며 예언·의료·법률 조언이 아닙니다.
