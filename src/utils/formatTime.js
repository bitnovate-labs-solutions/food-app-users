// HH:MM AM/PM format
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date
    .toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};
