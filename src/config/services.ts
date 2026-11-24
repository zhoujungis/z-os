export interface ServiceDefinition {
  id: string;
  name: string;
  url: string;
}

export const services = [
  { id: 'blog', name: 'Blog', url: 'https://blog.zhoujun.dev' },
  { id: 'music', name: 'Music', url: 'https://music.zhoujun.dev/' },
  { id: 'routewise', name: 'Routewise', url: 'https://routewise-ai.pages.dev/' },
  { id: 'happy-games', name: 'Happy Games', url: 'https://happy-games.pages.dev/' },
  { id: 'block-world', name: 'Block World 3D', url: 'https://block-world-3d.pages.dev/' },
  { id: 'echo-space', name: 'Echo Space', url: 'https://echo-space-run.pages.dev/' },
] as const satisfies readonly ServiceDefinition[];
