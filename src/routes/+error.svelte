<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center px-4 pt-16">
  <div class="text-center max-w-md">
    <div class="mb-8">
      <span class="text-8xl font-black gradient-text">{$page.status}</span>
    </div>
    <h1 class="text-2xl font-bold mb-4">
      {#if $page.status === 404}
        Page Not Found
      {:else}
        Something Went Wrong
      {/if}
    </h1>
    <p class="text-muted-foreground mb-8">
      {#if $page.error?.message}
        {$page.error.message}
      {:else if $page.status === 404}
        The page you're looking for doesn't exist or has been moved.
      {:else}
        An unexpected error occurred. Please try again later.
      {/if}
    </p>
    <div class="flex items-center justify-center gap-4">
      <a
        href="/"
        class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
      >
        Go Home
      </a>
      <button
        type="button"
        onclick={() => history.back()}
        class="px-6 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-all"
      >
        Go Back
      </button>
    </div>
  </div>
</div>
