<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createSearchIndex, highlightParts, searchOptions } from '../../utils/search';
import type { SearchDocument } from '../../types/domain';

const props = defineProps<{
  labels: {
    dialog: string;
    heading: string;
    inputAria: string;
    placeholder: string;
    results: string;
    quickNav: string;
    loading: string;
    error: string;
    emptyTitle: string;
    emptyHint: string;
    resultsAria: string;
    navigate: string;
    open: string;
    brand: string;
  };
  typeLabels: Record<string, string>;
  quickLinks: SearchDocument[];
  indexUrl: string;
}>();

const dialog = ref<HTMLDialogElement>();
const input = ref<HTMLInputElement>();
const query = ref('');
const documents = ref<SearchDocument[]>([]);
const results = ref<SearchDocument[]>([]);
const activeIndex = ref(0);
const loading = ref(false);
const loadError = ref(false);
let opener: HTMLElement | null = null;
let index: ReturnType<typeof createSearchIndex> | undefined;

const visibleResults = computed(() => (query.value.trim() ? results.value : props.quickLinks));

async function loadIndex() {
  if (index || loading.value) return;
  loading.value = true;
  loadError.value = false;
  try {
    const response = await fetch(props.indexUrl);
    if (!response.ok) throw new Error('Search index unavailable');
    documents.value = await response.json();
    index = createSearchIndex(documents.value);
    search();
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function search() {
  results.value =
    query.value.trim() && index
      ? (index.search(query.value, searchOptions).slice(0, 8) as unknown as SearchDocument[])
      : [];
  activeIndex.value = 0;
}

async function open() {
  if (dialog.value?.open) return;
  opener = document.activeElement as HTMLElement;
  dialog.value?.showModal();
  document.body.style.overflow = 'hidden';
  await nextTick();
  input.value?.focus();
  void loadIndex();
}

function close() {
  dialog.value?.close();
}
function onClose() {
  document.body.style.overflow = '';
  query.value = '';
  results.value = [];
  opener?.focus();
}
function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.value?.open) close();
    else open();
  }
}
function navigateResults(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (!visibleResults.value.length) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % visibleResults.value.length;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value =
      (activeIndex.value - 1 + visibleResults.value.length) % visibleResults.value.length;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    go(visibleResults.value[activeIndex.value]);
  }
}
function go(item?: SearchDocument) {
  if (item) window.location.href = item.url;
}
function backdrop(event: MouseEvent) {
  if (event.target === dialog.value) close();
}
watch(query, search);
onMounted(() => window.addEventListener('keydown', onKeydown));
onMounted(() => window.addEventListener('z:command-open', open));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('z:command-open', open);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="command-root">
    <Teleport to="body">
      <dialog
        ref="dialog"
        class="command-dialog"
        :aria-label="labels.dialog"
        @close="onClose"
        @click="backdrop"
      >
        <div class="command-panel" @keydown="navigateResults">
          <h2 class="sr-only">{{ labels.heading }}</h2>
          <div class="command-input">
            <svg
              width="20"
              height="20"
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
              ref="input"
              v-model="query"
              type="search"
              role="combobox"
              :aria-label="labels.inputAria"
              aria-controls="command-results"
              aria-expanded="true"
              :aria-activedescendant="
                visibleResults.length ? `command-option-${activeIndex}` : undefined
              "
              :placeholder="labels.placeholder"
              autocomplete="off"
            />
            <kbd>ESC</kbd>
          </div>
          <div class="command-meta">
            <span>{{ query ? labels.results : labels.quickNav }}</span><span>Z OS</span>
          </div>
          <div v-if="loading" class="command-message">{{ labels.loading }}</div>
          <div v-else-if="loadError" class="command-message">
            {{ labels.error }}
          </div>
          <div v-else-if="query && !visibleResults.length" class="command-message">
            <strong>{{ labels.emptyTitle }}</strong><span>{{ labels.emptyHint }}</span>
          </div>
          <ul v-else id="command-results" role="listbox" :aria-label="labels.resultsAria">
            <li
              v-for="(item, itemIndex) in visibleResults"
              :id="`command-option-${itemIndex}`"
              :key="item.id"
              role="option"
              :aria-selected="activeIndex === itemIndex"
              :class="{ active: activeIndex === itemIndex }"
              @mouseenter="activeIndex = itemIndex"
              @mousedown.prevent
              @click="go(item)"
            >
              <span class="result-type">{{ typeLabels[item.type] ?? item.type }}</span>
              <span class="result-copy"
                ><strong
                  ><span
                    v-for="(part, partIndex) in highlightParts(item.title, query)"
                    :key="partIndex"
                    ><mark v-if="part.match">{{ part.text }}</mark
                    ><template v-else>{{ part.text }}</template></span
                  ></strong
                ><small
                  ><span
                    v-for="(part, partIndex) in highlightParts(item.description, query)"
                    :key="partIndex"
                    ><mark v-if="part.match">{{ part.text }}</mark
                    ><template v-else>{{ part.text }}</template></span
                  ></small
                ></span
              >
              <span class="result-arrow">↗</span>
            </li>
          </ul>
          <div class="command-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> {{ labels.navigate }}</span
            ><span><kbd>↵</kbd> {{ labels.open }}</span
            ><span class="command-brand">{{ labels.brand }}</span>
          </div>
        </div>
      </dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.command-root {
  display: contents;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.command-dialog {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: min(14vh, 8rem) 1rem 1rem;
  border: 0;
  background: transparent;
  color: var(--z-text);
}
.command-dialog::backdrop {
  background: rgba(10, 9, 7, 0.72);
}
.command-panel {
  width: min(640px, 100%);
  margin: auto;
  overflow: hidden;
  border: 1px solid var(--z-border-strong);
  border-radius: var(--z-radius);
  background: var(--z-surface);
}
.command-input {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.05rem 1.25rem;
  border-bottom: 1px solid var(--z-border);
  color: var(--z-primary);
}
.command-input input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--z-text);
  font-family: var(--font-body);
  font-size: 1rem;
}
kbd {
  display: inline-flex;
  padding: 0.1rem 0.36rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: var(--z-bg);
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.62rem;
}
.command-meta {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 1.25rem 0.35rem;
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.62rem;
  letter-spacing: 0.09em;
}
ul {
  max-height: min(48vh, 380px);
  margin: 0;
  padding: 0.5rem;
  overflow-y: auto;
  list-style: none;
}
li {
  display: grid;
  grid-template-columns: 5.2rem 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.78rem;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}
