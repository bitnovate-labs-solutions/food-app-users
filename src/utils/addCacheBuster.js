// USAGE: -> for user-uploaded image URLs that are likely to be updated and reused.
// Browsers and CDNs often cache images aggressively.
// If you re-upload a new image to the same URL (same filename), the browser may still show the old cached version, not the new one.
// Adding "?t=timestamp" forces the browser and CDN to treat the image as a new resource - even though it's technically the same URL
// Cache-busting is a standard frontend practice - particularly with profile photos, thumbnails, icons & logos users may update

export const addCacheBuster = (url) => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("t", Date.now());
    return parsedUrl.toString();
  } catch (error) {
    console.error("Invalid URL passed to addCacheBuster:", url, error.message);
    return url; // Fallback to original if URL can't be parsed
  }
};
