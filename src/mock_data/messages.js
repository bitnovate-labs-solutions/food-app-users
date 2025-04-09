export const mockConversations = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey, how are you doing?",
    time: "2h ago",
    avatar: "https://github.com/shadcn.png",
    unread: 2,
    messages: [
      {
        id: 1,
        senderId: 1,
        content: "Hey there! How are you doing?",
        timestamp: "2024-03-20T14:30:00Z",
      },
      {
        id: 2,
        senderId: 2,
        content: "I'm good, thanks! How about you?",
        timestamp: "2024-03-20T14:32:00Z",
      },
      {
        id: 3,
        senderId: 1,
        content: "Doing well! Just wanted to check in about our meeting tomorrow.",
        timestamp: "2024-03-20T14:35:00Z",
      },
      {
        id: 4,
        senderId: 2,
        content: "Yes, I'm looking forward to it. What time works best for you?",
        timestamp: "2024-03-20T14:40:00Z",
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    lastMessage: "Let's meet tomorrow!",
    time: "1d ago",
    avatar: "https://github.com/shadcn.png",
    unread: 0,
    messages: [
      {
        id: 1,
        senderId: 2,
        content: "Hi! Are you free tomorrow?",
        timestamp: "2024-03-19T10:15:00Z",
      },
      {
        id: 2,
        senderId: 1,
        content: "Yes, I should be available. What time?",
        timestamp: "2024-03-19T10:30:00Z",
      },
      {
        id: 3,
        senderId: 2,
        content: "How about 2 PM?",
        timestamp: "2024-03-19T11:00:00Z",
      },
      {
        id: 4,
        senderId: 1,
        content: "Perfect! Let's meet at the usual place.",
        timestamp: "2024-03-19T11:05:00Z",
      },
    ],
  },
]; 