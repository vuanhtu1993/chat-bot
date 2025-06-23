import { ChatSession } from "@/types/chat.types";

type PropTypes = {
  session: ChatSession;
};

const SessionItem = ({ session }: PropTypes) => {
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString();
  };

  return (
    <div className="flex gap-4">
      {/* icon question here */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="max-w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
      <div>
        <h3 className="text-gray-900 text-sm">{formatDate(session.updatedAt)}</h3>
        <p className="mt-0.5 text-gray-700">
          {session.messages[0]?.content || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

export default SessionItem;
