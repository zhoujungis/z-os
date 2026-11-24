<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createSearchIndex, highlightParts, searchOptions } from '../../utils/search';
import type { SearchDocument } from '../../types/domain';

const props = defineProps<{
  labels: {
    searchSite: string;
    placeholder: string;
    resultsSuffix: string;
    indexUnavailable: string;
    loadingIndex: string;
    ready: string;
    matches: string;
    idle: string;
    browserOnly: string;
    loading: string;
    failedBefore: string;
    failedLink: string;
    failedAfter: string;
    introTitle: string;
    introBody: string;
    try: string;
    noResultsBefore: string;
    noResultsAfter: string;
    noResultsBody: string;
    browse: string;
    openPrefix: string;
    typeProject: string;
    typeLab: string;
    typeTool: string;
    typePage: string;
    typeActivity: string;
  };
  suggestions: string[];
  indexUrl: string;
  projectsHref: string;
}>();

const query = ref('');
const results = ref<SearchDocument[]>([]);
const loading = ref(false);
const loaded = ref(false);
const failed = ref(false);
let index: ReturnType<typeof createSearchIndex>;

const typeLabels: Record<SearchDocument['type'], string> = {
  project: props.labels.typeProject,
  lab: props.labels.typeLab,
  tool: props.labels.typeTool,
  page: props.labels.typePage,
  activity: props.labels.typeActivity,
};

function runSearch() {
  results.value =
    query.value.trim() && index
      ? (index.search(query.value, searchOptions).slice(0, 30) as unknown as SearchDocument[])
      : [];
  const params = new URLSearchParams(location.search);
  if (query.value) params.set('q', query.value);
  else params.delete('q');
  history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
}

function applyQuery(value: string) {
  query.value = value;
  runSearch();
}

onMounted(async () => {
  query.value = new URLSearchParams(location.search).get('q') ?? '';
  loading.value = true;
  try {
    const response = await fetch(props.indexUrl);
    if (!response.ok) throw new Error('Unavailable');
    index = createSearchIndex(await response.json());
    loaded.value = true;
    runSearch();
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="search-page">
    <label class="search-box">
      <svg
        class="search-icon"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m20 20-3.6-3.6"></path>
      </svg>
      <span class="sr-only">{{ labels.searchSite }}</span>
      <input
        v-model="query"
        type="search"
        :placeholder="labels.placeholder"
        autofocus
        @input="runSearch"
      />
      <kbd v-if="loaded" aria-hidden="true">{{ results.length }} {{ labels.resultsSuffix }}</kbd>
    </label>

    <div class="search-meta mono">
      <span aria-live="polite">
        {{
          failed
            ? labels.indexUnavailable
            : loading
              ? labels.loadingIndex
              : loaded
                ? `${labels.ready} · ${results.length} ${labels.matches}`
                : labels.idle
        }}
      </span>
      <span>{{ labels.browserOnly }}</span>
    </div>

    <p v-if="loading" class="search-state">{{ labels.loading }}</p>
    <p v-else-if="failed" class="search-state">
      {{ labels.failedBefore }}
      <a :href="projectsHref">{{ labels.failedLink }}</a>{{ labels.failedAfter }}
    </p>
    <div v-else-if="!query" class="search-state search-intro">
      <h2>{{ labels.introTitle }}</h2>
      <p>{{ labels.introBody }}</p>
      <div class="search-suggestions">
        <span class="mono">{{ labels.try }}</span>
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          @click="applyQuery(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
    <div v-else-if="loaded && !results.length" class="search-state">
      <h2>{{ labels.noResultsBefore }}{{ query }}{{ labels.noResultsAfter }}</h2>
      <p>{{ labels.noResultsBody }}</p>
      <a class="button button-secondary" :href="projectsHref">{{ labels.browse }}</a>
    </div>
    <ol v-else class="search-results">
      <li v-for="item in results" :key="item.id">
        <span class="result-type" :class="`type-${item.type}`">
          <i aria-hidden="true"></i>
          {{ typeLabels[item.type] }}
        </span>
        <div class="result-main">
          <h2>
            <a :href="item.url"
              ><span v-for="(part, partIndex) in highlightParts(item.title, query)" :key="partIndex"
                ><mark v-if="part.match">{{ part.text }}</mark
                ><template v-else>{{ part.text }}</template></span
              ></a
            >
          </h2>
          <p>
            <span
              v-for="(part, partIndex) in highlightParts(item.description, query)"
              :key="partIndex"
              ><mark v-if="part.match">{{ part.text }}</mark
              ><template v-else>{{ part.text }}</template></span
            >
          </p>
          <small>{{ item.url }}</small>
        </div>
        <a :href="item.url" class="result-open" :aria-label="`${labels.openPrefix} ${item.title}`">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M7 7h10v10"></path>
          </svg>
        </a>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.55rem 0.65rem 0.55rem 1.2rem;
  border: 1px solid var(--z-border-strong);
  border-radius: var(--z-radius);
  background: var(--z-surface);
  transition: border-color 200ms ease;
}
.search-box:focus-within {
  border-color: var(--z-primary);
}
.search-icon {
  flex: none;
  color: var(--z-text-muted);
}
input {
  min-width: 0;
  height: 3.4rem;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--z-text);
  font-family: var(--font-body);
  font-size: 1rem;
}
input::placeholder {
  color: var(--z-text-muted);
  opacity: 0.8;
}
kbd {
  padding: 0.32rem 0.55rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: var(--z-surface-raised);
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.6rem;
  white-space: nowrap;
}
.search-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-inline: 0.4rem;
  color: var(--z-text-muted);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}
