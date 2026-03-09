<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  // Czech bank account — replace IBAN/account with real one
  const IBAN = 'CZ8962106701002214830754';
  const BIC = 'BREXCZPP';
  const MESSAGE = 'Taneční výsledky - Podpora';

  const supporters = [
    { name: 'Čaj', icon: '☕', price: 66 },
    { name: 'Oběd', icon: '🍽️', price: 222 }
  ];

  let canvases: (HTMLCanvasElement | null)[] = supporters.map(() => null);

  function buildSPD(iban: string, bic: string, amount: number, message: string): string {
    return [
      'SPD*1.0',
      `ACC:${iban}+${bic}`,
      `AM:${amount.toFixed(2)}`,
      'CC:CZK',
      `MSG:${message}`,
      `RN:Taneční výsledky`
    ].join('*');
  }

  async function drawQR(canvas: HTMLCanvasElement, s: { icon: string; price: number }) {
    const spd = buildSPD(IBAN, BIC, s.price, MESSAGE);

    await QRCode.toCanvas(canvas, spd, {
      width: 190,
      margin: 2,
      color: {
        dark: '#150d25',
        light: '#ede8dc'
      },
      errorCorrectionLevel: 'H'
    });

    // Draw emoji in the center
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const fontSize = Math.round(size * 0.16);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // White backing circle so QR is readable around icon
    const r = fontSize * 0.72;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size * 0.12), 0, Math.PI * 2);
    // ctx.fillStyle = '#ede8dc';
    ctx.fill();

    ctx.fillText(s.icon, size / 2, size / 2);
  }

  onMount(() => {
    supporters.forEach((s, i) => {
      const canvas = canvases[i];
      if (canvas) drawQR(canvas, s);
    });
  });
</script>

<section class="support">
  <h3>Podpořte projekt</h3>

  <p>Pokud vám projekt pomáhá a šetří čas, budeme rádi za symbolické poděkování v podobě ☕ čaje nebo 🍽️ oběda.</p>

  <div class="grid">
    {#each supporters as s, i}
      <div class="item">
        <div class="qr-wrap">
          <canvas bind:this={canvases[i]}></canvas>
        </div>
      </div>
    {/each}
  </div>
</section>

