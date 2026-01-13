import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from "./constants";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price from cents to display string
 * @param cents - Price in cents (e.g., 8000 = 80€)
 * @param currency - Currency code (default: EUR)
 */
export function formatPrice(
  cents: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const amount = cents / 100;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${amount.toFixed(0)}${symbol}`;
}

/**
 * Format a date to French locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", options).format(d);
}

/**
 * Format a time string (HH:mm)
 * @param date - Date to format
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format duration in minutes to human readable string
 * @param minutes - Duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins}`;
}

/**
 * Get initials from a name
 * @param name - Full name
 * @param maxChars - Maximum number of characters (default: 2)
 */
export function getInitials(name: string | null | undefined, maxChars = 2): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join("")
    .toUpperCase();
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Sleep for a given number of milliseconds
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if we're running in development
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
