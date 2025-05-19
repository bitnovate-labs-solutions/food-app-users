// Helper function to extract filename from URL
export const getFileNameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[pathParts.length - 1];
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
};
