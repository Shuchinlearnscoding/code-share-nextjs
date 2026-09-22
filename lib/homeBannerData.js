import { randomUUID } from 'crypto';
import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for home banner queries');
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

function publicSlide(row) {
  return {
    id: row.id,
    imageUrl: row.image_url,
    linkHref: row.link_href,
    title: row.title,
    subtitle: row.subtitle,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listActiveBannerSlides() {
  const sql = getSql();
  const rows = await sql`
    select * from home_banner_slides
    where is_active = true
    order by sort_order asc, created_at asc
  `;

  return rows.map(publicSlide);
}

export async function listAllBannerSlides() {
  const sql = getSql();
  const rows = await sql`
    select * from home_banner_slides
    order by sort_order asc, created_at asc
  `;

  return rows.map(publicSlide);
}

export async function createBannerSlide({ imageUrl, linkHref, title, subtitle, sortOrder }) {
  const sql = getSql();
  const id = randomUUID();
  const [row] = await sql`
    insert into home_banner_slides (id, image_url, link_href, title, subtitle, sort_order)
    values (${id}, ${imageUrl}, ${linkHref || null}, ${title || null}, ${subtitle || null}, ${sortOrder ?? 0})
    returning *
  `;

  return publicSlide(row);
}

export async function updateBannerSlide(id, { imageUrl, linkHref, title, subtitle, sortOrder, isActive }) {
  const sql = getSql();
  const [row] = await sql`
    update home_banner_slides
    set
      image_url = coalesce(${imageUrl ?? null}, image_url),
      link_href = coalesce(${linkHref ?? null}, link_href),
      title = coalesce(${title ?? null}, title),
      subtitle = coalesce(${subtitle ?? null}, subtitle),
      sort_order = coalesce(${sortOrder ?? null}, sort_order),
      is_active = coalesce(${isActive ?? null}, is_active),
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return row ? publicSlide(row) : null;
}

export async function deleteBannerSlide(id) {
  const sql = getSql();
  const [row] = await sql`
    delete from home_banner_slides where id = ${id} returning id
  `;

  return Boolean(row);
}
