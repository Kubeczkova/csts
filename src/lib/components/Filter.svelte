<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  export let clubs: string[] = [];
  export let urlClub: string = '';

  const dispatch = createEventDispatcher();

  const timeOptions = [
    { value: 'week', label: 'Posledních 7 dní', locked: false },
    { value: 'month', label: 'Tento měsíc', locked: true },
    { value: 'last-month', label: 'Posledních 30 dní', locked: true },
  ];

  let selectedClub = urlClub;
  let selectedTime = 'week';
  let isLoading = false;
  let hasInitialLoad = false;

  $: if (browser && !hasInitialLoad && urlClub) {
    hasInitialLoad = true;
    handleFilterChange();
  }

  async function handleFilterChange() {
    if (!browser) return;

    if (!selectedClub) {
      dispatch('resultsUpdated', {
        results: [],
        filters: { time: selectedTime, club: null }
      });
      return;
    }

    isLoading = true;

    try {
      await goto(`?club=${encodeURIComponent(selectedClub)}`, { replaceState: true, keepFocus: true });

      const params = new URLSearchParams();
      params.set('time', selectedTime);
      params.set('club', selectedClub);


      const response = await fetch(`/api/results?${params.toString()}`);
      const data = await response.json();

      console.log('Filter API response:', data);

      if (data.results !== undefined) {
        dispatch('resultsUpdated', {
          results: data.results,
          filters: data.filters
        });
      } else if (data.error) {
        console.error('Failed to fetch results:', data.error);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      isLoading = false;
    }
  }

  function submit() {
    handleFilterChange();
  }

  function handleTimeChange() {
    const option = timeOptions.find(opt => opt.value === selectedTime);
    if (option?.locked) {
      selectedTime = 'week';
    }
  }
</script>

<div class="filter">
  {#if !selectedClub && !isLoading}
    <div class="no-club-message">
      Prosím vyber klub
    </div>
  {/if}
  <label for="club-select">Vyber taneční klub</label>
  <select id="club-select" bind:value={selectedClub}>
    <option value="">-- Vyberte klub --</option>
    {#each clubs as club}
      <option value={club}>{club}</option>
    {/each}
  </select>

  <label for="time-select">Vyber časový interval</label>
  <select id="time-select" bind:value={selectedTime} on:change={handleTimeChange}>
    {#each timeOptions as option}
      <option value={option.value} disabled={option.locked}>
        {option.label} {option.locked ? '🔒' : ''}
      </option>
    {/each}
  </select>

  <button on:click={submit} disabled={isLoading || !selectedClub}>
    {#if isLoading}
      Načítání...
    {:else}
      Zobraz výsledky
    {/if}
  </button>
</div>

