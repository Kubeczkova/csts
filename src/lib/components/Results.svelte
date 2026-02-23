<script lang="ts">
  import ResultCard from "./ResultCard.svelte";
  import type { EventResult } from "$lib/types";

  export let results: EventResult[] = [];
</script>

<section class="results">
  {#if results.length === 0}
    <div class="empty-state">
      <p>Žádné výsledky k zobrazení</p>
      <p class="hint">Zkuste změnit filtr nebo zkontrolovat, zda jsou v databázi data.</p>
    </div>
  {:else}
    {#each results as event}
      <div class="event">
        <h2 class="event-title">{event.title}</h2>
        <p class="event-date">{new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        {#each event.competitions as competition}
          <div class="competition">
            <h3 class="competition-title">
              {#if competition.discipline}{competition.discipline}{/if}
              {#if competition.age} • {competition.age}{/if}
              {#if competition.from_class} • Třída {competition.from_class}{/if}
            </h3>

            {#each competition.participants as participant}
              <ResultCard
                names={participant.names}
                placement={participant.placement}
                url={participant.url}
                highlight="{participant.highlight}"
              />
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</section>

