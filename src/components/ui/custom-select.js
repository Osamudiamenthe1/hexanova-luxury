/**
 * src/components/ui/custom-select.js
 * A styled dropdown that replaces the native <select> element.
 *
 * WHY NOT JUST USE <select>?
 * The list that opens when you click a <select> is rendered by the OS,
 * not the browser. We cannot style it, and on some devices it expands
 * wider than its input. This component renders its own list instead.
 *
 * HOW THE VALUE GETS SUBMITTED:
 * We render a native <select> with className="sr-only" (screen-reader
 * only). It is invisible but still a real form control, so browsers submit
 * its value with the form. This is more reliable than a hidden <input>,
 * especially since React 19 resets forms after Server Actions run.
 *
 * SMOOTH OPEN + CLOSE:
 * Two pieces of state drive the animation - "mounted" (in the DOM at all)
 * and "visible" (transition in the open position). On close, we wait
 * 200ms before unmounting so the exit animation can play.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;

  function openList() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }

  function closeList() {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, 200);
  }

  useEffect(() => {
    if (!mounted) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeList();
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") closeList();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [mounted]);

  function handleToggle() {
    if (visible) closeList();
    else openList();
  }

  function handleSelect(optionValue) {
    onChange(optionValue);
    closeList();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden native select. This is what actually submits with the form.
          sr-only keeps it in the accessibility tree (screen readers can
          find it) while hiding it visually. */}
      {name && (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {/* The visible trigger. Looks like a select input but isn't one. */}
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={visible}
        className="w-full h-11 pl-3 pr-9 border border-border bg-background rounded-md text-sm text-left flex items-center justify-between gap-2 hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            visible ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* The custom list. */}
      {mounted && (
        <ul
          role="listbox"
          className={`absolute top-full left-0 right-0 mt-1.5 z-30 bg-card border border-border rounded-md shadow-lg overflow-hidden py-1 max-h-64 overflow-y-auto transform transition-all duration-200 ease-out origin-top ${
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors duration-150 ${
                    isSelected
                      ? "text-foreground bg-muted/60"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      className="h-3.5 w-3.5 text-accent shrink-0"
                      strokeWidth={1.75}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}