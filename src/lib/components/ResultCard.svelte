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

  <div class="placement">
    <a href="{url}">{placement}.</a>
  </div>
</div>

