// src/utils/blogNormalize.js
// Normalization utility for Green Fibre Blog & Journal items

export const DEFAULT_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80";

export function resolveBlogImageUrl(coverImage, images = []) {
  if (typeof coverImage === "string" && coverImage.trim()) {
    return coverImage.trim();
  }
  if (coverImage && typeof coverImage === "object") {
    return (
      coverImage.large ||
      coverImage.original ||
      coverImage.medium ||
      coverImage.thumbnail ||
      DEFAULT_BLOG_IMAGE
    );
  }
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object" && first.url) return first.url;
  }
  return DEFAULT_BLOG_IMAGE;
}

export function calculateReadingTime(content) {
  if (!content) return 3;
  const words = content.split(/\s+/).filter(Boolean).length;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? 1 : mins;
}

export function normalizeBlog(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.slug || raw._id || raw.id || "");
  const slug = raw.slug || id;
  const title = raw.title || "Untitled Article";
  const excerpt = raw.excerpt || "";
  const content = raw.content || excerpt || "";
  const image = resolveBlogImageUrl(raw.coverImage, raw.images);
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  const category = tags[0] || raw.category || "Sustainability";
  
  let authorName = "Green Fibre Team";
  if (typeof raw.author === "string") {
    authorName = raw.author;
  } else if (raw.author && typeof raw.author === "object") {
    authorName = raw.author.full_name || raw.author.name || "Green Fibre Team";
  }

  const readingTime =
    typeof raw.readingTime === "number" && raw.readingTime > 0
      ? raw.readingTime
      : calculateReadingTime(content);

  const createdAt = raw.createdAt || raw.date || new Date().toISOString();

  return {
    _id: raw._id || id,
    id: slug,
    slug,
    title,
    excerpt,
    content,
    image,
    coverImage: raw.coverImage,
    tags,
    category,
    author: authorName,
    readingTime,
    date: createdAt,
    createdAt,
    isPublished: raw.isPublished !== false,
  };
}

export function normalizeBlogListResponse(data) {
  if (!data) return [];
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data.blogs)
    ? data.blogs
    : Array.isArray(data.data)
    ? data.data
    : [];

  return rawList.map(normalizeBlog).filter(Boolean);
}
