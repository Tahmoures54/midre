import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, c as Pill, d as Download, f as ChartColumn, i as Trash2, l as Pencil, m as BellOff, n as Upload, o as Plus, p as Bell, s as Play, t as X, u as Pause } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DBIFq3cj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:bg-primary/90",
			secondary: "bg-surface-2 text-fg ring-1 ring-border hover:bg-surface",
			ghost: "text-fg hover:bg-surface-2",
			danger: "bg-due text-due-fg hover:bg-due/90",
			outline: "bg-transparent text-fg ring-1 ring-border hover:bg-surface-2"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		type: asChild ? void 0 : type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function DoseAlert({ medication, onTake, onSnooze, onLater }) {
	const titleId = (0, import_react.useId)();
	const descId = (0, import_react.useId)();
	(0, import_react.useEffect)(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onLater();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [onLater]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alertdialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			"aria-describedby": descId,
			className: "w-full max-w-md origin-center rounded-2xl bg-surface p-6 shadow-[0_0_0_1px_rgba(196,92,74,0.35)] animate-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-14 items-center justify-center rounded-full bg-due/15 text-due",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							className: "size-7",
							strokeWidth: 1.6
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					id: titleId,
					className: "text-center text-2xl font-semibold tracking-tight text-fg",
					children: ["زمان مصرف ", medication.name]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					id: descId,
					className: "mt-2 text-center text-sm leading-relaxed text-muted text-pretty",
					children: [
						"دوز ",
						medication.dosage,
						" فرا رسیده است. هشدار تا تأیید مصرف یا اسنوز ادامه می‌یابد. «بعداً» فقط این پنجره را می‌بندد."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							autoFocus: true,
							onClick: onTake,
							className: "h-12",
							children: "مصرف کردم"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "h-11",
								onClick: () => onSnooze(10),
								children: "۱۰ دقیقه"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "h-11",
								onClick: () => onSnooze(30),
								children: "۳۰ دقیقه"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "h-11 text-muted",
							onClick: onLater,
							children: "بعداً"
						})
					]
				})
			]
		})
	});
}
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide", "bg-surface-2 text-muted ring-1 ring-border", className),
		...props
	});
}
function Progress({ value, className, barClassName }) {
	const clamped = Math.min(100, Math.max(0, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border", className),
		role: "progressbar",
		"aria-valuenow": Math.round(clamped),
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full bg-primary transition-[width] duration-700 ease-out", barClassName),
			style: { width: `${clamped}%` }
		})
	});
}
var APP_VERSION = "3.2.2";
function trimHistory(history) {
	const list = Array.isArray(history) ? history : [];
	if (list.length <= 120) return list;
	return [...list].sort((a, b) => a.takenAt - b.takenAt).slice(-120);
}
function remainingSeconds(m, now = Date.now()) {
	if (m.pendingDose) return 0;
	if (!m.running || !m.nextDoseAt) return 0;
	return Math.max(0, Math.ceil((m.nextDoseAt - now) / 1e3));
}
function formatCountdown(seconds) {
	const s = Math.max(0, Math.floor(seconds));
	const days = Math.floor(s / 86400);
	const clock = [
		Math.floor(s % 86400 / 3600),
		Math.floor(s % 3600 / 60),
		s % 60
	].map((n) => String(n).padStart(2, "0")).join(":");
	if (days > 0) return `${days} روز ${clock}`;
	return clock;
}
function formatFaTime(ts) {
	if (!ts) return "—";
	return new Date(ts).toLocaleTimeString("fa-IR", {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatFaDateTime(ts) {
	const date = new Date(ts);
	const now = /* @__PURE__ */ new Date();
	const time = date.toLocaleTimeString("fa-IR", {
		hour: "2-digit",
		minute: "2-digit"
	});
	return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() ? `امروز ${time}` : `${date.toLocaleDateString("fa-IR")} ${time}`;
}
function intervalFromHours(hours) {
	return Math.max(1, Math.round(hours * 3600));
}
/** Classify adherence. remaining is never used — only absolute timestamps. */
function statusFor(takenAt, scheduledAt) {
	if (!scheduledAt) return "on-time";
	const delta = takenAt - scheduledAt;
	if (delta < -18e5) return "early";
	if (delta > 144e5) return "missed";
	if (delta > 36e5) return "late";
	return "on-time";
}
function toDue(m, now = Date.now()) {
	return {
		...m,
		running: false,
		pendingDose: true,
		dueScheduledAt: m.nextDoseAt ?? now,
		updatedAt: now
	};
}
function applyTake(m, now = Date.now()) {
	const scheduledAt = m.dueScheduledAt ?? m.nextDoseAt;
	const record = {
		id: crypto.randomUUID(),
		takenAt: now,
		scheduledAt,
		status: statusFor(now, scheduledAt),
		snoozeCount: m.snoozeCount || 0
	};
	return {
		...m,
		quantity: Math.max(0, m.quantity - 1),
		history: trimHistory([...m.history || [], record]),
		lastTakenAt: now,
		pendingDose: false,
		dueScheduledAt: void 0,
		snoozeCount: 0,
		running: true,
		nextDoseAt: now + m.interval * 1e3,
		updatedAt: now
	};
}
function applySnooze(m, minutes = 10, now = Date.now()) {
	const secs = Math.max(1, Math.round(minutes * 60));
	return {
		...m,
		pendingDose: false,
		dueScheduledAt: void 0,
		running: true,
		snoozeCount: (m.snoozeCount || 0) + 1,
		nextDoseAt: now + secs * 1e3,
		updatedAt: now
	};
}
function applySkip(m, now = Date.now()) {
	const record = {
		id: crypto.randomUUID(),
		takenAt: now,
		scheduledAt: m.dueScheduledAt ?? m.nextDoseAt,
		status: "skipped",
		snoozeCount: m.snoozeCount || 0
	};
	return {
		...m,
		history: trimHistory([...m.history || [], record]),
		pendingDose: false,
		dueScheduledAt: void 0,
		snoozeCount: 0,
		running: true,
		nextDoseAt: now + m.interval * 1e3,
		updatedAt: now
	};
}
function applyToggle(m, now = Date.now()) {
	if (!!m.running) return {
		...m,
		running: false,
		pendingDose: false,
		dueScheduledAt: void 0,
		nextDoseAt: void 0,
		updatedAt: now
	};
	return {
		...m,
		running: true,
		pendingDose: false,
		dueScheduledAt: void 0,
		nextDoseAt: now + m.interval * 1e3,
		updatedAt: now
	};
}
function applyReset(m, now = Date.now()) {
	const history = [...m.history || []];
	if (m.pendingDose) history.push({
		id: crypto.randomUUID(),
		takenAt: now,
		scheduledAt: m.dueScheduledAt ?? m.nextDoseAt,
		status: "skipped",
		snoozeCount: m.snoozeCount || 0
	});
	return {
		...m,
		history: trimHistory(history),
		running: false,
		pendingDose: false,
		dueScheduledAt: void 0,
		nextDoseAt: void 0,
		snoozeCount: 0,
		updatedAt: now
	};
}
function sanitizeMedication(raw) {
	const interval = Number(raw.interval) || intervalFromHours(Number(raw.intervalHours) || 8);
	const now = Date.now();
	return {
		id: raw.id,
		name: String(raw.name || "").trim() || "دارو",
		condition: String(raw.condition || "").trim(),
		dosage: String(raw.dosage || "").trim() || "—",
		interval,
		intervalHours: Number(raw.intervalHours) || Math.max(1, Math.round(interval / 3600)),
		quantity: Math.max(0, Number(raw.quantity) || 0),
		running: Boolean(raw.running),
		nextDoseAt: raw.nextDoseAt,
		dueScheduledAt: raw.dueScheduledAt,
		lastTakenAt: raw.lastTakenAt,
		pendingDose: Boolean(raw.pendingDose),
		snoozeCount: Number(raw.snoozeCount) || 0,
		createdAt: raw.createdAt || now,
		updatedAt: raw.updatedAt || now,
		history: trimHistory(raw.history)
	};
}
function adherenceScore(history) {
	if (!history.length) return 0;
	const onTime = history.filter((h) => h.status === "on-time").length;
	return Math.round(onTime / history.length * 100);
}
function MedicationCard({ medication: m, now, index, onToggle, onReset, onDelete, onEdit, onReport, onTake, onSnooze, onSkip }) {
	const due = m.pendingDose;
	const running = m.running && !due;
	const remaining = remainingSeconds(m, now);
	const progress = due ? 100 : Math.min(100, Math.max(0, remaining / Math.max(1, m.interval) * 100));
	const empty = m.quantity <= 0;
	const low = !empty && m.quantity <= 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("relative overflow-hidden rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(238,243,240,0.08)]", "transition-[box-shadow,transform] duration-200 ease-out", due && "shadow-[0_0_0_1px_rgba(196,92,74,0.45)]", running && "shadow-[0_0_0_1px_rgba(126,201,168,0.28)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["#", index] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: cn(due && "bg-due/15 text-due-fg ring-due/30", running && "bg-primary/12 text-primary ring-primary/25"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", due ? "bg-due" : running ? "bg-primary" : "bg-subtle") }), due ? "منتظر تأیید" : running ? "در حال شمارش" : "متوقف"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold tracking-tight text-fg text-balance",
							children: m.name
						}),
						m.condition ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate text-sm text-muted",
							children: m.condition
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-10",
						onClick: onEdit,
						"aria-label": "ویرایش",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-10",
						onClick: onReport,
						"aria-label": "گزارش",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border",
						children: m.dosage
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border",
						children: ["هر ", formatInterval(m.interval)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border", empty && "text-due ring-due/30", low && !empty && "text-terracotta ring-terracotta/30"),
						children: [
							m.quantity,
							" عدد",
							empty ? " · تمام" : low ? " · کم" : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-4 rounded-xl bg-bg px-4 py-5 text-center", due && "bg-due/10"),
				children: due ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl font-semibold tracking-tight text-due",
					children: "زمان مصرف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "پس از مصرف، تأیید کنید. بستن هشدار به معنی مصرف نیست."
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("font-display text-5xl font-medium tabular-nums tracking-tight", running ? "text-primary" : "text-subtle"),
					role: "timer",
					"aria-label": `${formatCountdown(remaining)} باقی‌مانده`,
					children: formatCountdown(remaining)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: running ? `دوز بعدی حدود ${formatFaTime(m.nextDoseAt)}` : "تایمر متوقف است"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: progress,
				className: "mt-4",
				barClassName: due ? "bg-due" : running ? "bg-primary" : "bg-subtle"
			}),
			due ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onTake,
						className: "h-12",
						children: "مصرف کردم"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: onSnooze,
						className: "h-12",
						children: "۱۰ دقیقه"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: onSkip,
						className: "col-span-2 h-11 text-muted",
						children: "این دوز را رد کن"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-[1fr_auto_auto] gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: running ? "secondary" : "default",
						onClick: onToggle,
						className: "h-12",
						children: [running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), running ? "توقف" : "شروع"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						className: "size-12",
						onClick: onReset,
						"aria-label": "ریست",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-12 text-due",
						onClick: onDelete,
						"aria-label": "حذف",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
					})
				]
			})
		]
	});
}
function formatInterval(seconds) {
	if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} دقیقه`;
	const h = seconds / 3600;
	if (Number.isInteger(h)) return `${h} ساعت`;
	return `${h.toFixed(1)} ساعت`;
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-lg bg-surface-2 px-3 text-sm text-fg ring-1 ring-border", "placeholder:text-subtle", "transition-[box-shadow] duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", "disabled:opacity-40", className),
		...props
	});
}
var PRESETS = [
	4,
	6,
	8,
	12,
	24,
	48,
	72
];
function MedicationForm({ initial, onSubmit, onCancel }) {
	const isEdit = Boolean(initial?.id);
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [condition, setCondition] = (0, import_react.useState)(initial?.condition ?? "");
	const [dosage, setDosage] = (0, import_react.useState)(initial?.dosage ?? "");
	const [quantity, setQuantity] = (0, import_react.useState)(initial ? String(initial.quantity) : "");
	const [hours, setHours] = (0, import_react.useState)(initial ? PRESETS.includes(initial.intervalHours) ? initial.intervalHours : null : 8);
	const [custom, setCustom] = (0, import_react.useState)(initial && !PRESETS.includes(initial.intervalHours) ? String(initial.intervalHours) : "");
	const [startImmediately, setStartImmediately] = (0, import_react.useState)(!isEdit);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setName(initial?.name ?? "");
		setCondition(initial?.condition ?? "");
		setDosage(initial?.dosage ?? "");
		setQuantity(initial ? String(initial.quantity) : "");
		const h = initial?.intervalHours ?? 8;
		const preset = PRESETS.includes(h);
		setHours(initial ? preset ? h : null : 8);
		setCustom(initial && !preset ? String(h) : "");
		setStartImmediately(!initial);
		setError("");
	}, [initial?.id]);
	const submit = (e) => {
		e.preventDefault();
		if (!name.trim() || !dosage.trim()) return setError("نام دارو و دوز را وارد کنید.");
		const qty = Number(quantity);
		if (!Number.isFinite(qty) || qty < 0 || !isEdit && qty <= 0) return setError(isEdit ? "تعداد نمی‌تواند منفی باشد." : "تعداد باید بیشتر از صفر باشد.");
		const intervalHours = hours ?? Number(custom);
		if (!Number.isFinite(intervalHours) || intervalHours <= 0) return setError("بازه یادآوری معتبر نیست.");
		onSubmit({
			name: name.trim(),
			condition: condition.trim(),
			dosage: dosage.trim(),
			quantity: qty,
			intervalHours,
			startImmediately
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: isEdit ? "ویرایش دارو" : "افزودن دارو"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "size-10",
				onClick: onCancel,
				"aria-label": "بستن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-4",
			noValidate: true,
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "rounded-lg bg-due/10 px-3 py-2 text-sm text-due",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نام دارو",
					htmlFor: "med-name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "med-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "مثلاً آموکسی‌سیلین",
						autoFocus: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "بیماری مرتبط (اختیاری)",
					htmlFor: "med-condition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "med-condition",
						value: condition,
						onChange: (e) => setCondition(e.target.value),
						placeholder: "مثلاً فشار خون"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "دوز",
					htmlFor: "med-dosage",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "med-dosage",
						value: dosage,
						onChange: (e) => setDosage(e.target.value),
						placeholder: "۵۰۰ mg"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "تعداد",
					htmlFor: "med-quantity",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "med-quantity",
						type: "number",
						min: isEdit ? 0 : 1,
						value: quantity,
						onChange: (e) => setQuantity(e.target.value),
						placeholder: "۳۰"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-muted",
					children: "یادآوری هر چند ساعت؟"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-4 gap-2",
					children: [PRESETS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setHours(v),
						className: hours === v ? "h-11 rounded-lg bg-primary text-sm font-medium text-primary-fg" : "h-11 rounded-lg bg-surface-2 text-sm text-fg ring-1 ring-border hover:bg-bg",
						children: [v, "س"]
					}, v)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setHours(null),
						className: hours === null ? "h-11 rounded-lg bg-primary text-sm font-medium text-primary-fg" : "h-11 rounded-lg bg-surface-2 text-sm text-fg ring-1 ring-dashed ring-border hover:bg-bg",
						children: "سفارشی"
					})]
				})] }),
				hours === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "بازه سفارشی (ساعت)",
					htmlFor: "custom-hours",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "custom-hours",
						type: "number",
						min: .02,
						step: .05,
						value: custom,
						onChange: (e) => setCustom(e.target.value),
						placeholder: "مثلاً 0.05 برای ۳ دقیقه"
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3 py-3 text-sm ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: startImmediately,
						onChange: (e) => setStartImmediately(e.target.checked),
						className: "size-4 accent-primary"
					}), isEdit ? "شروع تایمر با ذخیره" : "شروع شمارش بلافاصله"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "h-12 w-full",
					children: isEdit ? "ذخیره تغییرات" : "افزودن دارو"
				})
			]
		})]
	});
}
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor,
			className: "block text-sm text-muted",
			children: label
		}), children]
	});
}
var STATUS_LABEL = {
	"on-time": "به‌موقع",
	early: "زودتر",
	late: "دیرتر",
	missed: "از دست رفته",
	snoozed: "اسنوز",
	skipped: "رد شده"
};
function ReportSheet({ medication, onClose }) {
	const history = (0, import_react.useMemo)(() => [...medication.history || []].sort((a, b) => b.takenAt - a.takenAt), [medication.history]);
	const recent = history.slice(0, 8);
	const score = adherenceScore(history);
	const counts = {
		onTime: history.filter((h) => h.status === "on-time").length,
		early: history.filter((h) => h.status === "early").length,
		late: history.filter((h) => h.status === "late").length,
		missed: history.filter((h) => h.status === "missed" || h.status === "skipped").length
	};
	const [fingerprint, setFingerprint] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)(null);
	const reportText = (0, import_react.useMemo)(() => buildReport(medication, history, score, counts), [
		medication,
		history,
		score,
		counts
	]);
	(0, import_react.useEffect)(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		sha256(reportText).then(setFingerprint);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [onClose, reportText]);
	const copy = async () => {
		const body = `${reportText}\n\nاثر انگشت متن:\n${fingerprint}`;
		try {
			await navigator.clipboard.writeText(body);
			setNote("گزارش کپی شد.");
		} catch {
			setNote("کپی در دسترس نبود.");
		}
	};
	const download = () => {
		const body = `${reportText}\n\nاثر انگشت متن:\n${fingerprint}`;
		const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${medication.name}-گزارش.txt`;
		a.click();
		URL.revokeObjectURL(url);
		setNote("فایل ذخیره شد.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "report-title",
			className: "max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.1)]",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						id: "report-title",
						className: "text-lg font-semibold",
						children: ["گزارش ", medication.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "خلاصه برای پزشک یا مراقب — داده روی همین دستگاه است"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-10",
						onClick: onClose,
						"aria-label": "بستن",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
					})]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary",
					children: note
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between rounded-xl bg-bg px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "پایبندی به‌موقع"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: history.length === 0 ? "هنوز داده‌ای نیست" : score >= 80 ? "عالی" : score >= 50 ? "قابل قبول" : "نیاز به توجه"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("text-3xl font-medium tabular-nums", history.length === 0 ? "text-subtle" : score >= 80 ? "text-primary" : "text-due"),
						children: history.length ? `${score}٪` : "—"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 grid grid-cols-4 gap-2 text-center text-xs",
					children: [
						["به‌موقع", counts.onTime],
						["زودتر", counts.early],
						["دیرتر", counts.late],
						["از دست", counts.missed]
					].map(([label, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-bg px-2 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-lg font-medium tabular-nums",
							children: n
						})]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-xl bg-bg px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm font-medium",
						children: "دوزهای اخیر"
					}), recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "هنوز دوزی ثبت نشده."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: recent.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryRow, { record }, record.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 break-all font-mono text-[10px] leading-relaxed text-subtle",
					children: [
						"اثر انگشت متن (SHA-256) — امضا نیست، فقط برای مقایسهٔ دو نسخه از همین متن:",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						fingerprint || "…"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => void copy(),
						children: "کپی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: download,
						children: "دانلود"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "mt-2 w-full",
					onClick: onClose,
					children: "بستن"
				})
			]
		})
	});
}
function HistoryRow({ record }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: formatFaDateTime(record.takenAt)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-fg",
			children: STATUS_LABEL[record.status]
		})]
	});
}
function buildReport(medication, history, score, counts) {
	const last = history[0] ? formatFaDateTime(history[0].takenAt) : "—";
	const lines = history.slice(0, 5).map((h) => `- ${formatFaDateTime(h.takenAt)} — ${STATUS_LABEL[h.status]}`);
	return `گزارش مصرف دارو
نام: ${medication.name}
بیماری: ${medication.condition || "مشخص نشده"}
دوز: ${medication.dosage}
پایبندی به‌موقع: ${history.length ? `${score}٪` : "بدون داده"}
ثبت‌شده: ${history.length}
به‌موقع: ${counts.onTime} · زودتر: ${counts.early} · دیرتر: ${counts.late} · از دست: ${counts.missed}
آخرین دوز: ${last}

دوزهای اخیر:
${lines.length ? lines.join("\n") : "- هنوز دوزی ثبت نشده"}`;
}
async function sha256(text) {
	try {
		const data = new TextEncoder().encode(text);
		const buf = await crypto.subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
	} catch {
		return "unavailable";
	}
}
var DB_NAME = "MedicationReminderDB";
var DB_VERSION = 6;
var STORE_NAME = "medications";
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, {
				keyPath: "id",
				autoIncrement: true
			}).createIndex("nextDoseAt", "nextDoseAt", { unique: false });
		};
	});
}
async function withStore(mode, fn) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, mode);
		const store = tx.objectStore(STORE_NAME);
		let request;
		try {
			request = fn(store);
		} catch (e) {
			reject(e);
			return;
		}
		if (request) {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}
		tx.oncomplete = () => {
			if (!request) resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}
