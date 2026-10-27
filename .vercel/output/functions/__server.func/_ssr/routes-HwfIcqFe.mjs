import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ChevronDown, n as Sun, r as Moon } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-HwfIcqFe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KANALS_PER_ACRE = 8;
var DATA_KEY = "farmContractLedger.v1";
var SETTINGS_KEY = "farmContractLedger.settings";
var FONTS = [
	{
		id: "ledger",
		label: "Ledger"
	},
	{
		id: "literata",
		label: "Literata",
		stack: "\"Literata\", Georgia, serif"
	},
	{
		id: "source",
		label: "Source Sans",
		stack: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
	},
	{
		id: "georgia",
		label: "Georgia",
		stack: "Georgia, \"Times New Roman\", serif"
	},
	{
		id: "courier",
		label: "Courier New",
		stack: "\"Courier New\", ui-monospace, monospace"
	},
	{
		id: "trebuchet",
		label: "Trebuchet MS",
		stack: "\"Trebuchet MS\", \"Segoe UI\", sans-serif"
	}
];
var EMPTY_FORM = {
	startYear: "",
	contractor: "",
	totalKanals: "",
	excludedKanals: "",
	ratePerAcre: "",
	experience: "",
	notes: ""
};
var NO_ERRORS = {
	year: "",
	total: "",
	excluded: "",
	rate: ""
};
var CSV_HEADERS = [
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
	"Notes"
];
var fieldClass = "w-full min-h-11 rounded-lg border border-line bg-card px-3 text-base text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field";
function isFontId(value) {
	return FONTS.some((font) => font.id === value);
}
function isExperience(value) {
	return value === "" || value === "Good" || value === "Average" || value === "Poor";
}
function currentSeasonStart(date = /* @__PURE__ */ new Date()) {
	return date.getMonth() >= 4 ? date.getFullYear() : date.getFullYear() - 1;
}
function seasonLabel(year) {
	return `${year}\u2013${String((year + 1) % 100).padStart(2, "0")}`;
}
function seasonSpan(year) {
	return `May ${year} \u2013 May ${year + 1}`;
}
function inr(amount) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}
function inr0(amount) {
	return "₹" + Math.round(amount).toLocaleString("en-IN");
}
function num(amount) {
	return amount.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}
