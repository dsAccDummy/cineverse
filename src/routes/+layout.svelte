<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { movieGenres, tvGenres } from '$lib/stores/genres';
  import { getMovieGenres, getTVGenres } from '$lib/api/tmdb';

  let { children } = $props();

  onMount(async () => {
    try {
      const [mGenres, tGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);
      movieGenres.set(mGenres.genres);
      tvGenres.set(tGenres.genres);
    } catch (err) {
      console.error('Failed to load genres:', err);
    }
  });
</script>

<ModeWatcher defaultMode="dark" />

<div class="min-h-screen flex flex-col">
  <Navbar />

  <main class="flex-1">
    {@render children()}
  </main>

  <Footer />
</div>
