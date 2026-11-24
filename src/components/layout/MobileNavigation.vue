<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
  items: Array<{ label: string; href: string }>;
  currentPath: string;
  github: string;
  labels: {
    open: string;
    dialog: string;
    close: string;
    nav: string;
    menu: string;
    note: string;
    stats: string;
  };
}>();

function isCurrent(href: string) {
  const path = props.currentPath;
  if (href === '/' || href === '/en') return path === href;
  return path === href || path.startsWith(`${href}/`);
}
const dialog = ref<HTMLDialogElement>();
const trigger = ref<HTMLButtonElement>();
const isOpen = ref(false);

async function openMenu() {
  dialog.value?.showModal();
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
  await nextTick();
  dialog.value?.querySelector('a')?.focus();
}

function closeMenu() {
  dialog.value?.close();
}

function onClose() {
  isOpen.value = false;
  document.body.style.overflow = '';
  trigger.value?.focus();
}

function backdropClick(event: MouseEvent) {
  const panel = dialog.value?.querySelector('.mobile-panel');
  if (!(event.target instanceof Node) || !panel?.contains(event.target)) closeMenu();
}

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="mobile-navigation">
    <button
      ref="trigger"
      class="icon-button mobile-trigger"
      type="button"
      :aria-label="labels.open"
      aria-haspopup="dialog"
      aria-controls="mobile-navigation-dialog"
      :aria-expanded="isOpen"
      @click="openMenu"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
    <dialog
      id="mobile-navigation-dialog"
      ref="dialog"
      class="mobile-dialog"
      :aria-label="labels.dialog"
      @close="onClose"
      @click="backdropClick"
    >
      <div class="mobile-panel">
        <div class="mobile-top">
          <span class="mono">{{ labels.menu }}</span><button
            class="icon-button"
            type="button"
            :aria-label="labels.close"
            @click="closeMenu"
          >
            ×
          </button>
        </div>
        <p class="mobile-note">{{ labels.note }}</p>
        <nav :aria-label="labels.nav">
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            :aria-current="isCurrent(item.href) ? 'page' : undefined"
            @click="closeMenu"
            >{{ item.label }}<span class="nav-arrow" aria-hidden="true">↗</span></a
          >
        </nav>
        <a class="mobile-github" :href="github" target="_blank" rel="noopener noreferrer"
          >GitHub <span>↗</span></a
        >
        <p class="mobile-foot mono">{{ labels.stats }}</p>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.mobile-navigation {
  display: contents;
}
.mobile-dialog:not([open]) {
  pointer-events: none;
}
.mobile-dialog {
  pointer-events: auto;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: var(--z-text);
}
.mobile-dialog::backdrop {
  background: rgba(10, 9, 7, 0.66);
}
.mobile-panel {
  pointer-events: auto;
  width: min(calc(100% - 1rem), 430px);
  margin-left: auto;
  padding: 1.1rem 1.35rem 1.5rem;
  border: 1px solid var(--z-border-strong);
  border-radius: 4px;
  background: var(--z-surface-solid);
}
.mobile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--z-text-muted);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
}
.mobile-top button {
  font-size: 1.7rem;
}
.mobile-note {
  margin: 0.3rem 0 0;
  color: var(--z-text-muted);
  font-family: var(--font-body);
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}
nav {
  display: grid;
  margin-top: 1.4rem;
}
nav a {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.95rem 0.25rem;
  border-bottom: 1px solid var(--z-border);
  font-family: var(--font-body);
  font-size: 1.45rem;
  font-weight: 550;
  letter-spacing: -0.03em;
}
.nav-arrow {
  margin-left: auto;
  color: var(--z-text-muted);
  font-size: 0.85rem;
}
nav a:hover {
  color: var(--z-primary);
}
nav a[aria-current='page'] {
  color: var(--z-primary);
}
.mobile-github {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--z-border);
  border-radius: 2px;
  background: var(--z-surface-raised);
  font-size: 0.86rem;
}
.mobile-foot {
  margin: 1.4rem 0 0;
  color: var(--z-text-muted);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
}
</style>