function readJSON(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "") ?? fallback;
	} catch {
		return fallback;
	}
}
function writeJSON(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}
function asSeason(value) {
	if (!value || typeof value !== "object") return null;
	const row = value;
	if (!Number.isInteger(row.startYear)) return null;
	if (typeof row.totalKanals !== "number" || typeof row.ratePerAcre !== "number") return null;
	const excluded = typeof row.excludedKanals === "number" ? row.excludedKanals : 0;
	const experience = typeof row.experience === "string" && isExperience(row.experience) ? row.experience : "";
	return {
		startYear: row.startYear,
		totalKanals: row.totalKanals,
		excludedKanals: excluded,
		ratePerAcre: row.ratePerAcre,
		contractor: typeof row.contractor === "string" ? row.contractor : "",
		experience,
		notes: typeof row.notes === "string" ? row.notes : ""
	};
}
function loadEntries() {
	const raw = readJSON(DATA_KEY, []);
	if (!Array.isArray(raw)) return [];
	return raw.map(asSeason).filter((row) => row !== null);
}
function calc(entry) {
	const billed = entry.totalKanals - entry.excludedKanals;
	const perKanal = entry.ratePerAcre / KANALS_PER_ACRE;
	const annual = perKanal * billed;
	return {
		billed,
		acres: billed / KANALS_PER_ACRE,
		perKanal,
		annual,
		half: annual / 2,
		monthly: annual / 12
	};
}
function enriched(entries) {
	const asc = [...entries].sort((a, b) => a.startYear - b.startYear);
	return asc.map((entry, index) => {
		const figures = calc(entry);
		const prev = index > 0 ? asc[index - 1] : null;
		let cmp = null;
		if (prev) {
			const previous = calc(prev);
			cmp = {
				prevYear: prev.startYear,
				gap: entry.startYear - prev.startYear,
				rateDiff: entry.ratePerAcre - prev.ratePerAcre,
				ratePct: (entry.ratePerAcre - prev.ratePerAcre) / prev.ratePerAcre * 100,
				incomeDiff: figures.annual - previous.annual,
				incomePct: (figures.annual - previous.annual) / previous.annual * 100,
				billedChanged: Math.abs(figures.billed - previous.billed) > 1e-9
			};
		}
		return {
			...entry,
			...figures,
			cmp
		};
	});
}
function signedInr(amount) {
	return `${amount >= 0 ? "+" : "−"}${inr0(Math.abs(amount))}`;
}
function Pct({ value, base }) {
	if (value === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "private inline-block rounded-full bg-bg px-2 py-0.5 text-xs font-semibold text-muted tabular-nums",
		children: base || "Base"
	});
	const tone = value > 1e-4 ? "bg-field-soft text-field" : value < -1e-4 ? "bg-danger-soft text-danger" : "bg-bg text-muted";
	const sign = value > 0 ? "+" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `private inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`,
		children: [
			sign,
			value.toFixed(2),
			"%"
		]
	});
}
function blankForm(entries) {
	const last = [...entries].sort((a, b) => a.startYear - b.startYear).at(-1);
	return {
		form: {
			...EMPTY_FORM,
			startYear: String(last ? last.startYear + 1 : currentSeasonStart()),
			totalKanals: last ? String(last.totalKanals) : "",
			excludedKanals: last ? String(last.excludedKanals) : ""
		},
		rateHint: last ? `Previous: ${inr0(last.ratePerAcre)} in ${seasonLabel(last.startYear)}` : ""
	};
}
function csvCell(value) {
	const text = String(value ?? "");
	return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
function parseCSV(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let quoted = false;
	const source = text.replace(/^\ufeff/, "");
	for (let i = 0; i < source.length; i += 1) {
		const ch = source[i];
		if (quoted) {
			if (ch === "\"") {
				if (source[i + 1] === "\"") {
					cell += "\"";
					i += 1;
				} else quoted = false;
			} else cell += ch;
		} else if (ch === "\"") quoted = true;
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
function FarmContractCalculator() {
	const formRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [dark, setDark] = (0, import_react.useState)(false);
	const [font, setFont] = (0, import_react.useState)("ledger");
	const [discreet, setDiscreet] = (0, import_react.useState)(false);
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [editingYear, setEditingYear] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [errors, setErrors] = (0, import_react.useState)(NO_ERRORS);
	const [rateHint, setRateHint] = (0, import_react.useState)("");
	const [targetPct, setTargetPct] = (0, import_react.useState)("");
	const [offeredRate, setOfferedRate] = (0, import_react.useState)("");
	const [backupMsg, setBackupMsg] = (0, import_react.useState)("");
	const [openYears, setOpenYears] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const savedEntries = loadEntries();
		const saved = readJSON(SETTINGS_KEY, {});
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
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		writeJSON(DATA_KEY, entries);
	}, [ready, entries]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		writeJSON(SETTINGS_KEY, {
			dark,
			font,
			discreet
		});
	}, [
		ready,
		dark,
		font,
		discreet
	]);
	const list = enriched(entries);
	const newest = [...list].reverse();
	const latest = list.at(-1);
	const fontChoice = FONTS.find((item) => item.id === font);
	const fontStyle = fontChoice && "stack" in fontChoice ? {
		"--font-sans": fontChoice.stack,
		"--font-serif": fontChoice.stack
	} : void 0;
	const yearValue = parseInt(form.startYear, 10);
	const totalValue = parseFloat(form.totalKanals);
	const excludedValue = parseFloat(form.excludedKanals);
	const excludedSafe = Number.isNaN(excludedValue) ? 0 : excludedValue;
	const rateValue = parseFloat(form.ratePerAcre);
	const billedPreview = !Number.isNaN(totalValue) && totalValue > 0 && excludedSafe >= 0 && excludedSafe < totalValue ? totalValue - excludedSafe : null;
	const names = [...new Set(entries.map((entry) => entry.contractor.trim()).filter(Boolean))];
	function patch(partial) {
		setForm((current) => ({
			...current,
			...partial
		}));
	}
	function clearForm(nextEntries = entries) {
		const next = blankForm(nextEntries);
		setEditingYear(null);
		setForm(next.form);
		setRateHint(next.rateHint);
		setErrors(NO_ERRORS);
	}
	function startEdit(year) {
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
			notes: entry.notes
		});
		setRateHint("");
		setErrors(NO_ERRORS);
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		formRef.current?.scrollIntoView({
			behavior: reduce ? "auto" : "smooth",
			block: "start"
		});
	}
	function saveEntry(event) {
		event.preventDefault();
		const nextErrors = { ...NO_ERRORS };
		let bad = false;
		if (Number.isNaN(yearValue) || yearValue < 2e3 || yearValue > 2100) {
			nextErrors.year = "Enter a year between 2000 and 2100";
			bad = true;
		}
		if (Number.isNaN(totalValue) || totalValue <= 0) {
			nextErrors.total = "Enter the total kanals";
			bad = true;
		}
		if (excludedSafe < 0 || !Number.isNaN(totalValue) && excludedSafe >= totalValue) {
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
			if (!window.confirm(`Season ${seasonLabel(yearValue)} is already recorded (${inr0(clash.ratePerAcre)} / acre${who}).\n\nReplace it with this entry?`)) return;
		}
		const record = {
			startYear: yearValue,
			totalKanals: totalValue,
			excludedKanals: excludedSafe,
			ratePerAcre: rateValue,
			contractor: form.contractor.trim(),
			experience: form.experience,
			notes: form.notes.trim()
		};
		const next = entries.filter((item) => item.startYear !== yearValue && item.startYear !== editingYear);
		next.push(record);
		setEntries(next);
		clearForm(next);
	}
	function deleteEntry(year) {
		const entry = entries.find((item) => item.startYear === year);
		if (!entry) return;
		if (!window.confirm(`Delete season ${seasonLabel(year)} (${inr0(entry.ratePerAcre)} / acre)? This cannot be undone.`)) return;
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
				entry.notes
			]);
		});
		const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const link = document.createElement("a");
		const today = /* @__PURE__ */ new Date();
		link.href = URL.createObjectURL(blob);
		link.download = `farm-contract-ledger-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
		setBackupMsg(`Exported ${list.length} season${list.length > 1 ? "s" : ""}.`);
	}
	function importCSV(file) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const rows = parseCSV(String(reader.result ?? ""));
				const head = (rows.shift() ?? []).map((cell) => cell.trim().toLowerCase());
				const col = (name) => head.indexOf(name.toLowerCase());
				const yearCol = col("Start Year");
				const totalCol = col("Total Kanals");
				const excludedCol = col("Excluded Kanals");
				const rateCol = col("Rate per Acre");
				if ([
					yearCol,
					totalCol,
					rateCol
				].some((index) => index < 0)) throw new Error("Missing columns");
				const contractorCol = col("Contractor");
				const experienceCol = col("Experience");
				const notesCol = col("Notes");
				const incoming = rows.map((row) => {
					const experienceRaw = experienceCol >= 0 ? (row[experienceCol] || "").trim() : "";
					return {
						startYear: parseInt(row[yearCol] ?? "", 10),
						totalKanals: parseFloat(row[totalCol] ?? ""),
						excludedKanals: excludedCol >= 0 ? parseFloat(row[excludedCol] ?? "") || 0 : 0,
						ratePerAcre: parseFloat(row[rateCol] ?? ""),
						contractor: contractorCol >= 0 ? (row[contractorCol] || "").trim() : "",
						experience: isExperience(experienceRaw) ? experienceRaw : "",
						notes: notesCol >= 0 ? (row[notesCol] || "").trim() : ""
					};
				}).filter((entry) => !Number.isNaN(entry.startYear) && entry.totalKanals > 0 && entry.ratePerAcre > 0 && entry.excludedKanals < entry.totalKanals);
				if (!incoming.length) throw new Error("No valid rows");
				const clashes = incoming.filter((entry) => entries.some((item) => item.startYear === entry.startYear)).length;
				const message = `Import ${incoming.length} season${incoming.length > 1 ? "s" : ""}?` + (clashes ? `\n\n${clashes} already recorded season${clashes > 1 ? "s" : ""} will be replaced.` : "");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-theme": dark ? "dark" : "light",
		style: fontStyle,
		className: `min-h-screen bg-bg text-ink transition-colors duration-200 ${discreet ? "discreet" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
									className: "size-4 text-muted",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Light" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "switch",
									"aria-checked": dark,
									"aria-label": "Toggle dark theme",
									onClick: () => setDark((value) => !value),
									className: "relative h-6 w-12 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field " + (dark ? "bg-field" : "bg-line"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 left-1 size-4 rounded-full bg-card transition-transform duration-200 " + (dark ? "translate-x-6" : "") })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
									className: "size-4 text-muted",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dark" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discreet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								role: "switch",
								"aria-checked": discreet,
								"aria-label": "Hide percentage figures",
								onClick: () => setDiscreet((value) => !value),
								className: "relative h-6 w-12 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field " + (discreet ? "bg-field" : "bg-line"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 left-1 size-4 rounded-full bg-card transition-transform duration-200 " + (discreet ? "translate-x-6" : "") })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 text-sm sm:justify-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "Font"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: font,
								onChange: (event) => {
									if (isFontId(event.target.value)) setFont(event.target.value);
								},
								className: "min-h-11 rounded-lg border border-line bg-card px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field",
								children: FONTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: item.label
								}, item.id))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-2xl border border-line bg-card shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 bg-field" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-6 sm:px-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/favicon.svg",
									alt: "",
									width: "56",
									height: "56",
									className: "size-14 shrink-0 rounded-2xl shadow-sm ring-1 ring-line"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "text-left font-serif text-2xl font-semibold leading-tight text-balance text-field",
									children: ["Farm Contract", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block font-sans text-sm font-medium tracking-wide text-muted",
										children: "Ledger"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-center text-sm text-pretty text-muted",
								children: "Season-wise contract record · season runs May to May · 8 kanals = 1 acre"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Seasons recorded",
										value: String(list.length)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Latest rate / acre",
										value: latest ? inr0(latest.ratePerAcre) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Rate CAGR (avg yearly growth)",
										value: list.length ? cagr : "—",
										privateFigure: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Total contract value",
										value: list.length ? inr0(list.reduce((sum, entry) => sum + entry.annual, 0)) : "—"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "discreet-note mt-3 text-sm text-muted",
								children: "Discreet mode is on — all % figures and the planner are hidden."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl font-semibold text-field",
							children: editingYear === null ? "Add season" : `Edit season ${seasonLabel(editingYear)}`
						}), editingYear !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field",
							children: "Editing"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						ref: formRef,
						className: "flex flex-col gap-4",
						onSubmit: saveEntry,
						noValidate: true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
										label: "Season start year",
										error: errors.year,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "startYear",
											type: "number",
											inputMode: "numeric",
											min: 2e3,
											max: 2100,
											step: 1,
											placeholder: "e.g. 2026",
											value: form.startYear,
											"aria-invalid": errors.year ? true : void 0,
											onChange: (event) => patch({ startYear: event.target.value }),
											className: fieldClass
										}), !Number.isNaN(yearValue) && yearValue >= 2e3 && yearValue <= 2100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1.5 text-sm text-muted",
											children: [
												"Season ",
												seasonLabel(yearValue),
												" · ",
												seasonSpan(yearValue)
											]
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
										label: "Contractor name",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "contractor",
											type: "text",
											list: "contractorList",
											autoComplete: "off",
											placeholder: "Name",
											value: form.contractor,
											onChange: (event) => patch({ contractor: event.target.value }),
											className: fieldClass
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
											id: "contractorList",
											children: names.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: name }, name))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Total land (kanals)",
										error: errors.total,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "totalKanals",
											type: "number",
											inputMode: "decimal",
											min: 0,
											step: "any",
											placeholder: "e.g. 24",
											value: form.totalKanals,
											"aria-invalid": errors.total ? true : void 0,
											onChange: (event) => patch({ totalKanals: event.target.value }),
											className: fieldClass
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Excluded from billing (kanals)",
										error: errors.excluded,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "excludedKanals",
											type: "number",
											inputMode: "decimal",
											min: 0,
											step: "any",
											placeholder: "0",
											value: form.excludedKanals,
											"aria-invalid": errors.excluded ? true : void 0,
											onChange: (event) => patch({ excludedKanals: event.target.value }),
											className: fieldClass
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
											label: "Contract rate per acre (₹ / season)",
											error: errors.rate,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "ratePerAcre",
												type: "number",
												inputMode: "decimal",
												min: 0,
												step: "any",
												placeholder: "e.g. 70000",
												value: form.ratePerAcre,
												"aria-invalid": errors.rate ? true : void 0,
												onChange: (event) => patch({ ratePerAcre: event.target.value }),
												className: fieldClass
											}), rateHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1.5 text-sm text-muted",
												children: rateHint
											}) : null]
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-lg border-l-4 border-field bg-field-soft px-3 py-2 text-sm",
								children: [
									"Billed area:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-semibold text-field tabular-nums",
										children: billedPreview === null ? "—" : `${num(billedPreview)} kanals (${num(billedPreview / KANALS_PER_ACRE)} acres)${!Number.isNaN(rateValue) && rateValue > 0 ? ` \u2192 ${inr0(rateValue / KANALS_PER_ACRE * billedPreview)} / season` : ""}`
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Experience with contractor",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "experience",
										value: form.experience,
										onChange: (event) => {
											const value = event.target.value;
											if (isExperience(value)) patch({ experience: value });
										},
										className: fieldClass,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "— Not rated —"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Good",
												children: "Good"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Average",
												children: "Average"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Poor",
												children: "Poor"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "notes",
										rows: 3,
										placeholder: "Payment timeliness, field care, anything worth remembering for rotation",
										value: form.notes,
										onChange: (event) => patch({ notes: event.target.value }),
										className: `${fieldClass} min-h-20 py-2`
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-field px-4 text-base font-semibold text-on-field hover:bg-field-deep",
									children: editingYear === null ? "Save season" : "Update season"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => clearForm(),
									className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft",
									children: editingYear === null ? "Clear" : "Cancel"
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "private rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-xl font-semibold text-field",
								children: "Negotiation planner"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field",
								children: "Private"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted",
							children: latest ? `Based on ${seasonLabel(latest.startYear)}: ${inr0(latest.ratePerAcre)} / acre on ${num(latest.billed)} billed kanals.` : "Save at least one season to use the planner."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Target increase (%)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "targetPct",
									type: "number",
									inputMode: "decimal",
									step: "any",
									placeholder: "e.g. 6.5",
									value: targetPct,
									onChange: (event) => setTargetPct(event.target.value),
									className: fieldClass
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Offered rate / acre (₹)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "offeredRate",
									type: "number",
									inputMode: "decimal",
									min: 0,
									step: "any",
									placeholder: "e.g. 83000",
									value: offeredRate,
									onChange: (event) => setOfferedRate(event.target.value),
									className: fieldClass
								})
							})]
						}),
						plannerRows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: plannerRows
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-xl font-semibold text-field",
								children: "Season ledger"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-field-soft px-2 py-0.5 text-xs font-semibold text-field",
								children: "Newest first"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							id: "ledger",
							className: "flex flex-col gap-3",
							children: newest.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-4 text-center text-sm text-muted",
								children: "No seasons yet. Add your first season above — each one will appear here as a collapsible card."
							}) : newest.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonCard, {
								entry,
								open: openYears.includes(entry.startYear),
								onToggle: (open) => {
									setOpenYears((current) => {
										const has = current.includes(entry.startYear);
										if (open && !has) return [...current, entry.startYear];
										if (!open && has) return current.filter((year) => year !== entry.startYear);
										return current;
									});
								},
								onEdit: startEdit,
								onDelete: deleteEntry
							}, entry.startYear))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-pretty text-muted",
							children: "Figures are gross — before expenses, commission or tax. Monthly income is the season amount spread over 12 months; actual payments usually follow the crop cycle."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-serif text-xl font-semibold text-field",
						children: "Contractor history"
					}), contractors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-2 text-sm text-muted",
						children: "Contractor names you record will be summarised here for rotation decisions."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: contractors.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-line py-3 last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold break-words",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: row.lastExp ? `Last rated: ${row.lastExp}` : "Not rated"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								row.seasons.length,
								" season",
								row.seasons.length > 1 ? "s" : "",
								":",
								" ",
								[...row.seasons].sort((a, b) => b - a).map(seasonLabel).join(", "),
								" · Total ",
								inr0(row.total)
							]
						})]
					}, row.name.toLowerCase())) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-line bg-card px-5 py-6 shadow-sm sm:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 font-serif text-xl font-semibold text-field",
							children: "Backup"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted",
							children: "Your data lives only in this browser. Export a CSV regularly — it opens in Excel, Numbers and Google Sheets, and can be imported back here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: exportCSV,
									className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft",
									children: "Export CSV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => fileRef.current?.click(),
									className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-base font-semibold text-ink hover:bg-field-soft",
									children: "Import CSV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: ".csv,text/csv",
									className: "sr-only",
									onChange: (event) => {
										const file = event.target.files?.[0];
										if (file) importCSV(file);
										event.target.value = "";
									}
								})
							]
						}),
						backupMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: backupMsg
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "text-center text-sm text-muted",
					children: "8 kanals = 1 acre · remembered on this device"
				})
			]
		})
	});
}
function Field({ label, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-sm font-semibold",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1.5 block",
				children: label
			}),
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "alert",
				className: "mt-1.5 block text-sm font-normal text-danger",
				children: error
			}) : null
		]
	});
}
function Stat({ label, value, privateFigure = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `min-w-0 rounded-lg border border-line bg-bg px-3 py-3 ${privateFigure ? "private" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-base font-semibold break-words text-field tabular-nums",
			children: value
		})]
	});
}
function Row({ label, value, highlight = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 py-2.5 " + (highlight ? "my-1 rounded-lg border-l-4 border-field bg-field-soft" : "border-b border-line last:border-b-0"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-sm font-semibold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right text-sm font-semibold text-field tabular-nums " + (highlight ? "text-base" : ""),
			children: value
		})]
	});
}
function SeasonCard({ entry, open, onToggle, onEdit, onDelete }) {
	const comparison = entry.cmp;
	const versus = comparison ? comparison.gap === 1 ? "vs previous season" : `vs ${seasonLabel(comparison.prevYear)} (${comparison.gap}-yr gap)` : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "season overflow-hidden rounded-xl border border-line border-l-4 border-l-field bg-bg",
		open,
		onToggle: (event) => onToggle(event.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold",
					children: [
						seasonLabel(entry.startYear),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							className: "font-normal text-muted",
							children: seasonSpan(entry.startYear)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-field tabular-nums",
							children: inr0(entry.ratePerAcre)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: "chev ml-1 inline size-4 text-muted transition-transform duration-200",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						comparison ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { value: comparison.ratePct }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, {
							value: null,
							base: "Base season"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted break-words",
					children: [entry.contractor || "Contractor not recorded", entry.experience ? ` · ${entry.experience}` : ""]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-3 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 px-2 text-xs font-semibold tracking-wide text-muted uppercase",
					children: "Land"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Total land",
						value: `${num(entry.totalKanals)} kanals`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Excluded from billing",
						value: `${num(entry.excludedKanals)} kanals`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Billed area",
						value: `${num(entry.billed)} kanals (${num(entry.acres)} acres)`
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase",
					children: "Results"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Rate per acre",
						value: inr(entry.ratePerAcre)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Per kanal rate",
						value: inr(entry.perKanal)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Total season income",
						value: inr(entry.annual),
						highlight: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Half-yearly income",
						value: inr(entry.half)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Monthly income",
						value: inr(entry.monthly)
					})
				] }),
				comparison ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "private",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase",
						children: ["Change ", versus]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Rate change",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							signedInr(comparison.rateDiff),
							" / acre ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { value: comparison.ratePct })
						] })
					}), comparison.billedChanged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Income change (area also changed)",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							signedInr(comparison.incomeDiff),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { value: comparison.incomePct })
						] })
					}) : null] })]
				}) : null,
				entry.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 px-2 text-xs font-semibold tracking-wide text-muted uppercase",
					children: "Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-2 text-sm whitespace-pre-wrap break-words",
					children: entry.notes
				})] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onEdit(entry.startYear),
						className: "inline-flex min-h-11 items-center rounded-lg border border-line bg-card px-3 text-sm font-semibold hover:bg-field-soft",
						children: "Edit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onDelete(entry.startYear),
						className: "inline-flex min-h-11 items-center rounded-lg border border-danger px-3 text-sm font-semibold text-danger hover:bg-danger-soft",
						children: "Delete"
					})]
				})
			]
		})]
	});
}
function contractorRows(list) {
	const map = /* @__PURE__ */ new Map();
	list.forEach((entry) => {
		const name = entry.contractor.trim();
		if (!name) return;
		const key = name.toLowerCase();
		if (!map.has(key)) map.set(key, {
			name,
			seasons: [],
			total: 0,
			lastExp: "",
			lastYear: 0
		});
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
function plannerLines(latest, targetPct, offeredRate) {
	if (!latest) return [];
	const rows = [];
	const percent = parseFloat(targetPct);
	if (!Number.isNaN(percent)) {
		const rate = latest.ratePerAcre * (1 + percent / 100);
		const rounded = Math.round(rate / 500) * 500;
		const income = rounded / KANALS_PER_ACRE * latest.billed;
		rows.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: `Rate at ${percent}%`,
			value: inr0(rate)
		}, "raw"));
		rows.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: "Rounded to ₹500",
			highlight: true,
			value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				inr0(rounded),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { value: (rounded - latest.ratePerAcre) / latest.ratePerAcre * 100 })
			] })
		}, "rounded"));
		rows.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: "Season income at rounded rate",
			value: inr0(income)
		}, "income"));
	}
	const offer = parseFloat(offeredRate);
	if (!Number.isNaN(offer) && offer > 0) {
		const change = (offer - latest.ratePerAcre) / latest.ratePerAcre * 100;
		rows.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: `Offer of ${inr0(offer)} is`,
			value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				signedInr(offer - latest.ratePerAcre),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pct, { value: change })
			] })
		}, "offer"));
		rows.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: "Season income at offer",
			value: inr0(offer / KANALS_PER_ACRE * latest.billed)
		}, "offer-income"));
	}
	return rows;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmContractCalculator, {});
}
//#endregion
export { Home as component };
