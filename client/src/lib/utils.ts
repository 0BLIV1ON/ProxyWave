import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if a string is a valid URL
export function isValidUrl(urlString: string): boolean {
  try {
    // Try to create URL object
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    // If the URL doesn't have a protocol, try adding http:// and checking again
    if (!urlString.match(/^[a-zA-Z]+:\/\//)) {
      try {
        const url = new URL(`http://${urlString}`);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}

// Format URL for display 
export function formatUrlForDisplay(url: string): string {
  try {
    const urlObj = new URL(url);
    // Return the hostname and pathname (limited to 50 chars)
    const displayUrl = `${urlObj.hostname}${urlObj.pathname}`;
    return displayUrl.length > 50 ? displayUrl.substring(0, 47) + '...' : displayUrl;
  } catch (e) {
    return url;
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

// Get favicon URL for a domain
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch (e) {
    return `https://www.google.com/s2/favicons?domain=${url}`;
  }
}
