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
    }

    return {
      clubs: clubsData.clubs || [],
      initialResults: resultsData.results || [],
      initialFilters: resultsData.filters || { time: 'week', club: clubParam },
      urlClub: clubParam || ''
    };
  } catch (error) {
    return {
      clubs: [],
      initialResults: [],
      initialFilters: { time: 'week', club: null },
      urlClub: ''
    };
  }
};