.search-state {
  padding: 4rem 1rem;
  color: var(--z-text-muted);
  text-align: center;
}
.search-state h2 {
  margin: 0 0 0.6rem;
  color: var(--z-text);
  font-size: 1.55rem;
}
.search-state p {
  max-width: 540px;
  margin: 0 auto 1.25rem;
  font-size: 0.9rem;
  line-height: 1.8;
}
.search-state a {
  color: var(--z-primary);
}
.search-intro {
  padding-top: 3.25rem;
}
.search-suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.45rem;
}
.search-suggestions .mono {
  margin-right: 0.25rem;
  color: var(--z-text-muted);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
}
.search-suggestions button {
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: transparent;
  color: var(--z-text-secondary);
  cursor: pointer;
  font-size: 0.74rem;
  transition:
    border-color 180ms ease,
    color 180ms ease;
}
.search-suggestions button:hover {
  border-color: var(--z-primary);
  color: var(--z-primary);
}
.search-results {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--z-border);
}
.search-results li {
  display: grid;
  grid-template-columns: 7.5rem minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: start;
  padding: 1.4rem 0.5rem;
  border-bottom: 1px solid var(--z-border);
  border-radius: var(--z-radius-sm);
  transition: background 180ms ease;
}
.search-results li:hover {
  background: var(--z-surface-soft);
}
.result-type {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding-top: 0.3rem;
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.62rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.result-type i {
  width: 0.4rem;
  height: 0.4rem;
  flex: none;
  border-radius: 1px;
  background: var(--z-text-muted);
}
.type-project i {
  background: var(--z-primary);
}
.type-tool i {
  background: var(--z-halo);
}
.type-activity i {
  background: var(--z-accent);
}
.type-page i {
  background: var(--z-warm);
}
.result-main {
  min-width: 0;
}
h2 {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}
h2 a:hover {
  color: var(--z-primary);
}
mark {
  padding: 0;
  border-bottom: 1px solid var(--z-primary);
  background: transparent;
  color: var(--z-primary);
  box-decoration-break: clone;
}
p {
  margin: 0.35rem 0 0.45rem;
  color: var(--z-text-muted);
  font-size: 0.88rem;
  line-height: 1.7;
}
small {
  display: block;
  overflow: hidden;
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.8;
}
.result-open {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  color: var(--z-text-muted);
  transition:
    color 180ms ease,
    border-color 180ms ease;
}
.result-open:hover {
  border-color: var(--z-primary);
  color: var(--z-primary);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .search-results li {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.35rem 1rem;
  }
  .result-type {
    grid-column: 1 / -1;
    padding-top: 0;
  }
  .result-open {
    grid-column: 2;
    grid-row: 2 / span 2;
  }
  kbd {
    display: none;
  }
  .search-meta span:last-child {
    display: none;
  }
}
</style>
