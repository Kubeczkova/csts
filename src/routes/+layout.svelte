<script>
  import '../app.css';
</script>

<div class="app">
  <slot />
    <a href="https://becrew.cz" target="_blank" rel="noopener noreferrer" class="footer-right">
      <span class="t top">Beeebooo</span>
      <span class="t bottom">Crew</span>
      <img src="/favicon.svg" alt="Beeebooo Crew" />
  </a>
</div>

<style>
  .footer-right {
      display: grid;
      grid-template-columns: auto max-content;
      grid-template-rows: 1fr 1fr;
      column-gap: 0.5rem;
      margin-top: 2rem;
      margin-left: auto;
      width: fit-content;
      text-decoration: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .footer-right:hover {
      opacity: 0.8;
      transform: translateY(-2px);
  }

  .footer-right img {
      grid-column: 2;
      grid-row: 1 / span 2;
      width: 3.5rem;
      height: 3.5rem;
      object-fit: contain;
      padding: 0.25rem;
      background-color: white;
      border-radius: 2rem;
  }

  .footer-right .t {
      grid-column: 1;
      text-align: right;
      color: var(--color-text);
      font-weight: 600;
      line-height: 1;
      font-size: 0.9rem;
  }

  .footer-right .top {
      grid-row: 1;
      align-self: end;
  }

  .footer-right .bottom {
      grid-row: 2;
      align-self: start;
  }
</style>
