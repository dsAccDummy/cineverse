<script lang="ts">
  import { onMount } from 'svelte';
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import HorizontalScroll from '$lib/components/HorizontalScroll.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import {
    getPopularMovies,
    getTrendingMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getNowPlayingMovies,
    getTopRatedTVShows,
    getTrendingTV,
    getKoreanDramas,
  } from '$lib/api/tmdb';
  import type { Movie, TVShow } from '$lib/types/tmdb';

  let heroMovies = $state<Movie[]>([]);
  let trendingMovies = $state<Movie[]>([]);
  let topRatedMovies = $state<Movie[]>([]);
  let upcomingMovies = $state<Movie[]>([]);
  let nowPlayingMovies = $state<Movie[]>([]);
  let topRatedTV = $state<TVShow[]>([]);
  let trendingTV = $state<TVShow[]>([]);
  let kdramas = $state<TVShow[]>([]);

  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const [
        popularRes,
        trendingRes,
        topRatedRes,
        upcomingRes,
        nowPlayingRes,
        topRatedTVRes,
        trendingTVRes,
        kdramaRes,
      ] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies('week'),
        getTopRatedMovies(),
        getUpcomingMovies(),
        getNowPlayingMovies(),
        getTopRatedTVShows(),
        getTrendingTV('week'),
        getKoreanDramas(),
      ]);

      heroMovies = popularRes.results.slice(0, 8);
      trendingMovies = trendingRes.results;
      topRatedMovies = topRatedRes.results;
      upcomingMovies = upcomingRes.results;
      nowPlayingMovies = nowPlayingRes.results;
      topRatedTV = topRatedTVRes.results;
      trendingTV = trendingTVRes.results;
      kdramas = kdramaRes.results;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load content';
      console.error('Home page load error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>CineVerse - Discover Movies & TV Shows</title>
  <meta name="description" content="Explore trending movies, top-rated TV shows, K-dramas, and more on CineVerse." />
</svelte:head>

<!-- Hero Carousel -->
{#if heroMovies.length > 0}
  <HeroCarousel movies={heroMovies} />
{:else if loading}
  <div class="w-full h-[70vh] min-h-[500px] bg-gradient-to-b from-muted to-background shimmer" />
{/if}

<!-- Error State -->
{#if error}
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg class="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold mb-2">Failed to Load Content</h2>
      <p class="text-muted-foreground mb-4">{error}</p>
      <p class="text-sm text-muted-foreground">Please check your TMDB API key in the environment variables (VITE_TMDB_API_KEY).</p>
      <button
        type="button"
        onclick={() => location.reload()}
        class="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
{/if}

<!-- Content Sections -->
{#if !error}
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">

    <!-- Trending Movies -->
    <section>
      <SectionHeader
        title="Trending Movies"
        subtitle="What everyone is watching this week"
        href="/movies"
        linkText="See All Movies"
      />
      <HorizontalScroll items={trendingMovies} type="movie" loading={loading} />
    </section>

    <!-- Now Playing -->
    <section>
      <SectionHeader
        title="Now Playing"
        subtitle="Currently in theaters"
        href="/movies?sort=now_playing"
      />
      <HorizontalScroll items={nowPlayingMovies} type="movie" loading={loading} />
    </section>

    <!-- Top Rated TV Shows -->
    <section>
      <SectionHeader
        title="Top Rated TV Shows"
        subtitle="The best shows according to viewers"
        href="/tv"
        linkText="See All Shows"
      />
      <HorizontalScroll items={topRatedTV} type="tv" loading={loading} />
    </section>

    <!-- Trending TV -->
    <section>
      <SectionHeader
        title="Trending TV Shows"
        subtitle="Popular shows this week"
        href="/tv"
      />
      <HorizontalScroll items={trendingTV} type="tv" loading={loading} />
    </section>

    <!-- K-Drama Section -->
    <section>
      <SectionHeader
        title="Korean Dramas"
        subtitle="Popular K-Dramas you should watch"
        href="/browse?genre=18&language=ko"
        linkText="Explore K-Dramas"
      />
      <HorizontalScroll items={kdramas} type="tv" loading={loading} />
    </section>

    <!-- Upcoming Movies -->
    <section>
      <SectionHeader
        title="Coming Soon"
        subtitle="Movies hitting theaters soon"
        href="/movies?sort=upcoming"
      />
      <HorizontalScroll items={upcomingMovies} type="movie" loading={loading} />
    </section>

    <!-- Top Rated Movies Grid -->
    <section>
      <SectionHeader
        title="Top Rated Movies"
        subtitle="Critically acclaimed films"
        href="/movies?sort=vote_average.desc"
        linkText="View More"
      />
      <MediaGrid
        items={topRatedMovies.slice(0, 12)}
        type="movie"
        loading={loading}
        skeletonCount={12}
        columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      />
    </section>

    <!-- CTA Section -->
    <section class="relative rounded-2xl overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl" />
      <div class="relative px-8 py-16 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Discover Your Next Favorite</h2>
        <p class="text-muted-foreground max-w-xl mx-auto mb-8">
          Browse thousands of movies and TV shows. Filter by genre, rating, and more to find exactly what you want to watch tonight.
        </p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/browse"
            class="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Browse All
          </a>
          <a
            href="/movies"
            class="px-8 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-all"
          >
            Explore Movies
          </a>
        </div>
      </div>
    </section>

  </div>
{/if}
