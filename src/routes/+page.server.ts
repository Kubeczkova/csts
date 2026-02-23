export const load = async ({ fetch, url }: { fetch: any; url: URL }) => {
  try {
    // Fetch clubs for the filter dropdown
    const clubsResponse = await fetch('/api/clubs');
    const clubsData = await clubsResponse.json();

    // Get club from URL params if present
    const clubParam = url.searchParams.get('club');

    let resultsData = { results: [], filters: { time: 'week', club: clubParam } };

    // Only fetch results if club is specified
    if (clubParam) {
      const resultsParams = new URLSearchParams();
      resultsParams.set('time', 'week');
      resultsParams.set('club', clubParam);

      const resultsResponse = await fetch(`/api/results?${resultsParams.toString()}`);
      resultsData = await resultsResponse.json();
      console.log('Loaded results:', resultsData.results?.length || 0, 'events');
    } else {
      console.log('No club selected, not loading results');
    }

    console.log('Loaded clubs:', clubsData.clubs?.length || 0, 'clubs');
    console.log('URL club param:', clubParam);

    return {
      clubs: clubsData.clubs || [],
      initialResults: resultsData.results || [],
      initialFilters: resultsData.filters || { time: 'week', club: clubParam },
      urlClub: clubParam || ''
    };
  } catch (error) {
    console.error('Error loading page data:', error);
    return {
      clubs: [],
      initialResults: [],
      initialFilters: { time: 'week', club: null },
      urlClub: ''
    };
  }
};
