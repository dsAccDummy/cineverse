<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { favorites } from '$lib/stores/favorites';
  import { getTVShowDetails, getTVCredits, getTVVideos, getTVReviews, getSimilarTVShows, getTVRecommendations } from '$lib/api/tmdb';
  import { getImageUrl, getBackdropUrl, formatDate, formatYear, formatVoteAverage, getRatingColor, getRatingBg, truncateText, getTrailerUrl } from '$lib/utils';
  import HorizontalScroll from '$lib/components/HorizontalScroll.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import RatingBadge from '$lib/components/RatingBadge.svelte';
  import type { TVShowDetails, Credits, Video, Review, TVShow, FavoriteItem } from '$lib/types/tmdb';

  let show = $state<TVShowDetails | null>(null);
  let credits = $state<Credits | null>(null);
  let videos = $state<Video[]>([]);
  let reviews = $state<Review[]>([]);
  let similar = $state<TVShow[]>([]);
  let recommendations = $state<TVShow[]>([]);
  let loading = $state(true);
  let error = $state('');
  let showTrailer = $state(false);
  let selectedTrailer = $state<Video | null>(null);
  let showAllCast = $state(false);
  let expandedReview = $state<string | null>(null);
  let selectedSeason = $state(0);

  const showId = $derived(Number($page.params.id));

  async function loadShow(id: number) {
    loading = true;
    error = '';
    showTrailer = false;
    showAllCast = false;
    try {
      const [showData, creditsData, videosData, reviewsData, similarData, recsData] = await Promise.all([
        getTVShowDetails(id),
        getTVCredits(id),
        getTVVideos(id),
        getTVReviews(id),
        getSimilarTVShows(id),
        getTVRecommendations(id),
      ]);

      show = showData;
      credits = creditsData;
      videos = videosData.results.filter((v) => v.site === 'YouTube');
      reviews = reviewsData.results;
      similar = similarData.results;
      recommendations = recsData.results;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load TV show details';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (showId) {
      loadShow(showId);
      window.scrollTo({ top: 0 });
    }
  });

  function handleToggleFavorite() {
    if (!show) return;
    const favItem: FavoriteItem = {
      id: show.id,
      type: 'tv',
      title: show.name,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      added_at: new Date().toISOString(),
    };
    favorites.toggleFavorite(favItem);
  }

  function openTrailer(video?: Video) {
    const trailer = video || videos.find((v) => v.type === 'Trailer') || videos[0];
    if (trailer) {
      selectedTrailer = trailer;
      showTrailer = true;
    }
  }

  let isFav = $derived(show ? $favorites.some((f) => f.id === show!.id && f.type === 'tv') : false);
  let trailer = $derived(videos.find((v) => v.type === 'Trailer' && v.official) || videos.find((v) => v.type === 'Trailer') || videos[0]);
  let creators = $derived(show?.created_by || []);
  let displayCast = $derived(showAllCast ? credits?.cast || [] : credits?.cast.slice(0, 12) || []);
</script>

