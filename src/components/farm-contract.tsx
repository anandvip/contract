import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";

const KANALS_PER_ACRE = 8;
const DATA_KEY = "farmContractLedger.v1";
const SETTINGS_KEY = "farmContractLedger.settings";

const FONTS = [
  { id: "ledger", label: "Ledger" },
  { id: "literata", label: "Literata", stack: '"Literata", Georgia, serif' },
  { id: "source", label: "Source Sans", stack: '"Source Sans 3", "Segoe UI", sans-serif' },
  { id: "georgia", label: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  { id: "courier", label: "Courier New", stack: '"Courier New", ui-monospace, monospace' },
  { id: "trebuchet", label: "Trebuchet MS", stack: '"Trebuchet MS", "Segoe UI", sans-serif' },
] as const;

type FontId = (typeof FONTS)[number]["id"];
type Experience = "" | "Good" | "Average" | "Poor";

type Season = {
  startYear: number;
  totalKanals: number;
  excludedKanals: number;
  ratePerAcre: number;
  contractor: string;
  experience: Experience;
  notes: string;
};

type Comparison = {
  prevYear: number;
  gap: number;
  rateDiff: number;
  ratePct: number;
  incomeDiff: number;
  incomePct: number;
  billedChanged: boolean;
};

type Enriched = Season & {
  billed: number;
  acres: number;
  perKanal: number;
  annual: number;
  half: number;
  monthly: number;
  cmp: Comparison | null;
};

type FormState = {
  startYear: string;
  contractor: string;
  totalKanals: string;
  excludedKanals: string;
  ratePerAcre: string;
  experience: Experience;
  notes: string;
};

type Errors = {
  year: string;
  total: string;
  excluded: string;
  rate: string;
};

const EMPTY_FORM: FormState = {
  startYear: "",
  contractor: "",
  totalKanals: "",
  excludedKanals: "",
  ratePerAcre: "",
  experience: "",
  notes: "",
};

const NO_ERRORS: Errors = { year: "", total: "", excluded: "", rate: "" };

const CSV_HEADERS = [
  "Season",
  "Start Year",
  "Season Span",
  "Contractor",
  "Total Kanals",
  "Excluded Kanals",
  "Billed Kanals",
  "Rate per Acre",
  "Per Kanal Rate",
  "Season Income",
  "Half-Yearly Income",
  "Monthly Income",
  "Compared With",
  "Rate Change",
  "Rate Change %",
  "Experience",
  "Notes",
];

const fieldClass =
  "w-full min-h-11 rounded-lg border border-line bg-card px-3 text-base text-ink " +
  "placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field";

function isFontId(value: unknown): value is FontId {
  return FONTS.some((font) => font.id === value);
}

function isExperience(value: string): value is Experience {
  return value === "" || value === "Good" || value === "Average" || value === "Poor";
}

function currentSeasonStart(date = new Date()): number {
  return date.getMonth() >= 4 ? date.getFullYear() : date.getFullYear() - 1;
}

function seasonLabel(year: number): string {
  return `${year}\u2013${String((year + 1) % 100).padStart(2, "0")}`;
}

function seasonSpan(year: number): string {
  return `May ${year} \u2013 May ${year + 1}`;
}

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function inr0(amount: number): string {
  return (
    "\u20b9" + Math.round(amount).toLocaleString("en-IN")
  );
}

function num(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "") as T | null;
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function asSeason(value: unknown): Season | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Season>;
  if (!Number.isInteger(row.startYear)) return null;
  if (typeof row.totalKanals !== "number" || typeof row.ratePerAcre !== "number") return null;
  const excluded = typeof row.excludedKanals === "number" ? row.excludedKanals : 0;
  const experience = typeof row.experience === "string" && isExperience(row.experience) ? row.experience : "";
  return {
    startYear: row.startYear as number,
    totalKanals: row.totalKanals,
    excludedKanals: excluded,
    ratePerAcre: row.ratePerAcre,
    contractor: typeof row.contractor === "string" ? row.contractor : "",
    experience,
    notes: typeof row.notes === "string" ? row.notes : "",
  };
}

