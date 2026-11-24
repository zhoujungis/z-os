<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface FamilyOption {
  key: string;
  label: string;
  code: string;
  color: string;
  count: number;
}

const props = defineProps<{
  families: FamilyOption[];
  categories: string[];
  statuses: string[];
  statusLabels: Record<string, string>;
  technologies: string[];
  total: number;
  labels: {
    aria: string;
    search: string;
    placeholder: string;
    category: string;
    allCategories: string;
    status: string;
    allStatuses: string;
    technology: string;
    allTechnologies: string;
    reset: string;
    familyGroup: string;
    all: string;
    inView: string;
  };
}>();

const query = ref('');
const family = ref('');
const category = ref('');
const status = ref('');
const technology = ref('');
const count = ref(props.total);
const hasActiveFilters = computed(() =>
  Boolean(query.value || family.value || category.value || status.value || technology.value),
);
let emptyReset: HTMLButtonElement | null = null;

function handleEmptyReset() {
  reset();
}

function setFamily(key: string) {
  family.value = key;
  applyFilters();
}

function applyFilters(updateUrl = true) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-project-card]')];
  const needle = query.value.trim().toLowerCase();
  const previous = count.value;
  let visible = 0;
  for (const card of cards) {
    const matches =
      (!needle || card.dataset.name?.includes(needle)) &&
      (!family.value || card.dataset.series === family.value) &&
      (!category.value || card.dataset.category === category.value) &&
      (!status.value || card.dataset.status === status.value) &&
      (!technology.value || card.dataset.tech?.split('|').includes(technology.value));
    card.hidden = !matches;
    if (matches) visible++;
  }
  count.value = visible;
  const empty = document.querySelector<HTMLElement>('#project-empty');
  if (empty) empty.hidden = visible !== 0;
  if (updateUrl) {
    if (visible !== previous && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document
        .querySelector('#project-grid')
        ?.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    }
    const params = new URLSearchParams();
    if (query.value) params.set('q', query.value);
    if (family.value) params.set('family', family.value);
    if (category.value) params.set('category', category.value);
    if (status.value) params.set('status', status.value);
    if (technology.value) params.set('tech', technology.value);
    history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  }
}

function reset() {
  query.value = family.value = category.value = status.value = technology.value = '';
  applyFilters();
}

onMounted(() => {
  emptyReset = document.querySelector<HTMLButtonElement>('[data-project-reset]');
  emptyReset?.addEventListener('click', handleEmptyReset);
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') ?? '';
  family.value = props.families.some((item) => item.key === (params.get('family') ?? ''))
    ? params.get('family')!
    : '';
  category.value = props.categories.includes(params.get('category') ?? '')
    ? params.get('category')!
    : '';
  status.value = props.statuses.includes(params.get('status') ?? '') ? params.get('status')! : '';
  technology.value = props.technologies.includes(params.get('tech') ?? '')
    ? params.get('tech')!
    : '';
  applyFilters(false);
});

onBeforeUnmount(() => {
  emptyReset?.removeEventListener('click', handleEmptyReset);
});
</script>

