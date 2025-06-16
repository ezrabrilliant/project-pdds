// Utility function to handle genres that can be either string or array
export const parseGenres = (genres: any): string[] => {
  if (typeof genres === 'string') {
    return genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
  } else if (Array.isArray(genres)) {
    return genres;
  }
  return [];
};

// Utility function to render genre tags
export const renderGenres = (genres: any, maxCount: number = 2, className: string = '') => {
  const genreArray = parseGenres(genres);
  const displayGenres = genreArray.slice(0, maxCount);
  const remainingCount = genreArray.length - maxCount;
  
  return (
    <>
      {displayGenres.map((genre: string, index: number) => (
        <span key={index} className={className}>
          {genre}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className={className}>
          +{remainingCount}
        </span>
      )}
    </>
  );
};
