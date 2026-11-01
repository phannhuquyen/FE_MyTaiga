import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { BugItem, BugStatus, CloseBugPayload } from '../types'
import { bugService } from '../services/bugService'
import { AssigneePickerPopover } from './AssigneePickerPopover'
import { CloseBugModal } from './CloseBugModal'
import { DeleteBugModal } from './DeleteBugModal'
import { ProfileToast } from '@/features/profile/components/ProfileToast'

interface BugDetailViewProps {
  bug: BugItem
  onBack: () => void
  onBugUpdated: (updated: BugItem) => void
  onBugDeleted: (id: string) => void
}

export function BugDetailView({
  bug: initialBug,
  onBack,
  onBugUpdated,
  onBugDeleted,
}: BugDetailViewProps) {
  const [bug, setBug] = useState<BugItem>(initialBug)
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState<BugStatus>(bug.status)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Comment input
  const [newComment, setNewComment] = useState('')
  const [isSendingComment, setIsSendingComment] = useState(false)

  const handleStepTransition = async (targetStatus: BugStatus) => {
    if (isUpdatingStatus || targetStatus === bug.status) return
    setIsUpdatingStatus(true)
    setStatusError(null)
    try {
      const saved = await bugService.updateBugStatus(bug.id, targetStatus)
      // A status response contains no task discussion/attachment collections.
      const updated = { ...bug, status: saved.status, updatedAt: saved.updatedAt }
      setBug(updated)
      setSelectedStatus(updated.status)
      setStatusError(null)
      onBugUpdated(updated)
    } catch (err) {
      setSelectedStatus(bug.status)
      setStatusError(err instanceof Error ? err.message : 'Không thể đổi trạng thái Bug.')
    } finally { setIsUpdatingStatus(false) }
  }

  const handleConfirmClose = async (payload: CloseBugPayload) => {
    const updated = await bugService.closeBug(bug.id, payload)
    setBug(updated)
    setSelectedStatus(updated.status)
    setStatusError(null)
    onBugUpdated(updated)
  }

  const handleConfirmDelete = async () => {
    await bugService.deleteBug(bug.id)
    onBugDeleted(bug.id)
    onBack()
  }

  const handleAssigneeChange = async (assigneeId?: string) => {
    const updated = await bugService.assignBug(bug.id, assigneeId)
    setBug(updated)
    onBugUpdated(updated)
  }

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      setIsSendingComment(true)
      const updated = await bugService.addComment(bug.id, newComment.trim())
      setBug(updated)
      setNewComment('')
      onBugUpdated(updated)
    } finally {
      setIsSendingComment(false)
    }
  }

  const getSeverityBadge = () => {
    switch (bug.severity) {
      case 'blocker':
        return {
          label: 'Chặn (Blocker)',
          classes: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950 dark:text-danger-400',
        }
      case 'major':
        return {
          label: 'Nặng (Major)',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
        }
      case 'minor':
        return {
          label: 'Vừa (Minor)',
          classes: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400',
        }
      default:
        return {
          label: 'Nhẹ (Trivial)',
          classes: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400',
        }
    }
  }

  const getStatusBadge = () => {
    switch (bug.status) {
      case 'reopened':
        return {
          label: 'Mở lại',
          dotClass: 'bg-emerald-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        }
      case 'open':
        return {
          label: 'Đang mở',
          dotClass: 'bg-emerald-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        }
      case 'in_progress':
        return {
          label: 'Đang xử lý',
          dotClass: 'bg-amber-500',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        }
      case 'resolved':
        return {
          label: 'Đã sửa (Resolved)',
          dotClass: 'bg-teal-500',
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        }
      case 'closed':
        return {
          label: 'Đã đóng',
          dotClass: 'bg-neutral-400',
          badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
        }
    }
  }

  const sev = getSeverityBadge()
  const st = getStatusBadge()

  return (
    <div className="space-y-5 pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            <Icon name="arrow-left" size={14} />
            <span>Danh sách Lỗi & Bugs</span>
          </button>
          <span>/</span>
          <span>{bug.sprintName || 'Sprint 14'}</span>
          <span>/</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{bug.code}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert(`Đã sao chép liên kết ${bug.code}`)}
            className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Icon name="copy" size={14} />
            <span>Chia sẻ</span>
          </button>
          <button
            type="button"
            className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Icon name="eye" size={14} />
            <span>Theo dõi (4)</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Stepper Banner (S11-04) */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100 dark:border-neutral-700/60 mb-4">
          <div className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
            <span>VÒNG ĐỜI KHẮC PHỤC LỖI</span>
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/60 text-primary-800 dark:text-primary-300 rounded-full font-semibold text-[10px] normal-case">
              SCRUMBAN GUARD ACTIVE
            </span>
          </div>
          <div className="text-neutral-400 text-[11px]">
            Chọn trạng thái mong muốn và lưu thay đổi.
          </div>
        </div>

        {/* 4-step Horizontal Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
          {/* Step 1: Mở (Open) */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              bug.status === 'open'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                1. Mở (Open)
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                <Icon name="check" size={12} />
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              09:12 - 24/10
            </div>
          </div>

          {/* Step 2: Đang xử lý (In Progress) */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              bug.status === 'in_progress'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 ring-1 ring-primary-500'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                2. Đang xử lý
              </span>
              {bug.status === 'in_progress' ? (
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600" />
              )}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              {bug.assignee ? `${bug.assignee.name} (3h 45m)` : 'Chưa gán'}
            </div>
          </div>

          {/* Step 3: Đã sửa (Resolved) */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              bug.status === 'resolved'
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-500'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                3. Đã sửa (Resolved)
              </span>
              <div className="w-5 h-5 rounded-full text-neutral-400 flex items-center justify-center">
                <Icon name="shield" size={14} />
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Chờ QA kiểm định
            </div>
          </div>

          {/* Step 4: Đóng (Closed) */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              bug.status === 'closed'
                ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-700'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                4. Đóng (Closed)
              </span>
              <div className="w-5 h-5 rounded-full text-neutral-400 flex items-center justify-center">
                <Icon name="lock" size={13} />
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Hoàn thành chu kỳ
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Icon name="refresh" size={13} className="text-primary-600" />
            <span>
              <strong>Vòng lặp tái hiện (Re-open Loop):</strong> Nếu QA phát hiện lỗi còn tồn tại sau
              khi kiểm thử.
            </span>
          </div>
          <div className="font-mono text-[10px] text-neutral-400">
            [Đã sửa / Đóng] ──&gt; Mở lại (Re-open) ──&gt; [Mở]
          </div>
        </div>
      </div>

      <ProfileToast isVisible={Boolean(statusError)} variant="error" message="Không thể đổi trạng thái Bug" description={statusError || ''} onClose={() => setStatusError(null)} />

      {/* Main 2-Column Content Layout (S11-03) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Content, Steps, Environment, Attachments, Comments */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title Header Card */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-950 dark:text-danger-300">
                {bug.code}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                {st.label}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sev.classes}`}
              >
                {sev.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
              {bug.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-[10px]">
                {bug.reporter.avatar || 'TA'}
              </div>
              <span>
                Tạo bởi <strong className="text-neutral-800 dark:text-neutral-200">{bug.reporter.name}</strong> ({bug.reporter.role})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon name="clock" size={13} />
                {bug.createdAt}
              </span>
            </div>
          </div>

          {/* Steps to Reproduce Card */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Icon name="file-text" size={17} className="text-primary-600" />
                Mô tả & Các bước tái hiện
              </h3>
              <button
                type="button"
                onClick={() => alert('Chế độ chỉnh sửa mô tả đã kích hoạt')}
                className="text-xs font-medium text-neutral-500 hover:text-primary-600 flex items-center gap-1"
              >
                <Icon name="edit" size={14} />
                Sửa
              </button>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {bug.description}
            </p>

            {bug.stepsToReproduce && (
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl">
                <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Các bước tái hiện (Steps to Reproduce):
                </div>
                <pre className="font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {bug.stepsToReproduce}
                </pre>
              </div>
            )}

            {/* Expected vs Actual Side-by-Side Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                  <Icon name="check-circle" size={15} />
                  Kết quả mong đợi
                </div>
                <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed text-[11px]">
                  {bug.expectedResult ||
                    'Hệ thống xử lý Optimistic UI khóa trạng thái tạm thời, giữ nguyên trạng thái hợp lệ.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-danger-200 dark:border-danger-800/60 bg-danger-50/50 dark:bg-danger-950/20 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-danger-800 dark:text-danger-300 mb-1.5">
                  <Icon name="alert-circle" size={15} />
                  Kết quả thực tế
                </div>
                <p className="text-danger-900/90 dark:text-danger-200/90 leading-relaxed text-[11px]">
                  {bug.actualResult ||
                    'Cả hai client bị drop session WebSocket, thẻ bị kẹt ở trạng thái lơ lửng.'}
                </p>
              </div>
            </div>

            {/* Stacktrace if available */}
            {bug.stackTrace && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>STACKTRACE LOG FILE (CRITICAL)</span>
                  <span>vnpay-service-prod-789c64</span>
                </div>
                <div className="bg-neutral-900 text-neutral-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                  {bug.stackTrace}
                </div>
              </div>
            )}
          </div>

          {/* Environment Section */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Icon name="sliders" size={17} className="text-primary-600" />
                Môi trường ghi nhận
              </h3>
              <span className="text-[11px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded font-medium">
                Hạ tầng CI/CD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-xs">
                <span className="text-neutral-400 block text-[11px] mb-0.5">Môi trường</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {bug.infrastructure?.environment || bug.environment}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-xs">
                <span className="text-neutral-400 block text-[11px] mb-0.5">Cụm máy chủ</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {bug.infrastructure?.cluster || 'Kubernetes v1.28'}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-xs">
                <span className="text-neutral-400 block text-[11px] mb-0.5">Pub/Sub Cache</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {bug.infrastructure?.cache || 'Redis 7.2 Sentinel'}
                </span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Icon name="paperclip" size={17} className="text-primary-600" />
                Tệp đính kèm ({bug.attachments.length})
              </h3>
              <button
                type="button"
                onClick={() => alert('Mở hộp thoại tải lên tệp')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <Icon name="plus" size={14} />
                Thêm tệp
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bug.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                      <Icon name={att.type === 'image' ? 'camera' : 'file-text'} size={16} />
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {att.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {att.size} • {att.type === 'image' ? 'Ảnh chụp màn hình' : 'Log truy vết'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Tải xuống tệp: ${att.name}`)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 shrink-0"
                    title="Tải xuống"
                  >
                    <Icon name="download" size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Discussion */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Icon name="message-square" size={17} className="text-primary-600" />
                Bình luận & Thảo luận ({bug.comments.length})
              </h3>
              <span className="text-xs text-neutral-400">Sắp xếp: Mới nhất</span>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {bug.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 bg-neutral-50/70 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-bold flex items-center justify-center text-[10px]">
                        {comment.authorAvatar || 'US'}
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-medium">
                        {comment.authorRole}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed pl-8">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Comment Box */}
            <form onSubmit={handleSendComment} className="pt-2">
              <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 bg-white dark:bg-neutral-900">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết phản hồi hoặc bình luận giải pháp..."
                  className="w-full p-3 text-xs text-neutral-800 dark:text-neutral-200 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <button type="button" className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold text-xs">
                      B
                    </button>
                    <button type="button" className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200 font-mono text-xs">
                      &lt;&gt;
                    </button>
                    <button type="button" className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200">
                      <Icon name="paperclip" size={14} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSendingComment}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="send" size={13} />
                    <span>{isSendingComment ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1/3): Properties, Workflow Transition, Actions */}
        <div className="space-y-5">
          {/* Workflow & Status Card (S11-04) */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-700">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Icon name="shield" size={15} className="text-primary-600" />
                Quy trình & Trạng thái
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded font-semibold">
                Quy chuẩn ScrumBan
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                Trạng thái Bug
              </label>
              <select
                aria-label="Trạng thái Bug" disabled={isUpdatingStatus} value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as BugStatus)}
                className="w-full text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="open">🟢 Mở (Open)</option>
                <option value="reopened">Mở lại (Reopened)</option>
                <option value="in_progress">🟠 Đang xử lý (In Progress)</option>
                <option value="resolved">🔵 Đã sửa (Resolved)</option>
                <option value="closed">🔒 Đóng (Closed)</option>
              </select>
            </div>

            <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900/60 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-start gap-1.5">
              <Icon name="info" size={14} className="text-primary-600 shrink-0 mt-0.5" />
              <span>
                Có thể chọn trực tiếp trạng thái. Thay đổi chỉ hiển thị sau khi máy chủ lưu thành công.
              </span>
            </div>

            {/* Quick Action Options */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                CHỌN TRẠNG THÁI KẾ TIẾP:
              </div>

              {/* In Progress */}
              <button
                type="button"
                onClick={() => handleStepTransition('in_progress')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  bug.status === 'in_progress'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="check" size={13} />
                    <span>Đang xử lý</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    {bug.status === 'in_progress' ? 'Trạng thái hiện tại của nhiệm vụ' : 'Chuyển sang phân tích & sửa code'}
                  </div>
                </div>
                {bug.status === 'in_progress' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    Hiện tại
                  </span>
                )}
              </button>

              {/* Resolved */}
              <button
                type="button"
                onClick={() => handleStepTransition('resolved')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  bug.status === 'resolved'
                    ? 'border-teal-500 bg-teal-50/60 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="arrow-right" size={13} />
                    <span>Đã sửa (Resolved)</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Đã khắc phục xong, chuyển sang cho QA kiểm thử & xác nhận
                  </div>
                </div>
              </button>

              {/* Closed */}
              <button
                type="button"
                onClick={() => handleStepTransition('closed')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="lock" size={13} />
                    <span>Đóng (Closed)</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Chuyển trực tiếp sang trạng thái Đóng.
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleStepTransition(selectedStatus)}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Xác nhận chuyển bước</span>
              <Icon name="arrow-right" size={14} />
            </button>
          </div>

          {/* Properties Card (S11-03) */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-100 dark:border-neutral-700">
              Thuộc tính Bug
            </h3>

            {/* Assignee */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-neutral-400 text-[11px]">Người xử lý (Assignee)</span>
                <button
                  type="button"
                  onClick={() => setIsAssigneePopoverOpen(!isAssigneePopoverOpen)}
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline text-[11px]"
                >
                  Thay đổi
                </button>
              </div>

              {bug.assignee ? (
                <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-[10px]">
                    {bug.assignee.avatar || 'MQ'}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {bug.assignee.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">{bug.assignee.role}</div>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-dashed border-neutral-300 text-neutral-400 text-center italic">
                  Chưa gán người xử lý
                </div>
              )}

              {isAssigneePopoverOpen && (
                <AssigneePickerPopover
                  currentAssignee={bug.assignee}
                  onSelect={handleAssigneeChange}
                  onClose={() => setIsAssigneePopoverOpen(false)}
                  onDeleteRequest={() => setIsDeleteModalOpen(true)}
                />
              )}
            </div>

            {/* Severity & Priority */}
            <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-700/60">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-[11px]">Mức độ nghiêm trọng</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${bug.severity === 'blocker' ? 'bg-danger-500' : 'bg-amber-500'}`} />
                  {sev.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-[11px]">Mức độ ưu tiên</span>
                <span className="font-semibold text-danger-600 flex items-center gap-1">
                  <Icon name="flag" size={13} />
                  Cao (P1)
                </span>
              </div>
            </div>

            {/* Relations */}
            <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-700/60">
              <div>
                <span className="text-neutral-400 text-[11px] block mb-0.5">Task liên quan</span>
                <a
                  href="#task"
                  onClick={(e) => {
                    e.preventDefault()
                    alert(`Mở thông tin nhiệm vụ ${bug.relatedTaskCode || '#TASK-239'}`)
                  }}
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Icon name="kanban" size={13} />
                  <span>{bug.relatedTaskCode || '#TASK-239'}: {bug.relatedTaskTitle || 'WebSocket Sync Engine'}</span>
                </a>
              </div>

              <div>
                <span className="text-neutral-400 text-[11px] block mb-0.5">Sprint liên kết</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <Icon name="sprint" size={13} className="text-neutral-400" />
                  {bug.sprintName || 'Sprint 14: Tối ưu luồng'}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-700/60">
              <div>
                <span className="text-neutral-400 text-[11px] block">Ngày phát hiện</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">26/10/2024</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block">Hạn chót xử lý</span>
                <span className="font-medium text-danger-600">27/10/2024</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-2 text-xs">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-100 dark:border-neutral-700">
              Thao tác xử lý
            </h3>

            <button
              type="button"
              onClick={() => setIsCloseModalOpen(true)}
              className="w-full py-2 px-3 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="check" size={15} />
              <span>Đóng Bug (Resolve)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2 px-3 border border-danger-200 dark:border-danger-800 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="trash" size={15} />
              <span>Xóa Bug</span>
            </button>
          </div>

          {/* SLA tip info */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed flex items-start gap-2">
            <Icon name="info" size={14} className="text-primary-600 shrink-0 mt-0.5" />
            <span>
              Mọi thay đổi trên thẻ này sẽ được đồng bộ hóa tức thì tới toàn bộ thành viên trong{' '}
              {bug.sprintName || 'Sprint 14'} qua engine ScrumBan Flow.
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CloseBugModal
        isOpen={isCloseModalOpen}
        bug={bug}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
      />

      <DeleteBugModal
        isOpen={isDeleteModalOpen}
        bug={bug}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
