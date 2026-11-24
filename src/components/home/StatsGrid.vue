<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
const props = defineProps<{ stats: Array<{ value: number; label: string; detail: string }> }>();
const root = ref<HTMLElement>();
const display = ref(props.stats.map((stat) => stat.value));
let observer: IntersectionObserver | undefined;
let frame = 0;

function animate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min((now - start) / 750, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    display.value = props.stats.map((stat) => Math.round(stat.value * eased));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  display.value = props.stats.map(() => 0);
  frame = requestAnimationFrame(tick);
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        animate();
        observer?.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  if (root.value) observer.observe(root.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<template>
  <section ref="root" class="stats" aria-label="Project statistics">
    <div v-for="(stat, index) in stats" :key="stat.label" class="stat">
      <strong>{{ String(display[index]).padStart(2, '0') }}</strong>
      <div>
        <span>{{ stat.label }}</span><small>{{ stat.detail }}</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block: 1px solid var(--z-border);
}
.stat {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.4rem clamp(1rem, 3vw, 2rem);
  border-right: 1px solid var(--z-border);
}
.stat:last-child {
  border: 0;
}
strong {
  color: var(--z-text);
  font-size: 1.7rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.stat div {
  display: grid;
}
span {
  color: var(--z-text-secondary);
  font-size: 0.75rem;
}
small {
  color: var(--z-text-muted);
  font-size: 0.64rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
@media (max-width: 700px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .stat:nth-child(2) {
    border-right: 0;
  }
  .stat:nth-child(-n + 2) {
    border-bottom: 1px solid var(--z-border);
  }
  .stat {
    padding: 1.2rem 0.5rem;
  }
  strong {
    font-size: 1.5rem;
  }
}
</style>
