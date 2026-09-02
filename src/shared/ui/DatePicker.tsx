import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function toDate(iso: string): Date | null {
  if (!iso) return null;
  const datePart = iso.includes("T") ? iso.split("T")[0] : iso;
  const d = new Date(`${datePart}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso: string): string {
  const d = toDate(iso);
  if (!d) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type Props = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  inline?: boolean;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  maxDate,
  minDate,
  inline = false,
}: Props) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const effectiveMax = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : undefined;
  const effectiveMin = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined;

  const initialDate = toDate(value) ?? today;
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [yearPage, setYearPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const YEARS_PER_PAGE = 25;
  const maxYear = effectiveMax ? effectiveMax.getFullYear() : today.getFullYear() + 50;
  const startYear = maxYear - 100 + yearPage * YEARS_PER_PAGE;
  const years: number[] = [];
  for (let y = startYear; y < startYear + YEARS_PER_PAGE && y <= maxYear; y++) {
    years.push(y);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function canGoNext(): boolean {
    if (!effectiveMax) return true;
    if (viewYear < effectiveMax.getFullYear()) return true;
    if (viewYear === effectiveMax.getFullYear() && viewMonth < effectiveMax.getMonth()) return true;
    return false;
  }

  function handleSelectDate(day: number) {
    const selected = new Date(viewYear, viewMonth, day);
    if (effectiveMax && selected > effectiveMax) return;
    if (effectiveMin && selected < effectiveMin) return;
    onChange(toISO(selected));
    setIsOpen(false);
  }

  function handleSelectMonth(month: number) {
    setViewMonth(month);
    setViewMode("days");
  }

  function handleSelectYear(year: number) {
    setViewYear(year);
    setViewMode("months");
    const page = Math.floor((year - (maxYear - 100)) / YEARS_PER_PAGE);
    setYearPage(Math.max(0, page));
  }

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= days; d++) calendarDays.push(d);

  const selectedDate = toDate(value);

  return (
    <div ref={ref} className={inline ? undefined : "relative"}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setViewMode("days");
              setYearPage(0);
              const d = toDate(value) ?? today;
              setViewYear(d.getFullYear());
              setViewMonth(d.getMonth());
            }
          }
        }}
        disabled={disabled}
        className={`flex h-11 w-full items-center rounded-xl border-2 bg-white px-4 text-sm outline-none transition ${
          isOpen ? "border-duo-green" : "border-zinc-200 hover:border-zinc-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span className={value ? "font-medium text-zinc-800" : "text-zinc-400"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className={`rounded-xl border border-zinc-200 bg-white p-3 shadow-lg ${inline ? "mt-1" : "absolute left-0 right-0 top-full z-30 mt-1"}`}>
          {viewMode === "days" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("months")}
                  className="rounded-lg px-3 py-1 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  {MONTHS[viewMonth]} {viewYear}
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={!canGoNext()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="flex h-8 items-center justify-center text-xs font-medium text-zinc-400">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;

                  const date = new Date(viewYear, viewMonth, day);
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                  const isInRange = (!effectiveMax || date <= effectiveMax) && (!effectiveMin || date >= effectiveMin);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => isInRange && handleSelectDate(day)}
                      disabled={!isInRange}
                      className={`flex h-8 w-full items-center justify-center rounded-lg text-sm transition ${
                        isSelected
                          ? "bg-duo-green text-white font-semibold"
                          : isInRange
                            ? "text-zinc-700 hover:bg-zinc-100"
                            : "cursor-not-allowed text-zinc-300"
                      } ${isToday(date) && !isSelected ? "font-semibold text-duo-green" : ""}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === "months" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="rounded-lg px-3 py-1 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  {viewYear}
                </button>
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y + 1)}
                  disabled={effectiveMax ? viewYear >= effectiveMax.getFullYear() : false}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((month, i) => {
                  const beforeMax =
                    !effectiveMax ||
                    viewYear < effectiveMax.getFullYear() ||
                    (viewYear === effectiveMax.getFullYear() && i <= effectiveMax.getMonth());
                  const afterMin =
                    !effectiveMin ||
                    viewYear > effectiveMin.getFullYear() ||
                    (viewYear === effectiveMin.getFullYear() && i >= effectiveMin.getMonth());
                  const isInRange = beforeMax && afterMin;

                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => isInRange && handleSelectMonth(i)}
                      disabled={!isInRange}
                      className={`rounded-lg px-2 py-2 text-sm transition ${
                        viewMonth === i
                          ? "bg-duo-green font-semibold text-white"
                          : isInRange
                            ? "text-zinc-700 hover:bg-zinc-100"
                            : "cursor-not-allowed text-zinc-300"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === "years" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setYearPage((p) => Math.max(0, p - 1))}
                  disabled={yearPage === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-zinc-700">
                  {startYear}–{startYear + YEARS_PER_PAGE - 1}
                </span>
                <button
                  type="button"
                  onClick={() => setYearPage((p) => p + 1)}
                  disabled={effectiveMax ? startYear + YEARS_PER_PAGE > effectiveMax.getFullYear() : false}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1">
                {years.map((y) => {
                  const isInRange =
                    (!effectiveMax || y <= effectiveMax.getFullYear()) &&
                    (!effectiveMin || y >= effectiveMin.getFullYear());
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => isInRange && handleSelectYear(y)}
                      disabled={!isInRange}
                      className={`rounded-lg px-2 py-1.5 text-sm transition ${
                        viewYear === y
                          ? "bg-duo-green font-semibold text-white"
                          : isInRange
                            ? "text-zinc-700 hover:bg-zinc-100"
                            : "cursor-not-allowed text-zinc-300"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              const todayStr = toISO(today);
              onChange(todayStr);
              setViewMonth(today.getMonth());
              setViewYear(today.getFullYear());
            }}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-duo-green"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}