"use client";

import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { DATE_FILTERS, SORT_OPTIONS, type DateFilterValue, type SortValue } from "@/lib/events";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";
import { cn } from "@/lib/utils";

/** Reference B's rounded search field; reused in the site header and toolbars. */
export function SearchField({
  value,
  onChange,
  placeholder = "Search events",
  className,
  id = "event-search",
  label = "Search events",
  onSubmit,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  label?: string;
  onSubmit?: () => void;
}) {
  return (
    <form
      role="search"
      onSubmit={(submitted) => {
        submitted.preventDefault();
        onSubmit?.();
      }}
      className={cn("relative", className)}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(changed) => onChange(changed.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-cream-200 bg-white pl-11 pr-4 text-sm text-ink-900 shadow-soft placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
      />
    </form>
  );
}

export interface EventFiltersProps {
  query: string;
  onQueryChange: (next: string) => void;
  category: EventCategory | "all";
  onCategoryChange: (next: EventCategory | "all") => void;
  dateFilter?: DateFilterValue;
  onDateFilterChange?: (next: DateFilterValue) => void;
  sort?: SortValue;
  onSortChange?: (next: SortValue) => void;
  resultCount?: number;
  resultLabel?: string;
  onReset?: () => void;
  extra?: ReactNode;
  placeholder?: string;
  className?: string;
}

export function EventFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  dateFilter,
  onDateFilterChange,
  sort,
  onSortChange,
  resultCount,
  resultLabel = "events",
  onReset,
  extra,
  placeholder,
  className,
}: EventFiltersProps) {
  const filtersActive =
    query.trim().length > 0 ||
    category !== "all" ||
    (dateFilter !== undefined && dateFilter !== "all");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder={placeholder ?? "Search by title, venue or tag"}
          className="lg:flex-1"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:w-auto lg:items-center">
          <label className="sr-only" htmlFor="filter-category">
            Category
          </label>
          <Select
            id="filter-category"
            value={category}
            onChange={(changed) => onCategoryChange(changed.target.value as EventCategory | "all")}
            className="h-12 py-0 lg:w-44"
          >
            <option value="all">All categories</option>
            {EVENT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>

          {onDateFilterChange ? (
            <>
              <label className="sr-only" htmlFor="filter-date">
                Date range
              </label>
              <Select
                id="filter-date"
                value={dateFilter ?? "all"}
                onChange={(changed) =>
                  onDateFilterChange(changed.target.value as DateFilterValue)
                }
                className="h-12 py-0 lg:w-40"
              >
                {DATE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </>
          ) : null}

          {onSortChange ? (
            <>
              <label className="sr-only" htmlFor="filter-sort">
                Sort by
              </label>
              <Select
                id="filter-sort"
                value={sort ?? "soonest"}
                onChange={(changed) => onSortChange(changed.target.value as SortValue)}
                className="col-span-2 h-12 py-0 sm:col-span-1 lg:w-44"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </>
          ) : null}
        </div>

        {extra}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-ink-500">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-brand-600" />
          <span>
            <span className="font-semibold text-ink-900">{resultCount ?? 0}</span>{" "}
            {resultLabel}
            {query.trim() ? (
              <>
                {" "}
                matching <span className="font-medium text-ink-700">“{query.trim()}”</span>
              </>
            ) : null}
          </span>
        </p>

        {filtersActive && onReset ? (
          <Button variant="ghost" size="sm" icon={<X className="size-3.5" />} onClick={onReset}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