<svelte:head>
  {#if show}
    <title>{show.name} - CineVerse</title>
    <meta name="description" content={truncateText(show.overview, 160)} />
  {:else}
    <title>TV Show Details - CineVerse</title>
  {/if}
</svelte:head>

<!-- Loading -->
{#if loading}
  <div class="pt-16">
    <div class="w-full h-[60vh] shimmer" />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="h-10 w-96 rounded shimmer" />
      <div class="h-6 w-64 rounded shimmer" />
      <div class="h-24 w-full max-w-2xl rounded shimmer" />
    </div>
  </div>

<!-- Error -->
{:else if error}
  <div class="pt-20 min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <p class="text-destructive text-xl mb-4">{error}</p>
      <button type="button" onclick={() => loadShow(showId)}
        class="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
        Retry
      </button>
    </div>
  </div>

<!-- Show Content -->
{:else if show}
  <!-- Backdrop Hero -->
  <div class="relative w-full min-h-[60vh]">
    {#if show.backdrop_path}
      <img src={getBackdropUrl(show.backdrop_path, 'w1280')} alt="" class="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
    {/if}
    <div class="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
    <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col md:flex-row gap-8 items-start">
      <!-- Poster -->
      <div class="flex-shrink-0 w-64 hidden md:block">
        <img src={getImageUrl(show.poster_path, 'w500')} alt={show.name} class="w-full rounded-xl shadow-2xl shadow-black/50" />
      </div>

      <!-- Info -->
      <div class="flex-1 space-y-5">
        <div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">{show.name}</h1>
          {#if show.tagline}
            <p class="text-muted-foreground italic mt-2 text-lg">"{show.tagline}"</p>
          {/if}
        </div>

        <!-- Meta -->
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <RatingBadge rating={show.vote_average} />
          <span class="text-muted-foreground">{show.vote_count.toLocaleString()} votes</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{formatYear(show.first_air_date)}</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{show.number_of_episodes} Episodes</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span class="px-2 py-0.5 rounded text-xs font-medium {show.status === 'Returning Series' ? 'bg-green-500/20 text-green-400' : show.status === 'Ended' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">
            {show.status}
          </span>
        </div>

        <!-- Genres -->
        <div class="flex flex-wrap gap-2">
          {#each show.genres as genre}
            <a href="/tv?genre={genre.id}" class="px-3 py-1 rounded-full text-xs font-medium border border-border/50 bg-secondary/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
              {genre.name}
            </a>
          {/each}
        </div>

        <!-- Overview -->
        <div>
          <h2 class="text-lg font-semibold mb-2">Overview</h2>
          <p class="text-muted-foreground leading-relaxed max-w-3xl">{show.overview}</p>
        </div>

        <!-- Creators -->
        {#if creators.length > 0}
          <div class="flex flex-wrap gap-6 text-sm">
            {#each creators as creator}
              <div>
                <p class="text-muted-foreground">Creator</p>
                <p class="font-semibold">{creator.name}</p>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Networks -->
        {#if show.networks && show.networks.length > 0}
          <div class="flex items-center gap-3">
            <span class="text-sm text-muted-foreground">Networks:</span>
            <div class="flex items-center gap-2">
              {#each show.networks as network}
                {#if network.logo_path}
                  <img src={getImageUrl(network.logo_path, 'w92')} alt={network.name} class="h-6 object-contain opacity-70" title={network.name} />
                {:else}
                  <span class="text-sm font-medium">{network.name}</span>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          {#if trailer}
            <button type="button" onclick={() => openTrailer()}
              class="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-600/25">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Watch Trailer
            </button>
          {/if}
          <button type="button" onclick={handleToggleFavorite}
            class="px-6 py-3 rounded-xl border font-semibold transition-all flex items-center gap-2
              {isFav ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' : 'border-border hover:bg-accent'}">
            <svg class="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isFav ? 'Remove Favorite' : 'Add to Favorites'}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Content Below Hero -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">

    <!-- Seasons -->
    {#if show.seasons && show.seasons.length > 0}
      <section>
        <SectionHeader title="Seasons" subtitle="{show.number_of_seasons} seasons" />
        <div class="flex gap-2 mb-6 overflow-x-auto pb-2" style="scrollbar-width: none;">
          {#each show.seasons as season, i}
            <button type="button" onclick={() => (selectedSeason = i)}
              class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                {selectedSeason === i ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border hover:bg-accent'}">
              {season.name}
            </button>
          {/each}
        </div>
        {#if show.seasons[selectedSeason]}
          {@const season = show.seasons[selectedSeason]}
          <div class="flex gap-6 p-6 rounded-xl border border-border/50 bg-card">
            {#if season.poster_path}
              <img src={getImageUrl(season.poster_path, 'w185')} alt={season.name}
                class="w-32 rounded-lg shadow-lg hidden sm:block" />
            {/if}
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-1">{season.name}</h3>
              <div class="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                {#if season.air_date}
                  <span>{formatYear(season.air_date)}</span>
                  <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
                {/if}
                <span>{season.episode_count} Episodes</span>
                {#if season.vote_average > 0}
                  <span class="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span class="{getRatingColor(season.vote_average)}">★ {formatVoteAverage(season.vote_average)}</span>
                {/if}
              </div>
              <p class="text-muted-foreground text-sm leading-relaxed">
                {season.overview || `Season ${season.season_number} of ${show.name}.`}
              </p>
            </div>
          </div>
        {/if}
      </section>
    {/if}

    <!-- Cast -->
    {#if credits && credits.cast.length > 0}
      <section>
        <SectionHeader title="Top Cast" subtitle="{credits.cast.length} cast members" />
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {#each displayCast as person (person.id)}
            <div class="group text-center">
              <div class="aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-2">
                <img src={getImageUrl(person.profile_path, 'w185')} alt={person.name} loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p class="text-sm font-semibold line-clamp-1">{person.name}</p>
              <p class="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
            </div>
          {/each}
        </div>
        {#if credits.cast.length > 12}
          <div class="text-center mt-6">
            <button type="button" onclick={() => (showAllCast = !showAllCast)}
              class="px-6 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              {showAllCast ? 'Show Less' : `Show All ${credits.cast.length} Cast Members`}
            </button>
          </div>
        {/if}
      </section>
    {/if}

    <!-- Videos -->
    {#if videos.length > 0}
      <section>
        <SectionHeader title="Videos" subtitle="{videos.length} videos available" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each videos.slice(0, 6) as video (video.id)}
            <button type="button" onclick={() => openTrailer(video)}
              class="group relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
              <img src="https://img.youtube.com/vi/{video.key}/hqdefault.jpg" alt={video.name} loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div class="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p class="text-white text-sm font-medium line-clamp-1">{video.name}</p>
                <p class="text-white/60 text-xs">{video.type}</p>
              </div>
            </button>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Reviews -->
    {#if reviews.length > 0}
      <section>
        <SectionHeader title="Reviews" subtitle="{reviews.length} user reviews" />
        <div class="space-y-4">
          {#each reviews.slice(0, 5) as review (review.id)}
            <div class="p-6 rounded-xl border border-border/50 bg-card">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-primary font-bold text-sm">{review.author.charAt(0).toUpperCase()}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <p class="font-semibold">{review.author}</p>
                    {#if review.author_details.rating}
                      <span class="px-2 py-0.5 rounded text-xs font-bold {getRatingBg(review.author_details.rating)}">
                        <span class="{getRatingColor(review.author_details.rating)}">★ {review.author_details.rating}</span>
                      </span>
                    {/if}
                    <span class="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <div class="text-sm text-muted-foreground leading-relaxed">
                    {#if expandedReview === review.id}
                      <p class="whitespace-pre-line">{review.content}</p>
                      <button type="button" onclick={() => (expandedReview = null)} class="text-primary text-xs mt-2 hover:underline">Show less</button>
                    {:else}
                      <p>{truncateText(review.content, 300)}</p>
                      {#if review.content.length > 300}
                        <button type="button" onclick={() => (expandedReview = review.id)} class="text-primary text-xs mt-2 hover:underline">Read more</button>
                      {/if}
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Similar -->
    {#if similar.length > 0}
      <section>
        <SectionHeader title="Similar TV Shows" />
        <HorizontalScroll items={similar} type="tv" />
      </section>
    {/if}

    <!-- Recommendations -->
    {#if recommendations.length > 0}
      <section>
        <SectionHeader title="Recommendations" subtitle="You might also enjoy" />
        <HorizontalScroll items={recommendations} type="tv" />
      </section>
    {/if}
  </div>

  <!-- Trailer Modal -->
  {#if showTrailer && selectedTrailer}
    <div class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Video player">
      <button type="button" onclick={() => (showTrailer = false)}
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        aria-label="Close trailer">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl">
        <iframe src={getTrailerUrl(selectedTrailer.key)} title={selectedTrailer.name}
          class="w-full h-full" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen />
      </div>
    </div>
  {/if}
{/if}
