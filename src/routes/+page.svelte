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

<h1>Taneční výsledky</h1>

<Filter {clubs} {urlClub} on:resultsUpdated={handleResultsUpdate} />

{#if currentFilters.club}
  <Results results={currentResults} />
{/if}

<section>
  <h2>Jak to funguje</h2>
  <p>
    Každé pondělí stáhne aktuální data z <a href="https://csts.cz">csts.cz</a> a zobrazí páry
    z jednoho klubu. Následně při rozkliknutí medaile se dostanete na oficiální výsledky.
  </p>
</section>

<section>
  <h2>O projektu</h2>
  <p>
    Nejedná se o oficiální nástroj ČSTS, je to pouze fanouškovský projekt,
    který umožňuje lepší vyhledávání výsledků podle klubů.
    Pokud vás projekt zaujal, nebo alespoň jeho zpracování, můžete se ozvat
    autorům tohoto webu na <a href="https://www.becrew.cz/tanec">becrew.cz</a>.
  </p>
</section>

<section>
  <h2>Podpořte projekt</h2>
  <p>
    Pokud vám projekt pomáhá nebo šetří čas, budeme rádi za symbolické
    poděkování v podobě ☕ čaje nebo 🍽️ oběda.
  </p>
  <Support />
</section>