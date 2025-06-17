// Fix untuk Movies.tsx dan TVShows.tsx
// Masalah:
// 1. Rating filter menggunakan content rating (G, PG, PG-13) - tidak ada di database
// 2. Sort by 'rating' tidak bekerja - perlu pakai 'vote_average'
// 3. sortOrder logic tidak tepat

console.log('🔧 Fixing Movies and TVShows page rating filter and sort by...');

// PERBAIKAN YANG DIPERLUKAN:

// 1. Update sortBy type dan options
// 2. Fix rating filter menggunakan vote_average ranges
// 3. Fix sortOrder logic
// 4. Update sort options labels

export const fixes = {
  movies: {
    // Fix 1: Update sortBy type
    sortByType: `'title' | 'release_year' | 'date_added' | 'vote_average' | 'popularity'`,
    
    // Fix 2: Update sort options
    sortOptions: [
      { value: 'date_added', label: 'Date Added (Latest)' },
      { value: 'title', label: 'Title A-Z' },
      { value: 'release_year', label: 'Year (Newest)' },
      { value: 'popularity', label: 'Popularity' }
    ],
    
    // Fix 3: Rating filter options (menggunakan vote_average ranges)
    ratingOptions: [
      { value: '9', label: '9.0+ ⭐ Excellent' },
      { value: '8', label: '8.0+ ⭐ Very Good' },
      { value: '7', label: '7.0+ ⭐ Good' },
      { value: '6', label: '6.0+ ⭐ Above Average' },
      { value: '5', label: '5.0+ ⭐ Average' },
      { value: '4', label: '4.0+ ⭐ Below Average' }
    ],
    
    // Fix 4: sortOrder logic
    sortOrderLogic: `
    const getSortOrder = (sortField: string): 'asc' | 'desc' => {
      switch(sortField) {
        case 'title': return 'asc';
        case 'date_added': return 'desc';
        case 'release_year': return 'desc';
        case 'vote_average': return 'desc';
        case 'popularity': return 'desc';
        default: return 'desc';
      }
    };
    `,
    
    // Fix 5: Update search params
    searchParamsUpdate: `
    const searchParams: any = {
      type: 'movies',
      page: 1,
      limit: 20,
      sortBy,
      sortOrder: getSortOrder(sortBy)
    };
    
    // Fix rating to use vote_average filter
    if (selectedRating) {
      searchParams.ratings = [parseInt(selectedRating)]; // Convert to number array
    }
    `
  },
  
  tvshows: {
    // Same fixes apply to TVShows.tsx
    // Copy dari movies fixes dengan perubahan type: 'tvshows'
  }
};

console.log('✅ Fix plan ready for implementation!');
