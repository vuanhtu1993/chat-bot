import { ChatSession } from "../types/chat.types";
import SessionItem from "./SessionItem";
import { PlusCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'

type PropTypes = {
  sessions: ChatSession[];
  loadSession: (sessionId: string) => void;
  startNewSession: () => void;
  toggleSidebar?: () => void;
  show: boolean;
}

const Sidebar = ({ sessions, loadSession, startNewSession, show, toggleSidebar }: PropTypes) => {
  return (
    <div>
      <div className="ml-4 p-2 rounded-full hover:bg-gray-100 bg-gray-200 transition-colors touch-manipulation">
        <button onClick={toggleSidebar} className="flex items-center space-x-2">
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      <div className={`${show ? "block" : "hidden"} max-w-[300px] flex-col justify-between border-e border-gray-100 bg-white`}>
        <div className="px-4 py-6">
          <ul className="space-y-1">
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
              <div className="flex-1 overflow-y-auto bg-white mt-2">
                <h2 className="text-lg font-medium mb-4">Lịch sử trò chuyện</h2>
                {sessions.length > 0 ? (
                  <ul className="space-y-2 text-sm overflow-auto max-h-[calc(100vh-220px)]">
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
    </div>
  )
}

export default Sidebar;
