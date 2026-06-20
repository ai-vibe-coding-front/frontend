export interface WeatherResult {
  skyLabel: string;
  pty: number;
  temperature: number | null;
}

const BASE_URL =
  "https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_vsrt_grd";
const GRID_COLS = 149;
const GRID_ROWS = 253;
const VALS_PER_LINE = 20;
const LINES_PER_ROW = Math.ceil(GRID_COLS / VALS_PER_LINE);

function calcTimes(): { tmfc: string; tmef: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const prevKst = new Date(kst.getTime() - 60 * 60 * 1000);

  const fmt = (d: Date) => ({
    y: d.getUTCFullYear(),
    mo: String(d.getUTCMonth() + 1).padStart(2, "0"),
    dd: String(d.getUTCDate()).padStart(2, "0"),
    hh: String(d.getUTCHours()).padStart(2, "0"),
  });

  const p = fmt(prevKst);
  const c = fmt(kst);

  return {
    tmfc: `${p.y}${p.mo}${p.dd}${p.hh}00`,
    tmef: `${c.y}${c.mo}${c.dd}${c.hh}`,
  };
}

function extractGridValue(text: string, nx: number, ny: number): number | null {
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  const rowIndex = GRID_ROWS - ny;
  const lineStart = rowIndex * LINES_PER_ROW;
  const offset = nx - 1;
  const lineOff = Math.floor(offset / VALS_PER_LINE);
  const posInLine = offset % VALS_PER_LINE;
  const targetLine = lineStart + lineOff;

  if (targetLine >= lines.length) return null;

  const vals = lines[targetLine]
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "");

  if (posInLine >= vals.length) return null;

  const val = parseFloat(vals[posInLine]);
  if (isNaN(val) || val <= -99) return null;

  return val;
}

async function fetchVar(
  varName: string,
  tmfc: string,
  tmef: string,
  nx: number,
  ny: number,
  authKey: string,
): Promise<number | null> {
  try {
    const params = new URLSearchParams({ tmfc, tmef, vars: varName, authKey });
    const res = await fetch(`${BASE_URL}?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    return extractGridValue(text, nx, ny);
  } catch {
    return null;
  }
}

function skyCodeToLabel(code: number | null): string {
  if (code === null) return "맑음";
  if (code === 2) return "구름조금";
  if (code === 3) return "구름많음";
  if (code === 4) return "흐림";
  return "맑음";
}

export async function getWeather(
  nx: number,
  ny: number,
): Promise<WeatherResult> {
  const authKey = process.env.WEATHER_API_KEY;
  if (!authKey) throw new Error("WEATHER_API_KEY not set");

  const { tmfc, tmef } = calcTimes();

  const [T1H, SKY, PTY] = await Promise.all([
    fetchVar("T1H", tmfc, tmef, nx, ny, authKey),
    fetchVar("SKY", tmfc, tmef, nx, ny, authKey),
    fetchVar("PTY", tmfc, tmef, nx, ny, authKey),
  ]);

  return {
    skyLabel: skyCodeToLabel(SKY),
    pty: PTY ?? 0,
    temperature: T1H,
  };
}
