import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(
  path: string | null,
  size: string = 'w500'
): string {
  if (!path) return '/no-image.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: string = 'w1280'
): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).getFullYear().toString();
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatVoteAverage(vote: number): string {
  return vote.toFixed(1);
}

export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getYearRange(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [''];
  for (let y = currentYear; y >= 1950; y--) {
    years.push(y.toString());
  }
  return years;
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export function getRatingBg(rating: number): string {
  if (rating >= 8) return 'bg-green-500/20 border-green-500/50';
  if (rating >= 6) return 'bg-yellow-500/20 border-yellow-500/50';
  if (rating >= 4) return 'bg-orange-500/20 border-orange-500/50';
  return 'bg-red-500/20 border-red-500/50';
}

export function getTrailerUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
}

export function getYoutubeThumb(key: string): string {
  return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function isMovie(item: { title?: string; name?: string }): boolean {
  return 'title' in item && item.title !== undefined;
}

export function getTitle(item: { title?: string; name?: string }): string {
  return ('title' in item ? item.title : item.name) ?? 'Unknown';
}

export function getDate(item: { release_date?: string; first_air_date?: string }): string {
  return ('release_date' in item ? item.release_date : item.first_air_date) ?? '';
}
