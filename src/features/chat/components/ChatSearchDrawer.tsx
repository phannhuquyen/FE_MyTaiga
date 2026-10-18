import { useState, useMemo } from 'react'
import { Icon } from '@/components/ui'
import { chatService } from '../services/chatService'
import type { ChatMessage } from '../types'

interface ChatSearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult?: (message: ChatMessage) => void
  currentConversationId: string
}

export function ChatSearchDrawer({
  isOpen,
  onClose,
  onSelectResult,
  currentConversationId,
}: ChatSearchDrawerProps) {
  const [keyword, setKeyword] = useState('webhook')
  const [selectedIdx, setSelectedIdx] = useState(2) // 3rd match by default like S13-05

  const searchResults = useMemo(() => {
    return chatService.searchMessages(keyword, currentConversationId)
  }, [keyword, currentConversationId])

  if (!isOpen) return null

  const handleNext = () => {
    if (searchResults.length > 0) {
      setSelectedIdx((prev) => (prev + 1) % searchResults.length)
    }
  }

  const handlePrev = () => {
    if (searchResults.length > 0) {
      setSelectedIdx((prev) => (prev - 1 + searchResults.length) % searchResults.length)
    }
  }

  return (
    <>
      {/* Top Search Bar (S13-05) */}
      <div className="absolute top-0 inset-x-0 bg-whiteboard dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-2.5 z-30 shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setSelectedIdx(0)
              }}
              placeholder="Tìm kiếm nội dung tin nhắn trong dự án..."
              autoFocus
              className="w-full pl-9 pr-24 py-1.5 text-xs bg-paper-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchResults.length > 0 && (
              <span className="absolute right-3 top-2 text-[11px] font-mono font-medium text-neutral-500">
                {selectedIdx + 1} / {searchResults.length} kết quả
              </span>
            )}
          </div>

          {/* Up / Down navigation */}
          <div className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 bg-paper-50 dark:bg-neutral-800">
            <button
              type="button"
              onClick={handlePrev}
              title="Kết quả trước"
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer text-neutral-600 dark:text-neutral-300"
            >
              <Icon name="chevron-up" size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Kết quả sau"
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer text-neutral-600 dark:text-neutral-300"
            >
              <Icon name="chevron-down" size={14} />
            </button>
          </div>
        </div>

        {/* Right close controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline text-neutral-400 text-[11px]">
            Nhấn <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 border rounded">Esc</kbd> để đóng
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>

      {/* Right Drawer Results Sidebar (S13-05) */}
      <div className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-whiteboard dark:bg-neutral-900 flex flex-col h-full z-20 shrink-0">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Icon name="search" size={16} className="text-primary-600" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Kết quả tìm kiếm
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500">
            {searchResults.length} kết quả
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Không tìm thấy tin nhắn nào chứa &ldquo;{keyword}&rdquo;
            </div>
          ) : (
            searchResults.map(({ message, conversationName }, idx) => {
              const isSelected = idx === selectedIdx
              return (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedIdx(idx)
                    onSelectResult?.(message)
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-500 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {message.senderName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {message.timestamp}
                    </span>
                  </div>

                  <p className="text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                    {message.content.split(new RegExp(`(${keyword})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === keyword.toLowerCase() ? (
                        <mark
                          key={i}
                          className="bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 px-0.5 rounded font-medium"
                        >
                          {part}
                        </mark>
                      ) : (
                        part
                      ),
                    )}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400">
                    <span className="font-medium text-primary-700 dark:text-primary-400 truncate">
                      #{conversationName}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.2 rounded bg-primary-600 text-whiteboard font-bold">
                        Đang chọn
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