function loadEntries(): Season[] {
  const raw = readJSON<unknown>(DATA_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(asSeason).filter((row): row is Season => row !== null);
}

function calc(entry: Season) {
  const billed = entry.totalKanals - entry.excludedKanals;
  const perKanal = entry.ratePerAcre / KANALS_PER_ACRE;
  const annual = perKanal * billed;
  return { billed, acres: billed / KANALS_PER_ACRE, perKanal, annual, half: annual / 2, monthly: annual / 12 };
}

function enriched(entries: Season[]): Enriched[] {
  const asc = [...entries].sort((a, b) => a.startYear - b.startYear);
  return asc.map((entry, index) => {
    const figures = calc(entry);
    const prev = index > 0 ? asc[index - 1] : null;
    let cmp: Comparison | null = null;
    if (prev) {
      const previous = calc(prev);
      cmp = {
        prevYear: prev.startYear,
        gap: entry.startYear - prev.startYear,
        rateDiff: entry.ratePerAcre - prev.ratePerAcre,
        ratePct: ((entry.ratePerAcre - prev.ratePerAcre) / prev.ratePerAcre) * 100,
        incomeDiff: figures.annual - previous.annual,
        incomePct: ((figures.annual - previous.annual) / previous.annual) * 100,
        billedChanged: Math.abs(figures.billed - previous.billed) > 1e-9,
      };
    }
    return { ...entry, ...figures, cmp };
  });
}

function signedInr(amount: number): string {
  const sign = amount >= 0 ? "+" : "\u2212";
  return `${sign}${inr0(Math.abs(amount))}`;
}

function Pct({ value, base }: { value: number | null; base?: string }) {
  if (value === null) {
    return (
      <span className="private inline-block rounded-full bg-bg px-2 py-0.5 text-xs font-semibold text-muted tabular-nums">
        {base || "Base"}
      </span>
    );
  }
  const tone =
    value > 0.0001 ? "bg-field-soft text-field" : value < -0.0001 ? "bg-danger-soft text-danger" : "bg-bg text-muted";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`private inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
      {sign}
      {value.toFixed(2)}%
    </span>
  );
}

function blankForm(entries: Season[]): { form: FormState; rateHint: string } {
  const last = [...entries].sort((a, b) => a.startYear - b.startYear).at(-1);
  return {
    form: {
      ...EMPTY_FORM,
      startYear: String(last ? last.startYear + 1 : currentSeasonStart()),
      totalKanals: last ? String(last.totalKanals) : "",
      excludedKanals: last ? String(last.excludedKanals) : "",
    },
    rateHint: last ? `Previous: ${inr0(last.ratePerAcre)} in ${seasonLabel(last.startYear)}` : "",
  };
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\ufeff/, "");
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((line) => line.some((part) => part.trim() !== ""));
}

export function FarmContractCalculator() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);
  const [font, setFont] = useState<FontId>("ledger");
  const [discreet, setDiscreet] = useState(false);
  const [entries, setEntries] = useState<Season[]>([]);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [rateHint, setRateHint] = useState("");
  const [targetPct, setTargetPct] = useState("");
  const [offeredRate, setOfferedRate] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const [openYears, setOpenYears] = useState<number[]>([]);

  useEffect(() => {
    const savedEntries = loadEntries();
    const saved = readJSON<{ dark?: boolean; font?: unknown; discreet?: boolean }>(SETTINGS_KEY, {});
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = blankForm(savedEntries);
    setEntries(savedEntries);
    setDark(typeof saved.dark === "boolean" ? saved.dark : prefersDark);
    setFont(isFontId(saved.font) ? saved.font : "ledger");
    setDiscreet(!!saved.discreet);
    setForm(next.form);
    setRateHint(next.rateHint);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeJSON(DATA_KEY, entries);
  }, [ready, entries]);

  useEffect(() => {
    if (!ready) return;
    writeJSON(SETTINGS_KEY, { dark, font, discreet });
  }, [ready, dark, font, discreet]);

  const list = enriched(entries);
  const newest = [...list].reverse();
  const latest = list.at(-1);
  const fontChoice = FONTS.find((item) => item.id === font);
  const fontStyle =
    fontChoice && "stack" in fontChoice
      ? ({ "--font-sans": fontChoice.stack, "--font-serif": fontChoice.stack } as CSSProperties)
      : undefined;

  const yearValue = parseInt(form.startYear, 10);
  const totalValue = parseFloat(form.totalKanals);
  const excludedValue = parseFloat(form.excludedKanals);
  const excludedSafe = Number.isNaN(excludedValue) ? 0 : excludedValue;
  const rateValue = parseFloat(form.ratePerAcre);
  const billedPreview =
    !Number.isNaN(totalValue) && totalValue > 0 && excludedSafe >= 0 && excludedSafe < totalValue
      ? totalValue - excludedSafe
      : null;

  const names = [...new Set(entries.map((entry) => entry.contractor.trim()).filter(Boolean))];

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function clearForm(nextEntries = entries) {
    const next = blankForm(nextEntries);
    setEditingYear(null);
    setForm(next.form);
    setRateHint(next.rateHint);
    setErrors(NO_ERRORS);
  }

  function startEdit(year: number) {
    const entry = entries.find((item) => item.startYear === year);
    if (!entry) return;
    setEditingYear(year);
    setForm({
      startYear: String(entry.startYear),
      contractor: entry.contractor,
      totalKanals: String(entry.totalKanals),
      excludedKanals: String(entry.excludedKanals),
      ratePerAcre: String(entry.ratePerAcre),
      experience: entry.experience,
      notes: entry.notes,
    });
    setRateHint("");
    setErrors(NO_ERRORS);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = { ...NO_ERRORS };
    let bad = false;
    if (Number.isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
      nextErrors.year = "Enter a year between 2000 and 2100";
      bad = true;
    }
    if (Number.isNaN(totalValue) || totalValue <= 0) {
      nextErrors.total = "Enter the total kanals";
      bad = true;
    }
    if (excludedSafe < 0 || (!Number.isNaN(totalValue) && excludedSafe >= totalValue)) {
      nextErrors.excluded = "Must be 0 or more, and less than total";
      bad = true;
    }
    if (Number.isNaN(rateValue) || rateValue <= 0) {
      nextErrors.rate = "Enter the contract rate per acre";
      bad = true;
    }
    setErrors(nextErrors);
    if (bad) return;

    const clash = entries.find((item) => item.startYear === yearValue);
    if (clash && yearValue !== editingYear) {
      const who = clash.contractor ? `, ${clash.contractor}` : "";
      const ok = window.confirm(
        `Season ${seasonLabel(yearValue)} is already recorded (${inr0(clash.ratePerAcre)} / acre${who}).\n\nReplace it with this entry?`,
      );
      if (!ok) return;
    }

    const record: Season = {
      startYear: yearValue,
      totalKanals: totalValue,
      excludedKanals: excludedSafe,
      ratePerAcre: rateValue,
      contractor: form.contractor.trim(),
      experience: form.experience,
      notes: form.notes.trim(),
    };
    const next = entries.filter((item) => item.startYear !== yearValue && item.startYear !== editingYear);
    next.push(record);
    setEntries(next);
    clearForm(next);
  }

  function deleteEntry(year: number) {
    const entry = entries.find((item) => item.startYear === year);
    if (!entry) return;
    const ok = window.confirm(
      `Delete season ${seasonLabel(year)} (${inr0(entry.ratePerAcre)} / acre)? This cannot be undone.`,
    );
    if (!ok) return;
    const next = entries.filter((item) => item.startYear !== year);
    setEntries(next);
    if (editingYear === year) clearForm(next);
  }

  function exportCSV() {
    if (!list.length) {
      setBackupMsg("Nothing to export yet.");
      return;
    }
    const rows = [CSV_HEADERS];
    newest.forEach((entry) => {
      rows.push([
        seasonLabel(entry.startYear),
        String(entry.startYear),
        seasonSpan(entry.startYear),
        entry.contractor,
        String(entry.totalKanals),
        String(entry.excludedKanals),
        String(entry.billed),
        entry.ratePerAcre.toFixed(2),
        entry.perKanal.toFixed(2),
        entry.annual.toFixed(2),
        entry.half.toFixed(2),
        entry.monthly.toFixed(2),
        entry.cmp ? seasonLabel(entry.cmp.prevYear) : "",
        entry.cmp ? entry.cmp.rateDiff.toFixed(2) : "",
        entry.cmp ? entry.cmp.ratePct.toFixed(2) : "",
        entry.experience,
        entry.notes,
      ]);
    });
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const today = new Date();
    link.href = URL.createObjectURL(blob);
    link.download = `farm-contract-ledger-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setBackupMsg(`Exported ${list.length} season${list.length > 1 ? "s" : ""}.`);
  }

  function importCSV(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCSV(String(reader.result ?? ""));
        const head = (rows.shift() ?? []).map((cell) => cell.trim().toLowerCase());
        const col = (name: string) => head.indexOf(name.toLowerCase());
        const yearCol = col("Start Year");
        const totalCol = col("Total Kanals");
        const excludedCol = col("Excluded Kanals");
        const rateCol = col("Rate per Acre");
        if ([yearCol, totalCol, rateCol].some((index) => index < 0)) throw new Error("Missing columns");
        const contractorCol = col("Contractor");
        const experienceCol = col("Experience");
        const notesCol = col("Notes");
        const incoming = rows
          .map((row) => {
            const experienceRaw = experienceCol >= 0 ? (row[experienceCol] || "").trim() : "";
            return {
              startYear: parseInt(row[yearCol] ?? "", 10),
              totalKanals: parseFloat(row[totalCol] ?? ""),
              excludedKanals: excludedCol >= 0 ? parseFloat(row[excludedCol] ?? "") || 0 : 0,
              ratePerAcre: parseFloat(row[rateCol] ?? ""),
              contractor: contractorCol >= 0 ? (row[contractorCol] || "").trim() : "",
              experience: isExperience(experienceRaw) ? experienceRaw : "",
              notes: notesCol >= 0 ? (row[notesCol] || "").trim() : "",
            } satisfies Season;
          })
          .filter(
            (entry) =>
              !Number.isNaN(entry.startYear) &&
              entry.totalKanals > 0 &&
              entry.ratePerAcre > 0 &&
              entry.excludedKanals < entry.totalKanals,
          );
        if (!incoming.length) throw new Error("No valid rows");
        const clashes = incoming.filter((entry) => entries.some((item) => item.startYear === entry.startYear)).length;
        const message =
          `Import ${incoming.length} season${incoming.length > 1 ? "s" : ""}?` +
          (clashes ? `\n\n${clashes} already recorded season${clashes > 1 ? "s" : ""} will be replaced.` : "");
        if (!window.confirm(message)) return;
        const years = new Set(incoming.map((entry) => entry.startYear));
        const next = entries.filter((item) => !years.has(item.startYear)).concat(incoming);
        setEntries(next);
        clearForm(next);
        setBackupMsg(`Imported ${incoming.length} season${incoming.length > 1 ? "s" : ""}.`);
      } catch {
        setBackupMsg("Could not read that file. Please use a CSV exported from this tool.");
      }
    };
    reader.readAsText(file);
  }

  const cagr = (() => {
    if (list.length < 2) return "Needs 2 seasons";
    const first = list[0];
    const last = list[list.length - 1];
    const span = last.startYear - first.startYear;
    if (span <= 0 || first.ratePerAcre <= 0) return "Needs 2 seasons";
    const growth = (Math.pow(last.ratePerAcre / first.ratePerAcre, 1 / span) - 1) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}% (${span} yr${span > 1 ? "s" : ""})`;
  })();

  const contractors = contractorRows(list);

  const plannerRows = plannerLines(latest, targetPct, offeredRate);

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      style={fontStyle}
      className={`min-h-screen bg-bg text-ink transition-colors duration-200 ${discreet ? "discreet" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:py-10">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Sun className="size-4 text-muted" aria-hidden="true" />
            <span>Light</span>
            <button
              type="button"
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark theme"
              onClick={() => setDark((value) => !value)}
              className={
                "relative h-6 w-12 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field " +
                (dark ? "bg-field" : "bg-line")
              }
            >
              <span
                className={
                  "absolute top-1 left-1 size-4 rounded-full bg-card transition-transform duration-200 " +
                  (dark ? "translate-x-6" : "")
                }
              />
            </button>
            <Moon className="size-4 text-muted" aria-hidden="true" />
            <span>Dark</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Discreet</span>
            <button
              type="button"
              role="switch"
              aria-checked={discreet}
              aria-label="Hide percentage figures"
              onClick={() => setDiscreet((value) => !value)}
              className={
                "relative h-6 w-12 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field " +
                (discreet ? "bg-field" : "bg-line")
              }
            >
              <span
                className={
                  "absolute top-1 left-1 size-4 rounded-full bg-card transition-transform duration-200 " +
                  (discreet ? "translate-x-6" : "")
                }
              />
            </button>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm sm:justify-start">
            <span className="text-muted">Font</span>
            <select
              value={font}
              onChange={(event) => {
                if (isFontId(event.target.value)) setFont(event.target.value);
              }}
              className="min-h-11 rounded-lg border border-line bg-card px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field"
            >
              {FONTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="h-1.5 bg-field" />
          <div className="px-5 py-6 sm:px-7">
            <div className="flex items-center justify-center gap-3">
              <img src="/favicon.svg" alt="" width="56" height="56" className="size-14 shrink-0 rounded-2xl shadow-sm ring-1 ring-line" />
              <h1 className="text-left font-serif text-2xl font-semibold leading-tight text-balance text-field">
                Farm Contract
                <span className="mt-0.5 block font-sans text-sm font-medium tracking-wide text-muted">Ledger</span>
              </h1>
            </div>
            <p className="mt-3 text-center text-sm text-pretty text-muted">
              Season-wise contract record · season runs May to May · 8 kanals = 1 acre
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat label="Seasons recorded" value={String(list.length)} />
              <Stat label="Latest rate / acre" value={latest ? inr0(latest.ratePerAcre) : "\u2014"} />
              <Stat label="Rate CAGR (avg yearly growth)" value={list.length ? cagr : "\u2014"} privateFigure />
              <Stat label="Total contract value" value={list.length ? inr0(list.reduce((sum, entry) => sum + entry.annual, 0)) : "\u2014"} />
            </div>
            <p className="discreet-note mt-3 text-sm text-muted">
              Discreet mode is on — all % figures and the planner are hidden.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-semibold text-field">
              {editingYear === null ? "Add season" : `Edit season ${seasonLabel(editingYear)}`}
            </h2>
            {editingYear !== null ? (
              <span className="rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field">Editing</span>
            ) : null}
          </div>
          <form ref={formRef} className="flex flex-col gap-4" onSubmit={saveEntry} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Season start year" error={errors.year}>
                <input
                  id="startYear"
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2100}
                  step={1}
                  placeholder="e.g. 2026"
                  value={form.startYear}
                  aria-invalid={errors.year ? true : undefined}
                  onChange={(event) => patch({ startYear: event.target.value })}
                  className={fieldClass}
                />
                {!Number.isNaN(yearValue) && yearValue >= 2000 && yearValue <= 2100 ? (
                  <p className="mt-1.5 text-sm text-muted">
                    Season {seasonLabel(yearValue)} · {seasonSpan(yearValue)}
                  </p>
                ) : null}
              </Field>
              <Field label="Contractor name">
                <input
                  id="contractor"
                  type="text"
                  list="contractorList"
                  autoComplete="off"
                  placeholder="Name"
                  value={form.contractor}
                  onChange={(event) => patch({ contractor: event.target.value })}
                  className={fieldClass}
                />
                <datalist id="contractorList">
                  {names.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Total land (kanals)" error={errors.total}>
                <input
                  id="totalKanals"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 24"
                  value={form.totalKanals}
                  aria-invalid={errors.total ? true : undefined}
                  onChange={(event) => patch({ totalKanals: event.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Excluded from billing (kanals)" error={errors.excluded}>
                <input
                  id="excludedKanals"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={form.excludedKanals}
                  aria-invalid={errors.excluded ? true : undefined}
                  onChange={(event) => patch({ excludedKanals: event.target.value })}
                  className={fieldClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Contract rate per acre (₹ / season)" error={errors.rate}>
                  <input
                    id="ratePerAcre"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="e.g. 70000"
                    value={form.ratePerAcre}
                    aria-invalid={errors.rate ? true : undefined}
                    onChange={(event) => patch({ ratePerAcre: event.target.value })}
                    className={fieldClass}
                  />
                  {rateHint ? <p className="mt-1.5 text-sm text-muted">{rateHint}</p> : null}
                </Field>
              </div>
            </div>
            <p className="rounded-lg border-l-4 border-field bg-field-soft px-3 py-2 text-sm">
              Billed area:{" "}
              <strong className="font-semibold text-field tabular-nums">
                {billedPreview === null
                  ? "\u2014"
                  : `${num(billedPreview)} kanals (${num(billedPreview / KANALS_PER_ACRE)} acres)${
                      !Number.isNaN(rateValue) && rateValue > 0
                        ? ` \u2192 ${inr0((rateValue / KANALS_PER_ACRE) * billedPreview)} / season`
                        : ""
                    }`}
              </strong>
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Experience with contractor">
                <select
                  id="experience"
                  value={form.experience}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (isExperience(value)) patch({ experience: value });
                  }}
                  className={fieldClass}
                >
                  <option value="">— Not rated —</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Payment timeliness, field care, anything worth remembering for rotation"
                  value={form.notes}
                  onChange={(event) => patch({ notes: event.target.value })}
                  className={`${fieldClass} min-h-20 py-2`}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-field px-4 text-base font-semibold text-on-field hover:bg-field-deep"
              >
                {editingYear === null ? "Save season" : "Update season"}
              </button>
              <button
                type="button"
                onClick={() => clearForm()}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft"
              >
                {editingYear === null ? "Clear" : "Cancel"}
              </button>
            </div>
          </form>
        </section>

        <section className="private rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-semibold text-field">Negotiation planner</h2>
            <span className="rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field">Private</span>
          </div>
          <p className="mb-4 text-sm text-muted">
            {latest
              ? `Based on ${seasonLabel(latest.startYear)}: ${inr0(latest.ratePerAcre)} / acre on ${num(latest.billed)} billed kanals.`
              : "Save at least one season to use the planner."}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Target increase (%)">
              <input
                id="targetPct"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="e.g. 6.5"
                value={targetPct}
                onChange={(event) => setTargetPct(event.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Offered rate / acre (₹)">
              <input
                id="offeredRate"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="e.g. 83000"
                value={offeredRate}
                onChange={(event) => setOfferedRate(event.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
          {plannerRows.length ? <div className="mt-3">{plannerRows}</div> : null}
        </section>

        <section className="rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-semibold text-field">Season ledger</h2>
            <span className="rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field">Newest first</span>
          </div>
          <div id="ledger" className="flex flex-col gap-3">
            {newest.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                No seasons yet. Add your first season above — each one will appear here as a collapsible card.
              </p>
            ) : (
              newest.map((entry) => (
                <SeasonCard
                  key={entry.startYear}
                  entry={entry}
                  open={openYears.includes(entry.startYear)}
                  onToggle={(open) => {
                    setOpenYears((current) => {
                      const has = current.includes(entry.startYear);
                      if (open && !has) return [...current, entry.startYear];
                      if (!open && has) return current.filter((year) => year !== entry.startYear);
                      return current;
                    });
                  }}
                  onEdit={startEdit}
                  onDelete={deleteEntry}
                />
              ))
            )}
          </div>
          <p className="mt-4 text-sm text-pretty text-muted">
            Figures are gross — before expenses, commission or tax. Monthly income is the season amount spread over 12
            months; actual payments usually follow the crop cycle.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7">
          <h2 className="mb-3 font-serif text-xl font-semibold text-field">Contractor history</h2>
          {contractors.length === 0 ? (
            <p className="py-2 text-sm text-muted">
              Contractor names you record will be summarised here for rotation decisions.
            </p>
          ) : (
            <div>
              {contractors.map((row) => (
                <div key={row.name.toLowerCase()} className="border-b border-line py-3 last:border-b-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold break-words">{row.name}</p>
                    <p className="text-sm text-muted">{row.lastExp ? `Last rated: ${row.lastExp}` : "Not rated"}</p>
                  </div>
                  <p className="text-sm text-muted">
                    {row.seasons.length} season{row.seasons.length > 1 ? "s" : ""}:{" "}
                    {[...row.seasons].sort((a, b) => b - a).map(seasonLabel).join(", ")} · Total {inr0(row.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7">
          <h2 className="mb-2 font-serif text-xl font-semibold text-field">Backup</h2>
          <p className="mb-4 text-sm text-muted">
            Your data lives only in this browser. Export a CSV regularly — it opens in Excel, Numbers and Google Sheets,
            and can be imported back here.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft"
            >
              Import CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importCSV(file);
                event.target.value = "";
              }}
            />
          </div>
          {backupMsg ? <p className="mt-3 text-sm text-muted">{backupMsg}</p> : null}
        </section>

        <footer className="text-center text-sm text-muted">8 kanals = 1 acre · remembered on this device</footer>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span className="mb-1.5 block">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-sm font-normal text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Stat({ label, value, privateFigure = false }: { label: string; value: string; privateFigure?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border border-line bg-bg px-3 py-3 ${privateFigure ? "private" : ""}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold break-words text-field tabular-nums">{value}</p>
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={
        "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 py-2.5 " +
        (highlight ? "my-1 rounded-lg border-l-4 border-field bg-field-soft" : "border-b border-line last:border-b-0")
      }
    >
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className={"text-right text-sm font-semibold text-field tabular-nums " + (highlight ? "text-base" : "")}>
        {value}
      </dd>
    </div>
  );
}

function SeasonCard({
  entry,
  open,
  onToggle,
  onEdit,
  onDelete,
}: {
  entry: Enriched;
  open: boolean;
  onToggle: (open: boolean) => void;
  onEdit: (year: number) => void;
  onDelete: (year: number) => void;
}) {
  const comparison = entry.cmp;
  const versus = comparison
    ? comparison.gap === 1
      ? "vs previous season"
      : `vs ${seasonLabel(comparison.prevYear)} (${comparison.gap}-yr gap)`
    : "";
  return (
    <details
      className="season overflow-hidden rounded-xl border border-line border-l-4 border-l-field bg-bg"
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
    >
      <summary className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3">
        <span className="font-semibold">
          {seasonLabel(entry.startYear)}{" "}
          <small className="font-normal text-muted">{seasonSpan(entry.startYear)}</small>
        </span>
        <span className="text-right">
          <span className="font-semibold text-field tabular-nums">{inr0(entry.ratePerAcre)}</span>
          <ChevronDown className="chev ml-1 inline size-4 text-muted transition-transform duration-200" aria-hidden="true" />
          <br />
          {comparison ? <Pct value={comparison.ratePct} /> : <Pct value={null} base="Base season" />}
        </span>
        <span className="text-sm text-muted break-words">
          {entry.contractor || "Contractor not recorded"}
          {entry.experience ? ` · ${entry.experience}` : ""}
        </span>
      </summary>
      <div className="px-3 pb-4">
        <p className="mt-1 px-2 text-xs font-semibold tracking-wide text-muted uppercase">Land</p>
        <dl>
          <Row label="Total land" value={`${num(entry.totalKanals)} kanals`} />
          <Row label="Excluded from billing" value={`${num(entry.excludedKanals)} kanals`} />
          <Row label="Billed area" value={`${num(entry.billed)} kanals (${num(entry.acres)} acres)`} />
        </dl>
        <p className="mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase">Results</p>
        <dl>
          <Row label="Rate per acre" value={inr(entry.ratePerAcre)} />
          <Row label="Per kanal rate" value={inr(entry.perKanal)} />
          <Row label="Total season income" value={inr(entry.annual)} highlight />
          <Row label="Half-yearly income" value={inr(entry.half)} />
          <Row label="Monthly income" value={inr(entry.monthly)} />
        </dl>
        {comparison ? (
          <div className="private">
            <p className="mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase">Change {versus}</p>
            <dl>
              <Row
                label="Rate change"
                value={
                  <>
                    {signedInr(comparison.rateDiff)} / acre <Pct value={comparison.ratePct} />
                  </>
                }
              />
              {comparison.billedChanged ? (
                <Row
                  label="Income change (area also changed)"
                  value={
                    <>
                      {signedInr(comparison.incomeDiff)} <Pct value={comparison.incomePct} />
                    </>
                  }
                />
              ) : null}
            </dl>
          </div>
        ) : null}
        {entry.notes ? (
          <>
            <p className="mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase">Notes</p>
            <p className="px-2 py-2 text-sm whitespace-pre-wrap break-words">{entry.notes}</p>
          </>
        ) : null}
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(entry.startYear)}
            className="inline-flex min-h-11 items-center rounded-lg border border-line bg-card px-3 text-sm font-semibold hover:bg-field-soft"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.startYear)}
            className="inline-flex min-h-11 items-center rounded-lg border border-danger px-3 text-sm font-semibold text-danger hover:bg-danger-soft"
          >
            Delete
          </button>
        </div>
      </div>
    </details>
  );
}

function contractorRows(list: Enriched[]) {
  const map = new Map<string, { name: string; seasons: number[]; total: number; lastExp: string; lastYear: number }>();
  list.forEach((entry) => {
    const name = entry.contractor.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name, seasons: [], total: 0, lastExp: "", lastYear: 0 });
    const row = map.get(key);
    if (!row) return;
    row.seasons.push(entry.startYear);
    row.total += entry.annual;
    if (entry.startYear >= row.lastYear) {
      row.lastYear = entry.startYear;
      row.lastExp = entry.experience || row.lastExp;
      row.name = name;
    }
  });
  return [...map.values()].sort((a, b) => b.lastYear - a.lastYear);
}

function plannerLines(latest: Enriched | undefined, targetPct: string, offeredRate: string) {
  if (!latest) return [];
  const rows: ReactNode[] = [];
  const percent = parseFloat(targetPct);
  if (!Number.isNaN(percent)) {
    const rate = latest.ratePerAcre * (1 + percent / 100);
    const rounded = Math.round(rate / 500) * 500;
    const income = (rounded / KANALS_PER_ACRE) * latest.billed;
    rows.push(<Row key="raw" label={`Rate at ${percent}%`} value={inr0(rate)} />);
    rows.push(
      <Row
        key="rounded"
        label="Rounded to ₹500"
        highlight
        value={
          <>
            {inr0(rounded)} <Pct value={((rounded - latest.ratePerAcre) / latest.ratePerAcre) * 100} />
          </>
        }
      />,
    );
    rows.push(<Row key="income" label="Season income at rounded rate" value={inr0(income)} />);
  }
  const offer = parseFloat(offeredRate);
  if (!Number.isNaN(offer) && offer > 0) {
    const change = ((offer - latest.ratePerAcre) / latest.ratePerAcre) * 100;
    rows.push(
      <Row
        key="offer"
        label={`Offer of ${inr0(offer)} is`}
        value={
          <>
            {signedInr(offer - latest.ratePerAcre)} <Pct value={change} />
          </>
        }
      />,
    );
    rows.push(
      <Row key="offer-income" label="Season income at offer" value={inr0((offer / KANALS_PER_ACRE) * latest.billed)} />,
    );
  }
  return rows;
}
