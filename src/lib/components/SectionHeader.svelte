<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    href?: string;
    linkText?: string;
  }

  let { title, subtitle = '', href = '', linkText = 'View All' }: Props = $props();
</script>

<div class="flex items-end justify-between mb-6">
  <div>
    <h2 class="text-2xl md:text-3xl font-bold">{title}</h2>
    {#if subtitle}
      <p class="text-muted-foreground text-sm mt-1">{subtitle}</p>
    {/if}
  </div>
  {#if href}
    <a
      {href}
      class="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 flex-shrink-0"
    >
      {linkText}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  {/if}
</div>