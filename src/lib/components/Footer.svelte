<footer class="border-t border-border/50 bg-card/50 mt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="md:col-span-1">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span class="text-xl font-bold gradient-text">CineVerse</span>
        </div>
        <p class="text-sm text-muted-foreground">
          Discover and explore your favorite movies and TV shows. Powered by TMDB.
        </p>
      </div>

      <!-- Navigation -->
      <div>
        <h3 class="font-semibold mb-3">Explore</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li><a href="/movies" class="hover:text-foreground transition-colors">Movies</a></li>
          <li><a href="/tv" class="hover:text-foreground transition-colors">TV Shows</a></li>
          <li><a href="/browse" class="hover:text-foreground transition-colors">Browse Genres</a></li>
          <li><a href="/favorites" class="hover:text-foreground transition-colors">My Favorites</a></li>
        </ul>
      </div>

      <!-- Categories -->
      <div>
        <h3 class="font-semibold mb-3">Categories</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li><a href="/movies?genre=28" class="hover:text-foreground transition-colors">Action</a></li>
          <li><a href="/movies?genre=35" class="hover:text-foreground transition-colors">Comedy</a></li>
          <li><a href="/movies?genre=18" class="hover:text-foreground transition-colors">Drama</a></li>
          <li><a href="/movies?genre=27" class="hover:text-foreground transition-colors">Horror</a></li>
        </ul>
      </div>

      <!-- Info -->
      <div>
        <h3 class="font-semibold mb-3">Information</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li><a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors">TMDB API</a></li>
          <li><span>Built with SvelteKit</span></li>
          <li><span>Styled with Tailwind CSS</span></li>
        </ul>
      </div>
    </div>

    <div class="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p class="text-xs text-muted-foreground">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
      <div class="flex items-center gap-2">
        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB Logo" class="h-4 opacity-60" />
      </div>
    </div>
  </div>
</footer>