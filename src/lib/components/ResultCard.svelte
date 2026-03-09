<script lang="ts">
  export let names: string;
  export let placement: string;
  export let url: string;
  export let highlight: string = '';
</script>

<div class="card {highlight}">
  <div class="info">
    <h4>{names}</h4>
  </div>

  <a href="{url}" class="medal" aria-label="Výsledek – místo {placement}">
    <span class="medal-rank">{placement}</span>
  </a>
</div>

