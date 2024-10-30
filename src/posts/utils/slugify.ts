export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces/special characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
