import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a readable string format
 * @param date The date to format
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Formats a price based on transaction type
 * @param price The price to format
 * @param transactionType The type of transaction (rent or buy)
 * @returns Formatted price string with appropriate suffix
 */
export function formatPrice(price: number, transactionType: string): string {
  if (!price) return '₹0';
  return `₹${price}${transactionType === 'rent' ? '/day' : ''}`;
}

/**
 * Generates a random string of specified length
 * @param length The length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Truncates text to a specified length
 * @param text The text to truncate
 * @param maxLength Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str The string to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
