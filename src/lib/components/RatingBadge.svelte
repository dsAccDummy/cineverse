<script lang="ts">
  import { formatVoteAverage, getRatingBg, getRatingColor } from '$lib/utils';

  interface Props {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
  }

  let { rating, size = 'md' }: Props = $props();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };
</script>

<div
  class="relative rounded-full flex items-center justify-center font-bold border-2 {sizeClasses[size]} {getRatingBg(rating)}"
  title="Rating: {formatVoteAverage(rating)}"
>
  <span class={getRatingColor(rating)}>{formatVoteAverage(rating)}</span>
</div>