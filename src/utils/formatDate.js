// FORMAT DATE TO DISPLAY (in Malaysian Format) - "22 Feb 2025"
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
