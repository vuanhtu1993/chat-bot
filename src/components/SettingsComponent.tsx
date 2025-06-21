'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Settings {
  openAIModel: string;
  temperature: number;
  searchEngine: string;
  voiceEnabled: boolean;
}

export default function SettingsComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    openAIModel: 'gpt-4.1-nano',
    temperature: 0.7,
    searchEngine: 'google',
    voiceEnabled: true,
  });

  const saveSettings = () => {
    localStorage.setItem('chatbot-settings', JSON.stringify(settings));
    setIsOpen(false);
    // Implement settings update logic here
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">Settings</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OpenAI Model
                </label>
                <select
                  value={settings.openAIModel}
                  onChange={(e) =>
                    setSettings({ ...settings, openAIModel: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full"
                />
                <span className="text-sm text-gray-500">
                  {settings.temperature}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search Engine
                </label>
                <select
                  value={settings.searchEngine}
                  onChange={(e) =>
                    setSettings({ ...settings, searchEngine: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Voice Input/Output
                </span>
                <button
                  onClick={() =>
                    setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })
                  }
                  className={`${settings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