li.active {
  border-color: var(--z-border-strong);
  background: var(--z-surface-raised);
  box-shadow: inset 2px 0 0 var(--z-primary);
}
.result-type {
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.result-copy {
  display: grid;
  min-width: 0;
}
.result-copy strong {
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 580;
  letter-spacing: -0.015em;
}
mark {
  padding: 0;
  border-bottom: 1px solid var(--z-primary);
  background: transparent;
  color: var(--z-primary);
  box-decoration-break: clone;
}
.result-copy small {
  overflow: hidden;
  color: var(--z-text-muted);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-arrow {
  color: var(--z-text-muted);
}
li.active .result-arrow {
  color: var(--z-primary);
}
.command-message {
  display: grid;
  gap: 0.3rem;
  padding: 2.5rem 1.5rem;
  color: var(--z-text-muted);
  text-align: center;
  font-size: 0.8rem;
}
.command-message strong {
  color: var(--z-text);
}
.command-footer {
  display: flex;
  gap: 1rem;
  padding: 0.7rem 1.25rem;
  border-top: 1px solid var(--z-border);
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.64rem;
}
.command-footer span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.command-brand {
  margin-left: auto;
}
@media (max-width: 500px) {
  .command-dialog {
    padding-top: 4rem;
  }
  .result-type {
    display: none;
  }
  li {
    grid-template-columns: 1fr auto;
  }
  .command-brand {
    display: none !important;
  }
}
</style>
