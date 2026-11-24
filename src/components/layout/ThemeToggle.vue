<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
  switchToLight: string;
  switchToDark: string;
}>();
const theme = ref<'dark' | 'light'>('dark');
const label = computed(() => (theme.value === 'dark' ? props.switchToLight : props.switchToDark));

function applyTheme(next: 'dark' | 'light', persist = true) {
  theme.value = next;
  document.documentElement.dataset.theme = next;
  if (persist) {
    try {
      localStorage.setItem('z-os-theme', next);
    } catch {
      // The theme still changes for this page when storage is unavailable.
    }
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', next === 'light' ? '#F3EEE4' : '#15130F');
}

function onStorage(event: StorageEvent) {
  if (event.key !== 'z-os-theme') return;
  applyTheme(event.newValue === 'light' ? 'light' : 'dark', false);
}

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  window.addEventListener('storage', onStorage);
});

onBeforeUnmount(() => window.removeEventListener('storage', onStorage));
</script>

<template>
  <button
    class="icon-button"
    type="button"
    :aria-label="label"
    :title="label"
    :aria-pressed="theme === 'light'"
    @click="applyTheme(theme === 'dark' ? 'light' : 'dark')"
  >
    <svg
      v-if="theme === 'dark'"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
      />
    </svg>
    <svg
      v-else
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
    </svg>
  </button>
</template>
