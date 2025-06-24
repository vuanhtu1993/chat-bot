import { ChatSession } from "@/types/chat.types";
import { TrashIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

type PropTypes = {
  session: ChatSession;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
};

const SessionItem = ({ session, onSelect, onDelete }: PropTypes) => {
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering session selection
    if (session._id) {
      onDelete(session._id);
    }
  }

  return (
    <div
      className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => session._id && onSelect(session._id)}
    >
      {/* icon question here */}
      <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-gray-500" />
      <div className="w-[240px]">
        <h3 className="text-gray-900 text-sm">
          {formatDate(session.updatedAt)}
        </h3>
        <p className="mt-0.5 text-gray-700 truncate text-xs">
          {session.messages[0]?.content || "No messages yet"}
        </p>
      </div>
      <TrashIcon
        onClick={handleDelete}
        className="w-5 h-5 text-red-200 hover:text-red-400 cursor-pointer transition-colors touch-manipulation"
      />
    </div>
  );
};

export default SessionItem;
