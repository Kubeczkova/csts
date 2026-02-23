<script>
  const supporters = [
    { name: "Tea", icon: "☕" },
    { name: "Energy", icon: "⚡" }
  ];
</script>

<section class="support">
  <h3>Podpořte projekt</h3>

  <div class="grid">
    {#each supporters as s}
      <div class="item">
        <div class="icon">{s.icon}</div>
        <span>{s.name}</span>
      </div>
    {/each}
  </div>
</section>

