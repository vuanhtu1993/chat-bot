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

interface SettingsComponentProps {
  onClose?: () => void;
}

export default function SettingsComponent({ onClose }: SettingsComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    openAIModel: 'gpt-4.1-nano',
    temperature: 0.7,
    searchEngine: 'google',
    voiceEnabled: true,
  });

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors duration-200 active:scale-95 touch-manipulation"
        aria-label="Open Settings"
      >
        <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
      </button>

      <Dialog
        open={isOpen || !!onClose}
        onClose={handleClose}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container for mobile */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm md:max-w-md rounded-lg bg-white p-4 md:p-6">
            <Dialog.Title className="text-lg md:text-xl font-medium mb-4">
              Cài đặt
            </Dialog.Title>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  value={settings.openAIModel}
                  onChange={(e) =>
                    setSettings({ ...settings, openAIModel: e.target.value })
                  }
                  className="w-full p-2 border rounded-md text-base touch-manipulation"
                >
                  <option value="gpt-4.1-nano">GPT-4.1 Nano</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              {/* Temperature Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature: {settings.temperature}
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
                  className="w-full touch-manipulation"
                />
              </div>

              {/* Search Engine Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Công cụ tìm kiếm
                </label>
                <select
                  value={settings.searchEngine}
                  onChange={(e) =>
                    setSettings({ ...settings, searchEngine: e.target.value })
                  }
                  className="w-full p-2 border rounded-md text-base touch-manipulation"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              {/* Voice Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Hỗ trợ giọng nói
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      voiceEnabled: !settings.voiceEnabled,
                    })
                  }
                  className={`${settings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors touch-manipulation`}
                >
                  <span
                    className={`${settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 touch-manipulation"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  handleClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 touch-manipulation"
              >
                Lưu
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
