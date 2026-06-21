import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes, resolving conflicts and applying conditional logic.
 * * @param {...(string|undefined|null|false|Object|Array)} inputs - The classes to merge.
 * @returns {string} The final merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



