// Format timestamp into a readable date label

export const formatMessageDate = (date) => {
  const today = new Date();
  const messageDate = new Date(date);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Group messages by formatted date

export const groupMessagesByDate = (messages) => {
  const groups = {};

  messages?.forEach((message) => {
    const date = formatMessageDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return groups;
};
