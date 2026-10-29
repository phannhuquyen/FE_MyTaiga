import { useState, useId } from 'react'
import { Icon } from '@/components/ui'
import type { Candidate, Department, MemberRole } from '../types'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  departments: Department[]
  candidates: Candidate[]
  onAddMember: (candidateId: string, departmentId: string, role: MemberRole) => Promise<void>
}

export function AddMemberModal({
  isOpen,
  onClose,
  departments,
  candidates,
  onAddMember,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [departmentId, setDepartmentId] = useState<string>('unassigned')
  const [role, setRole] = useState<MemberRole>('member')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deptSelectId = useId()

  if (!isOpen) return null

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.roleTitle.toLowerCase().includes(q) ||
      c.employeeCode.toLowerCase().includes(q)
    )
  })

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId)
  const isAlreadyInProject = selectedCandidate?.alreadyInProject

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidate || isAlreadyInProject) return

    setIsSubmitting(true)
    try {
      await onAddMember(selectedCandidate.id, departmentId, role)
      onClose()
    } catch {
      // Error handled by parent or service
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-whiteboard rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-primary-600 font-semibold text-title-small">
            <Icon name="user-plus" size={20} className="text-primary-600" />
            <h2 id="add-member-modal-title" className="text-neutral-900 font-bold">
              Thêm thành viên vào dự án
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* S4-03: Red error banner if candidate already exists in project */}
          {isAlreadyInProject && (
            <div className="p-3.5 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-3 text-danger-900">
              <Icon name="alert-circle" size={20} className="text-danger-600 shrink-0 mt-0.5" />
              <div className="text-body-sm">
                <div className="font-semibold text-danger-800">
                  Thành viên đã tồn tại trong dự án
                </div>
                <div className="text-danger-700 mt-0.5 text-xs">
                  {selectedCandidate.name} đã là thành viên chính thức thuộc phòng ban{' '}
                  {selectedCandidate.existingDepartment || 'Frontend Engineering'}.
                </div>
              </div>
            </div>
          )}

          {/* Search Candidate */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-body-sm font-medium text-neutral-800">
              <span>Tìm kiếm tài khoản nội bộ</span>
              <span className="text-xs text-neutral-500 font-normal">Tổ chức TechCorp Vietnam</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập họ tên, email hoặc mã nhân viên..."
                className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Directory shortcuts */}
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              <span>Danh bạ:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCandidateId('')
                }}
                className="text-primary-600 hover:underline cursor-pointer"
              >
                Tất cả tài khoản
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  const existing = candidates.find((candidate) => candidate.alreadyInProject)
                  setSearchQuery(existing?.email || '')
                  setSelectedCandidateId(existing?.id || '')
                }}
                className="text-danger-600 hover:underline cursor-pointer"
              >
                Đã thuộc dự án
              </button>
            </div>
          </div>

          {/* Candidates Search Results */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              <span>KẾT QUẢ TÌM KIẾM ({filteredCandidates.length} ỨNG VIÊN)</span>
              {isAlreadyInProject ? (
                <span className="text-danger-600 font-medium lowercase">Không khả dụng để thêm</span>
              ) : (
                <span className="text-primary-600 font-medium lowercase">
                  {selectedCandidate ? 'Đã chọn 1 nhân sự' : 'Chưa chọn'}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg p-2 bg-neutral-50/50">
              {filteredCandidates.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  Không tìm thấy ứng viên nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredCandidates.map((cand) => {
                  const isSelected = selectedCandidateId === cand.id
                  const isCandidateDisabled = cand.alreadyInProject

                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`flex items-center justify-between p-2.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? isCandidateDisabled
                            ? 'bg-danger-50/40 border-danger-300 ring-1 ring-danger-300'
                            : 'bg-primary-50/50 border-primary-500 ring-1 ring-primary-500'
                          : 'bg-whiteboard border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? isCandidateDisabled
                                ? 'bg-danger-500 border-danger-500 text-whiteboard'
                                : 'bg-primary-600 border-primary-600 text-whiteboard'
                              : 'border-neutral-300 bg-whiteboard'
                          }`}
                        >
                          {isSelected && <Icon name={isCandidateDisabled ? 'minus' : 'check'} size={12} />}
                        </div>

                        <div className="w-8 h-8 rounded-full bg-neutral-700 text-whiteboard font-semibold text-xs flex items-center justify-center shrink-0">
                          {cand.avatarCode}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-sm font-semibold text-neutral-900 truncate">
                              {cand.name}
                            </span>
                            {cand.isOnline && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-primary-100 text-primary-800">
                                Trực tuyến
                              </span>
                            )}
                            {cand.alreadyInProject && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-danger-100 text-danger-800">
                                • Đã tham gia
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 truncate">
                            {cand.email}
                            {cand.departmentName && ` • ${cand.departmentName}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-neutral-500 uppercase px-2 py-0.5 rounded bg-neutral-100 shrink-0">
                        {cand.alreadyInProject ? `Mã NV: ${cand.employeeCode}` : cand.roleTitle}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label htmlFor={deptSelectId} className="block text-body-sm font-medium text-neutral-800 mb-1.5">
              Phòng ban phân bổ
            </label>
            <select
              id={deptSelectId}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={Boolean(isAlreadyInProject)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:bg-neutral-100"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          {/* Role Radio Cards */}
          <div>
            <label className="block text-body-sm font-medium text-neutral-800 mb-2">
              Vai trò phân quyền trong dự án
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Member Card */}
              <div
                onClick={() => !isAlreadyInProject && setRole('member')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === 'member'
                    ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500'
                    : 'border-neutral-200 hover:border-neutral-300 bg-whiteboard'
                } ${isAlreadyInProject ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        role === 'member'
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-300'
                      }`}
                    >
                      {role === 'member' && <span className="w-1.5 h-1.5 rounded-full bg-whiteboard" />}
                    </span>
                    <span className="text-body-sm font-semibold text-neutral-900">
                      Thành viên (Member)
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                    THỰC THI
                  </span>
                </div>
                <p className="text-xs text-neutral-600 pl-6">
                  Nhận thẻ Kanban, cập nhật trạng thái Task, tạo issue và đóng góp vào mục tiêu Sprint.
                </p>
              </div>

              {/* Manager Card */}
              <div
                onClick={() => !isAlreadyInProject && setRole('manager')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === 'manager'
                    ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500'
                    : 'border-neutral-200 hover:border-neutral-300 bg-whiteboard'
                } ${isAlreadyInProject ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        role === 'manager'
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-300'
                      }`}
                    >
                      {role === 'manager' && <span className="w-1.5 h-1.5 rounded-full bg-whiteboard" />}
                    </span>
                    <span className="text-body-sm font-semibold text-neutral-900">
                      Quản lý (Manager)
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-800">
                    ĐIỀU PHỐI
                  </span>
                </div>
                <p className="text-xs text-neutral-600 pl-6">
                  Lập kế hoạch Sprint, điều chỉnh cột Kanban, gán Epic và quản lý thành viên dự án.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="text-xs text-danger-600">
            {isAlreadyInProject && (
              <span className="flex items-center gap-1 font-medium">
                <Icon name="alert-circle" size={14} />
                Cần chọn tài khoản hợp lệ
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-body-sm font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCandidate || Boolean(isAlreadyInProject)}
              className="flex items-center gap-2 px-4 py-2 text-body-sm font-medium text-whiteboard bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Icon name="check" size={16} />
              {isSubmitting ? 'Đang thêm...' : 'Thêm thành viên'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