async function getAllMedications() {
	return (await withStore("readonly", (store) => store.getAll()) || []).map((m) => sanitizeMedication(m));
}
async function addMedication(medication) {
	const value = sanitizeMedication(medication);
	delete value.id;
	const id = await withStore("readwrite", (store) => store.add(value));
	return {
		...value,
		id
	};
}
async function updateMedication(medication) {
	await withStore("readwrite", (store) => store.put(sanitizeMedication(medication)));
}
async function deleteMedication(id) {
	await withStore("readwrite", (store) => store.delete(id));
}
async function exportBackup() {
	return {
		schemaVersion: 6,
		exportedAt: Date.now(),
		medications: await getAllMedications()
	};
}
async function importBackup(payload) {
	if (!payload || !Array.isArray(payload.medications)) throw new Error("فایل پشتیبان نامعتبر است");
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.clear();
		for (const medication of payload.medications) {
			const value = sanitizeMedication({
				...medication,
				id: void 0
			});
			delete value.id;
			store.add(value);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
var audioContext = null;
var oscillator = null;
var gainNode = null;
var beepInterval = null;
var isAlarmPlaying = false;
var BEEP_FREQUENCY = 880;
var BEEP_ON_MS = 220;
var BEEPS_PER_CYCLE = 4;
var ALARM_VOLUME = .42;
function createAudioContext() {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext || window.webkitAudioContext;
	if (!Ctor) return null;
	return new Ctor();
}
function clearAudioResources() {
	if (beepInterval !== null) {
		clearInterval(beepInterval);
		beepInterval = null;
	}
	if (oscillator) {
		try {
			oscillator.stop();
		} catch {}
		try {
			oscillator.disconnect();
		} catch {}
		oscillator = null;
	}
	if (gainNode) {
		try {
			gainNode.disconnect();
		} catch {}
		gainNode = null;
	}
	if (audioContext) {
		const ctx = audioContext;
		audioContext = null;
		ctx.close().catch(() => {});
	}
	if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(0);
}
async function playAlarm() {
	if (isAlarmPlaying) return;
	isAlarmPlaying = true;
	clearAudioResources();
	if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([
		280,
		80,
		280,
		80,
		280
	]);
	try {
		const ctx = createAudioContext();
		if (!ctx) {
			isAlarmPlaying = false;
			return;
		}
		audioContext = ctx;
		if (audioContext.state === "suspended") await audioContext.resume();
		oscillator = audioContext.createOscillator();
		gainNode = audioContext.createGain();
		oscillator.type = "triangle";
		oscillator.frequency.setValueAtTime(BEEP_FREQUENCY, audioContext.currentTime);
		gainNode.gain.setValueAtTime(1e-4, audioContext.currentTime);
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		oscillator.start();
		const runCycle = () => {
			if (!isAlarmPlaying || !audioContext || !gainNode) return;
			let t = audioContext.currentTime;
			for (let i = 0; i < BEEPS_PER_CYCLE; i++) {
				const freq = BEEP_FREQUENCY + (i % 2 === 0 ? 0 : 60);
				oscillator?.frequency.setValueAtTime(freq, t);
				gainNode.gain.setValueAtTime(ALARM_VOLUME, t);
				gainNode.gain.setValueAtTime(1e-4, t + BEEP_ON_MS / 1e3);
				t += 380 / 1e3;
			}
		};
		runCycle();
		beepInterval = setInterval(runCycle, 2420);
	} catch {
		stopAlarm();
	}
}
function stopAlarm() {
	isAlarmPlaying = false;
	clearAudioResources();
}
function checkNotificationPermission() {
	if (typeof window === "undefined" || !window.isSecureContext || !("Notification" in window)) return "unavailable";
	return Notification.permission;
}
async function requestNotificationPermission() {
	if (typeof window === "undefined" || !("Notification" in window)) return "unavailable";
	if (Notification.permission === "granted") return "granted";
	if (Notification.permission === "denied") return "denied";
	return await Notification.requestPermission();
}
function notifyDue(med, followUp = false) {
	if (typeof window === "undefined" || !("Notification" in window)) return;
	if (Notification.permission !== "granted") return;
	try {
		const n = new Notification(followUp ? "یادآوری مجدد دارو" : "زمان مصرف دارو", {
			body: `${med.name} — ${med.dosage}\nپس از مصرف، تأیید کنید.`,
			tag: `med-${med.id}`,
			requireInteraction: true
		});
		n.onclick = () => {
			window.focus();
			n.close();
		};
	} catch {}
}
async function persist(m) {
	await updateMedication(m);
}
var useMedStore = create((set, get) => ({
	medications: [],
	bootDone: false,
	bootError: null,
	permission: "default",
	alertId: null,
	now: Date.now(),
	load: async () => {
		try {
			const permission = checkNotificationPermission();
			const medications = await getAllMedications();
			const due = medications.find((m) => m.pendingDose);
			set({
				medications,
				permission,
				bootDone: true,
				bootError: null,
				alertId: due?.id ?? null
			});
			if (due) {
				playAlarm();
				notifyDue(due);
			}
		} catch (error) {
			set({
				bootError: error instanceof Error ? error.message : "خطا در بارگذاری داده‌ها",
				bootDone: false
			});
		}
	},
	add: async (draft) => {
		const now = Date.now();
		const interval = intervalFromHours(draft.intervalHours);
		const created = await addMedication({
			name: draft.name,
			condition: draft.condition,
			dosage: draft.dosage,
			quantity: draft.quantity,
			intervalHours: draft.intervalHours,
			interval,
			running: draft.startImmediately,
			pendingDose: false,
			nextDoseAt: draft.startImmediately ? now + interval * 1e3 : void 0,
			snoozeCount: 0,
			createdAt: now,
			updatedAt: now,
			history: []
		});
		set((s) => ({ medications: [...s.medications, created] }));
	},
	save: async (id, draft) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const now = Date.now();
		const interval = intervalFromHours(draft.intervalHours);
		let next = {
			...current,
			name: draft.name,
			condition: draft.condition,
			dosage: draft.dosage,
			quantity: draft.quantity,
			intervalHours: draft.intervalHours,
			interval,
			updatedAt: now
		};
		if (draft.startImmediately && !next.running && !next.pendingDose) next = {
			...next,
			running: true,
			pendingDose: false,
			nextDoseAt: now + interval * 1e3
		};
		else if (next.running && next.nextDoseAt && current.interval !== interval) {
			const ratio = remainingSeconds(current, now) / Math.max(1, current.interval);
			const remaining = Math.max(1, Math.round(ratio * interval));
			next = {
				...next,
				nextDoseAt: now + remaining * 1e3
			};
		}
		await persist(next);
		set((s) => ({ medications: s.medications.map((m) => m.id === id ? next : m) }));
	},
	remove: async (id) => {
		await deleteMedication(id);
		set((s) => ({
			medications: s.medications.filter((m) => m.id !== id),
			alertId: s.alertId === id ? null : s.alertId
		}));
		if (get().alertId === null) stopAlarm();
	},
	take: async (id) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const updated = applyTake(current);
		await persist(updated);
		stopAlarm();
		set((s) => ({
			medications: s.medications.map((m) => m.id === id ? updated : m),
			alertId: s.alertId === id ? null : s.alertId
		}));
	},
	snooze: async (id, minutes = 10) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const updated = applySnooze(current, minutes);
		await persist(updated);
		stopAlarm();
		set((s) => ({
			medications: s.medications.map((m) => m.id === id ? updated : m),
			alertId: s.alertId === id ? null : s.alertId
		}));
	},
	skip: async (id) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const updated = applySkip(current);
		await persist(updated);
		stopAlarm();
		set((s) => ({
			medications: s.medications.map((m) => m.id === id ? updated : m),
			alertId: s.alertId === id ? null : s.alertId
		}));
	},
	toggle: async (id) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const updated = applyToggle(current);
		await persist(updated);
		set((s) => ({ medications: s.medications.map((m) => m.id === id ? updated : m) }));
	},
	reset: async (id) => {
		const current = get().medications.find((m) => m.id === id);
		if (!current) return;
		const updated = applyReset(current);
		await persist(updated);
		if (get().alertId === id) stopAlarm();
		set((s) => ({
			medications: s.medications.map((m) => m.id === id ? updated : m),
			alertId: s.alertId === id ? null : s.alertId
		}));
	},
	tick: () => {
		const now = Date.now();
		const { medications, alertId } = get();
		let changed = false;
		let newAlert = alertId;
		const next = medications.map((m) => {
			if (m.running && m.nextDoseAt && m.nextDoseAt <= now) {
				changed = true;
				const due = toDue(m, now);
				newAlert = due.id;
				persist(due);
				playAlarm();
				notifyDue(due);
				return due;
			}
			return m;
		});
		if (changed) set({
			medications: next,
			now,
			alertId: newAlert
		});
		else set({ now });
	},
	requestPermission: async () => {
		set({ permission: await requestNotificationPermission() });
	},
	dismissAlert: () => {
		stopAlarm();
		set({ alertId: null });
	},
	exportJson: async () => {
		const payload = await exportBackup();
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `medireminder-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	},
	importJson: async (file) => {
		await importBackup(JSON.parse(await file.text()));
		await get().load();
	},
	addDemo: async () => {
		await get().add({
			name: "نمونه — ویتامین D",
			condition: "دمو برای تست یادآوری",
			dosage: "۱۰۰۰ IU",
			intervalHours: 2 / 60,
			quantity: 14,
			startImmediately: true
		});
	}
}));
var NAG_MS = 45e3;
function Home() {
	const { medications, bootDone, bootError, permission, alertId, now, load, add, save, remove, take, snooze, skip, toggle, reset, tick, requestPermission, dismissAlert, exportJson, importJson, addDemo } = useMedStore();
	const [showAdd, setShowAdd] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [report, setReport] = (0, import_react.useState)(null);
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	const nagRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	(0, import_react.useEffect)(() => {
		tick();
		const id = window.setInterval(() => tick(), 1e3);
		return () => window.clearInterval(id);
	}, [tick]);
	(0, import_react.useEffect)(() => {
		if (nagRef.current != null) window.clearTimeout(nagRef.current);
		if (!medications.filter((m) => m.pendingDose).length) return;
		nagRef.current = window.setTimeout(() => {
			const still = useMedStore.getState().medications.find((m) => m.pendingDose);
			if (still) {
				useMedStore.setState({ alertId: still.id });
				playAlarm();
			}
		}, NAG_MS);
		return () => {
			if (nagRef.current != null) window.clearTimeout(nagRef.current);
		};
	}, [medications, alertId]);
	const alertMed = medications.find((m) => m.id === alertId && m.pendingDose) ?? null;
	const dueCount = medications.filter((m) => m.pendingDose).length;
	const confirmMed = medications.find((m) => m.id === confirmId) ?? null;
	const formVisible = showAdd || editing !== null;
	if (bootError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-bg p-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl bg-surface p-6 text-center shadow-[0_0_0_1px_rgba(196,92,74,0.3)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold text-due",
					children: "راه‌اندازی انجام نشد"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: bootError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 w-full",
					onClick: () => void load(),
					children: "تلاش مجدد"
				})
			]
		})
	});
	if (!bootDone) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "در حال بارگذاری…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-lg px-4 pb-16 pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
										children: "MediReminder"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-1 text-3xl font-semibold tracking-tight",
										children: "یادآور دارو"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "هشدار تکرار می‌شود تا مصرف را تأیید کنید."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-border",
									children: ["v", APP_VERSION]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => {
											setEditing(null);
											setShowAdd(true);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "افزودن دارو"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										onClick: () => void exportJson(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "پشتیبان"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										onClick: () => fileRef.current?.click(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "بازیابی"]
									}),
									permission !== "granted" && permission !== "unavailable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => void requestPermission(),
										children: [permission === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {}), "اعلان"]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "application/json,.json",
								className: "sr-only",
								onChange: (e) => {
									const file = e.target.files?.[0];
									e.target.value = "";
									if (file) importJson(file);
								}
							}),
							permission !== "granted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 rounded-xl bg-surface px-3 py-3 text-xs leading-relaxed text-muted ring-1 ring-border",
								children: permission === "denied" ? "مجوز اعلان رد شده. از تنظیمات مرورگر آن را فعال کنید؛ در غیر این صورت فقط هشدار داخل برنامه کار می‌کند." : permission === "unavailable" ? "اعلان مرورگر در این محیط در دسترس نیست. هشدار داخل برنامه و صدای آلارم همچنان کار می‌کند." : "برای هشدار وقتی برنامه در پس‌زمینه است، مجوز اعلان را بدهید."
							}) : null,
							dueCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 rounded-xl bg-due/10 px-3 py-3 text-xs text-due-fg ring-1 ring-due/25",
								children: [dueCount, " دارو منتظر تأیید است. بستن پنجره هشدار، مصرف را ثبت نمی‌کند."]
							}) : null
						]
					}),
					formVisible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicationForm, {
							initial: editing ?? void 0,
							onSubmit: (d) => {
								if (editing) save(editing.id, d);
								else add(d);
								setShowAdd(false);
								setEditing(null);
							},
							onCancel: () => {
								setShowAdd(false);
								setEditing(null);
							}
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: medications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							onAdd: () => setShowAdd(true),
							onDemo: () => void addDemo()
						}) : medications.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicationCard, {
							medication: m,
							now,
							index: i + 1,
							onToggle: () => void toggle(m.id),
							onReset: () => void reset(m.id),
							onDelete: () => setConfirmId(m.id),
							onEdit: () => {
								setShowAdd(false);
								setEditing(m);
							},
							onReport: () => setReport(m),
							onTake: () => void take(m.id),
							onSnooze: () => void snooze(m.id, 10),
							onSkip: () => void skip(m.id)
						}, m.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mt-10 space-y-2 text-center text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "داده‌ها فقط روی همین دستگاه، در IndexedDB ذخیره می‌شوند. سروری در کار نیست." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ابزار یادآوری است — جایگزین توصیهٔ پزشک نیست." })]
					})
				]
			}),
			alertMed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoseAlert, {
				medication: alertMed,
				onTake: () => void take(alertMed.id),
				onSnooze: (minutes) => void snooze(alertMed.id, minutes),
				onLater: dismissAlert
			}) : null,
			report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportSheet, {
				medication: report,
				onClose: () => setReport(null)
			}) : null,
			confirmMed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDelete, {
				name: confirmMed.name,
				onCancel: () => setConfirmId(null),
				onConfirm: () => {
					remove(confirmMed.id);
					setConfirmId(null);
					if (editing?.id === confirmMed.id) setEditing(null);
				}
			}) : null
		]
	});
}
function EmptyState({ onAdd, onDemo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-surface px-6 py-12 text-center shadow-[0_0_0_1px_rgba(238,243,240,0.08)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 text-xl font-semibold",
				children: "هنوز دارویی ثبت نشده"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "اولین دارو را اضافه کنید. تایمر از همین لحظه شروع می‌شود و تا تأیید مصرف تکرار می‌کند."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onAdd,
					children: "افزودن دارو"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: onDemo,
					children: "نمونهٔ ۲ دقیقه‌ای"
				})]
			})
		]
	});
}
function ConfirmDelete({ name, onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4",
		onClick: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "del-title",
			className: "w-full max-w-sm rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.1)]",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "del-title",
					className: "text-lg font-semibold",
					children: "حذف دارو"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"«",
						name,
						"» و تاریخچهٔ مصرف آن از این دستگاه پاک می‌شود."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						className: "flex-1",
						onClick: onConfirm,
						children: "حذف"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "flex-1",
						onClick: onCancel,
						children: "انصراف"
					})]
				})
			]
		})
	});
}
//#endregion
export { Home as component };
