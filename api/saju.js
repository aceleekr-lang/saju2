// Vercel 서버리스 함수: Anthropic API 프록시 + IP당 하루 감정 횟수 제한
// API 키는 브라우저에 절대 노출되지 않고 이 서버에서만 사용됩니다.

const LIMIT_RUNS = 3;          // IP당 하루 감정(runId) 횟수 — 한국시간 0시 리셋
const MAX_CALLS_PER_RUN = 12;  // 같은 감정 안에서의 호출 여유(정상 4건 + 재시도)
const mem = new Map();         // ip -> { day, runs: Map(runId -> callCount) }

const kstDay = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "POST만 허용됩니다" } });
  }
  const { prompt, runId } = req.body || {};
  if (!prompt || typeof prompt !== "string" || prompt.length > 20000 ||
      !runId || typeof runId !== "string" || runId.length > 40) {
    return res.status(400).json({ error: { message: "잘못된 요청입니다" } });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: "서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다" } });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
    || (req.socket && req.socket.remoteAddress) || "unknown";
  const day = kstDay();
  let rec = mem.get(ip);
  if (!rec || rec.day !== day) { rec = { day, runs: new Map() }; mem.set(ip, rec); }
  if (!rec.runs.has(runId)) {
    if (rec.runs.size >= LIMIT_RUNS) {
      return res.status(429).json({ error: { message: "오늘 사용 한도는 다 소진했습니다. 내일 다시 시도하세요." } });
    }
    rec.runs.set(runId, 0);
  }
  const used = rec.runs.get(runId);
  if (used >= MAX_CALLS_PER_RUN) {
    return res.status(429).json({ error: { message: "요청이 너무 잦습니다. 잠시 후 다시 시도하세요." } });
  }
  rec.runs.set(runId, used + 1);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", // 비용을 1/3로 줄이려면 "claude-haiku-4-5-20251001"
        max_tokens: 3000,           // 통합 호출용 — 4건으로 전체 감정 완성
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: { message: "업스트림 호출 실패: " + e.message } });
  }
}
