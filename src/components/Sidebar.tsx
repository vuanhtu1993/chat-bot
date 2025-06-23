import { ChatSession } from "../types/chat.types";
import SessionItem from "./SessionItem";
import { PlusCircleIcon } from '@heroicons/react/24/outline'

type PropTypes = {
  sessions: ChatSession[];
  loadSession: (sessionId: string) => void;
  startNewSession: () => void;
}

const Sidebar = ({ sessions, loadSession, startNewSession }: PropTypes) => {
  return (
    <div className="flex h-screen flex-1 flex-col justify-between border-e border-gray-100 bg-white overflow-auto">
      <div className="px-4 py-6">
        <ul className="mt-14 space-y-1">
          <li>
            <button
              onClick={() => startNewSession()}
              className="cursor-pointer hover:bg-green-700 block hover:text-white rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
            >
              <PlusCircleIcon className="h-5 w-5 inline-block mr-2" />
              Cuộc trò chuyện mới
            </button>
          </li>
          <li>
            <div className="flex-1 overflow-y-auto bg-white p-3 md:p-4">
              <h2 className="text-lg font-medium mb-4">Lịch sử trò chuyện</h2>
              {sessions.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {sessions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(session => (
                      <li
                        key={session._id}
                        onClick={() => loadSession(session._id!)}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      >
                        <SessionItem session={session} />
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có lịch sử trò chuyện</p>
              )}
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar;
