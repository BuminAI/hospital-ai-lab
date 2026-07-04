import type { APIRoute } from 'astro';
import { BASE } from '../utils/site';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${BASE}/sitemap-index.xml`, site);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
