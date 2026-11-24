import type { APIRoute } from 'astro';
import { buildSearchDocuments } from '../../utils/search-index';

export const GET: APIRoute = async () => {
  const documents = await buildSearchDocuments('en');
  return new Response(JSON.stringify(documents), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
