<script lang="ts">
  import Filter from "$lib/components/Filter.svelte";
  import Results from "$lib/components/Results.svelte";
  import Support from "$lib/components/Support.svelte";

  export let data;

  let clubs = data.clubs || [];
  let currentResults = data.initialResults || [];
  let currentFilters = data.initialFilters || { time: 'week', club: null };
  let urlClub = data.urlClub || '';

  // Debug logging
  $: console.log('Current results:', currentResults.length, 'events');
  $: console.log('Current filters:', currentFilters);
  $: console.log('Clubs:', clubs.length);

  function handleResultsUpdate(event: CustomEvent) {
    const { results, filters } = event.detail;
    currentResults = results;
    currentFilters = filters;
    console.log('Results updated:', results.length, 'events');
  }
</script>

<Filter {clubs} {urlClub} on:resultsUpdated={handleResultsUpdate} />
{#if currentFilters.club}
  <Results results={currentResults} />
{/if}

<section class="project">
  <h3>O projektu</h3>
  <p>
    Tohle je fanouškovský projekt, bez reklam a bez přihlášení. Není to oficiální nástroj ČSTS. Pokud vám pomáhá a šetří čas, budu rád za symbolické poděkování v podobě čaje nebo oběda.
    Na větší spolupráci nebo vlastní řešení jsem na <a href="becrew.cz">becrew.cz</a>.
  </p>
</section>

<Support />

