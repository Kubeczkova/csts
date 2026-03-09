<script lang="ts">
  import Filter from "$lib/components/Filter.svelte";
  import Results from "$lib/components/Results.svelte";
  import Support from "$lib/components/Support.svelte";

  export let data;

  let clubs = data.clubs || [];
  let currentResults = data.initialResults || [];
  let currentFilters = data.initialFilters || { time: 'week', club: null };
  let urlClub = data.urlClub || '';

  function handleResultsUpdate(event: CustomEvent) {
    const { results, filters } = event.detail;
    currentResults = results;
    currentFilters = filters;
  }
</script>

<Filter {clubs} {urlClub} on:resultsUpdated={handleResultsUpdate} />
{#if currentFilters.club}
  <Results results={currentResults} />
{/if}

<section class="project">
  <h3>O projektu</h3>
  <p>
    Tohle je fanouškovský projekt, bez reklam a bez přihlášení. Není to oficiální nástroj ČSTS.
    Na větší spolupráci nebo vlastní řešení jsme na <a href="becrew.cz">becrew.cz</a>.
  </p>
</section>

<Support />

