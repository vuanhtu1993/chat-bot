import { ChatSession } from "../types/chat.types";
import SessionItem from "./SessionItem";
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

type PropTypes = {
  show: boolean;
  sessions: ChatSession[];
  loadSession: (sessionId: string) => void;
  startNewSession: () => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
  toggleSidebar: () => void;
};

const Sidebar = ({ show, sessions, loadSession, startNewSession, onDeleteSession, toggleSidebar }: PropTypes) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleSidebar}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-200 ${show ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Lịch sử trò chuyện</h2>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              startNewSession();
              toggleSidebar();
            }}
            className="w-full py-2 mb-4 text-white bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Cuộc trò chuyện mới
          </button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.length > 0 ? (
              sessions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(session => (
                  <SessionItem
                    key={session._id}
                    session={session}
                    onSelect={loadSession}
                    onDelete={onDeleteSession}
                  />
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">Không có lịch sử trò chuyện</p>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;