<template>
  <section class="filters" :aria-label="labels.aria">
    <div class="filter-top">
      <label class="filter-search">
        <span>{{ labels.search }}</span>
        <span class="search-field">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
          <input
            v-model="query"
            type="search"
            :placeholder="labels.placeholder"
            @input="applyFilters()"
          />
        </span>
      </label>
      <label>
        <span>{{ labels.category }}</span>
        <select v-model="category" @change="applyFilters()">
          <option value="">{{ labels.allCategories }}</option>
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label>
        <span>{{ labels.status }}</span>
        <select v-model="status" @change="applyFilters()">
          <option value="">{{ labels.allStatuses }}</option>
          <option v-for="item in statuses" :key="item" :value="item">
            {{ statusLabels[item] ?? item }}
          </option>
        </select>
      </label>
      <label>
        <span>{{ labels.technology }}</span>
        <select v-model="technology" @change="applyFilters()">
          <option value="">{{ labels.allTechnologies }}</option>
          <option v-for="item in technologies" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <button type="button" class="reset" :disabled="!hasActiveFilters" @click="reset">
        {{ labels.reset }}
      </button>
    </div>
    <div class="filter-bottom">
      <div class="family-chips" role="group" :aria-label="labels.familyGroup">
        <button
          type="button"
          class="chip"
          :class="{ active: family === '' }"
          :aria-pressed="family === ''"
          @click="setFamily('')"
        >
          {{ labels.all }} <span>{{ total }}</span>
        </button>
        <button
          v-for="item in families"
          :key="item.key"
          type="button"
          class="chip"
          :class="{ active: family === item.key }"
          :style="`--chip-accent:${item.color}`"
          :aria-pressed="family === item.key"
          @click="setFamily(item.key)"
        >
          <i aria-hidden="true"></i>{{ item.label }} <span>{{ item.count }}</span>
        </button>
      </div>
      <p class="filter-count" aria-live="polite">
        <strong>{{ count }}</strong> {{ labels.inView }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
  padding: 1rem;
  border: 1px solid var(--z-border);
  border-radius: var(--z-radius);
  background: var(--z-surface);
}
.filter-top {
  display: grid;
  grid-template-columns: minmax(240px, 1.65fr) repeat(3, minmax(130px, 1fr)) auto;
  gap: 0.6rem;
  align-items: end;
}
label {
  display: grid;
  min-width: 0;
  gap: 0.38rem;
}
label > span:first-child {
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.66rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.search-field {
  display: flex;
  height: 2.75rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0 0.75rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: var(--z-surface-soft);
  color: var(--z-text-muted);
  transition: border-color 160ms ease;
}
.search-field:focus-within {
  border-color: var(--z-primary);
}
input,
select {
  width: 100%;
  height: 2.75rem;
  min-width: 0;
  padding: 0 0.7rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  outline: none;
  background: var(--z-surface-soft);
  color: var(--z-text);
  font-size: 0.83rem;
  transition: border-color 160ms ease;
}
.search-field input {
  height: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--z-text);
}
input:focus,
select:focus {
  border-color: var(--z-primary);
}
.search-field input:focus {
  border: 0;
}
.reset {
  min-height: 2.75rem;
  padding-inline: 0.9rem;
  border: 1px solid transparent;
  border-radius: 2px;
  background: transparent;
  color: var(--z-text-muted);
  cursor: pointer;
  font-size: 0.76rem;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    opacity 160ms ease;
}
.reset:not(:disabled) {
  border-color: var(--z-border);
  color: var(--z-text-secondary);
}
.reset:disabled {
  cursor: default;
  opacity: 0.42;
}
.reset:not(:disabled):hover {
  border-color: var(--z-border-strong);
  color: var(--z-text);
}
.filter-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--z-border);
}
.family-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.chip {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.42rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: transparent;
  color: var(--z-text-secondary);
  cursor: pointer;
  font-size: 0.74rem;
  line-height: 1.4;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}
.chip i {
  width: 0.34rem;
  height: 0.34rem;
  background: var(--chip-accent, var(--z-primary));
}
.chip span {
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.62rem;
}
.chip:hover {
  border-color: var(--z-border-strong);
}
.chip.active {
  border-color: color-mix(in srgb, var(--chip-accent, var(--z-primary)) 55%, var(--z-border));
  background: color-mix(in srgb, var(--chip-accent, var(--z-primary)) 8%, var(--z-surface-soft));
  color: var(--z-text);
}
.chip.active span {
  color: var(--z-text-secondary);
}
.filter-count {
  flex: none;
  margin: 0;
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.02em;
}
.filter-count strong {
  color: var(--z-primary);
  font-size: 0.82rem;
}
@media (max-width: 1000px) {
  .filter-top {
    grid-template-columns: 1fr 1fr;
  }
  .filter-search {
    grid-column: 1 / -1;
  }
}
@media (max-width: 700px) {
  .filter-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
  }
  .filter-count {
    align-self: flex-end;
  }
}
@media (max-width: 520px) {
  .filters {
    padding: 0.8rem;
  }
  .filter-top {
    gap: 0.55rem 0.5rem;
  }
  .reset {
    justify-self: stretch;
    border-color: var(--z-border);
  }
  .family-chips {
    gap: 0.3rem;
  }
  .chip {
    padding: 0.3rem 0.6rem;
  }
}
</style>
