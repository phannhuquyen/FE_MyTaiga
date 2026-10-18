import { useState, useEffect, useMemo, useId } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { memberService } from './services/memberService'
import type { Candidate, Department, Member, MemberRole } from './types'
import { AddMemberModal } from './components/AddMemberModal'
import { RemoveMemberModal } from './components/RemoveMemberModal'
import { MemberDetailDrawer } from './components/MemberDetailDrawer'
import { TransferDepartmentModal } from './components/TransferDepartmentModal'
import { AddDepartmentModal } from './components/AddDepartmentModal'
import { EditDepartmentModal } from './components/EditDepartmentModal'
import { DeleteDepartmentModal } from './components/DeleteDepartmentModal'
import { MemberRowActions } from './components/MemberRowActions'

const ITEMS_PER_PAGE = 5

export default function MembersPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter & Search states
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // View Mode: Manager (full permissions) vs Member (S4-11 limited read-only)
  const [isMemberView, setIsMemberView] = useState(false)
  // S4-12: Demo empty state toggle
  const [isDemoEmpty, setIsDemoEmpty] = useState(false)

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals & Drawer states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [memberToTransfer, setMemberToTransfer] = useState<Member | null>(null)
  const [memberForDetail, setMemberForDetail] = useState<Member | null>(null)
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false)
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null)
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)
  const deptSelectId = useId()
  const roleSelectId = useId()

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  // Refresh data after mutations
  const refreshData = async () => {
    const [deptsData, membersData, candidatesData] = await Promise.all([
      memberService.getDepartments(),
      memberService.getMembers(),
      memberService.getCandidates(),
    ])
    setDepartments(deptsData)
    setMembers(membersData)
    setCandidates(candidatesData)
  }

  useEffect(() => {
    let ignore = false
    async function init() {
      const [deptsData, membersData, candidatesData] = await Promise.all([
        memberService.getDepartments(),
        memberService.getMembers(),
        memberService.getCandidates(),
      ])
      if (!ignore) {
        setDepartments(deptsData)
        setMembers(membersData)
        setCandidates(candidatesData)
        setIsLoading(false)
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  // Filter members based on criteria
  const filteredMembers = useMemo(() => {
    if (isDemoEmpty) return []

    return members.filter((m) => {
      // Department filter
      if (selectedDeptId !== 'all' && m.departmentId !== selectedDeptId) {
        return false
      }
      // Role filter
      if (selectedRole !== 'all' && m.role !== selectedRole) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.departmentName.toLowerCase().includes(q) ||
          m.roleTitle.toLowerCase().includes(q) ||
          (m.employeeCode && m.employeeCode.toLowerCase().includes(q))
        if (!matches) return false
      }
      return true
    })
  }, [members, selectedDeptId, selectedRole, searchQuery, isDemoEmpty])

  // Pagination slice
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE) || 1
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedMembers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMembers, safeCurrentPage])

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedDeptId('all')
    setSelectedRole('all')
    setSearchQuery('')
    setIsDemoEmpty(false)
    setCurrentPage(1)
  }

  const handleSelectDept = (deptId: string) => {
    setSelectedDeptId(deptId)
    setCurrentPage(1)
  }

  const handleSelectRole = (role: string) => {
    setSelectedRole(role)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleToggleDemoEmpty = () => {
    setIsDemoEmpty((prev) => !prev)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedDeptId !== 'all' || selectedRole !== 'all' || Boolean(searchQuery.trim())

  // Member CRUD actions
  const handleAddMember = async (
    candidateId: string,
    departmentId: string,
    role: MemberRole,
  ) => {
    const newMember = await memberService.addMember({
      candidateId,
      departmentId,
      role,
    })
    await refreshData()
    showToast(`Đã thêm thành viên ${newMember.name} vào dự án thành công`)
  }

  const handleRemoveMember = async (memberId: string, reassignToLead: boolean) => {
    const res = await memberService.removeMember(memberId, reassignToLead)
    await refreshData()
    showToast(`Đã loại bỏ ${res.removedName} khỏi dự án`)
  }

  const handleTransferDepartment = async (memberId: string, newDepartmentId: string) => {
    const updated = await memberService.transferDepartment({
      memberId,
      newDepartmentId,
    })
    await refreshData()
    showToast(`Đã chuyển ${updated.name} sang phòng ban ${updated.departmentName}`)
  }

  // Department CRUD actions
  const handleAddDepartment = async (payload: {
    name: string
    description?: string
    leadId?: string
    color?: string
  }) => {
    const newDept = await memberService.addDepartment(payload)
    await refreshData()
    showToast(`Đã tạo phòng ban ${newDept.name} thành công`)
  }

  const handleUpdateDepartment = async (
    id: string,
    payload: {
      name: string
      description?: string
      leadId?: string
      color?: string
    },
  ) => {
    const updated = await memberService.updateDepartment(id, payload)
    await refreshData()
    showToast(`Đã cập nhật thông tin phòng ban ${updated.name}`)
  }

  const handleDeleteDepartment = async (id: string) => {
    const res = await memberService.deleteDepartment(id)
    await refreshData()
    showToast(`Đã xóa phòng ban ${res.deptName}. ${res.affectedCount} nhân sự chuyển về Chưa phân phòng ban.`)
  }

  return (
    <div className="min-h-full bg-paper p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-neutral-900 text-whiteboard shadow-xl border border-neutral-700 animate-slide-left text-body-sm font-medium">
          <Icon name="check-circle" size={18} className="text-success-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-neutral-400 hover:text-whiteboard"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-body-sm text-neutral-500">
        <Link to="/projects" className="hover:text-primary-600 transition-colors">
          Dự án
        </Link>
        <span>&rsaquo;</span>
        <span className="text-neutral-700 font-medium">ScrumBan Core Platform</span>
        <span>&rsaquo;</span>
        <span className="text-neutral-900 font-semibold">Thành viên</span>
      </nav>

      {/* S4-11: Member's View Limited Banner */}
      {isMemberView && (
        <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 flex items-start justify-between gap-4 animate-fade-in shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="eye" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                  CHẾ ĐỘ XEM THÀNH VIÊN (MEMBER&apos;S VIEW)
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <span className="text-xs text-neutral-600 font-medium">Chỉ đọc &amp; Theo dõi</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1 leading-normal">
                Bạn đang xem danh sách nhân sự với quyền hạn Thành viên. Các tính năng quản trị
                (Thêm thành viên, Chuyển phòng ban, Xóa nhân sự, Sửa phòng ban) được bảo vệ và ẩn
                khỏi giao diện này.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMemberView(false)}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 shrink-0 transition-colors cursor-pointer"
          >
            Trở lại quyền Quản lý
          </button>
        </div>
      )}

      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-medium font-bold text-neutral-900 tracking-tight">
              Thành viên dự án
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200/80 text-neutral-700">
              {members.length} thành viên
            </span>
          </div>
          <p className="text-body-sm text-neutral-600 mt-1">
            Quản lý nhân sự và cơ cấu phòng ban trực thuộc dự án ScrumBan Core Platform
          </p>
        </div>

        {/* Top Control Bar: Demo mode toggles & Add member CTA */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* S4-11 & S4-12 Toggle pills for visual verification */}
          <button
            type="button"
            onClick={() => setIsMemberView((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isMemberView
                ? 'bg-neutral-800 text-whiteboard border-neutral-800'
                : 'bg-whiteboard text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
            title="Chuyển đổi giao diện thành viên giới hạn quyền (S4-11)"
          >
            <Icon name="eye" size={14} />
            <span>{isMemberView ? 'Chế độ: Thành viên' : 'Xem dạng Thành viên'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleDemoEmpty}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDemoEmpty
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-whiteboard text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
            title="Bật/tắt trạng thái rỗng mẫu (S4-12)"
          >
            <Icon name="refresh" size={14} />
            <span>{isDemoEmpty ? 'Thoát rỗng mẫu' : 'Mục rỗng mẫu'}</span>
          </button>

          {!isMemberView && (
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-whiteboard text-body-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Icon name="user-plus" size={16} />
              <span>Thêm thành viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Phòng ban Panel */}
        <div className="lg:col-span-1 bg-whiteboard rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <span className="font-bold text-body-medium text-neutral-900">Phòng ban</span>
            {!isMemberView && (
              <button
                type="button"
                onClick={() => setIsAddDeptOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
              >
                <Icon name="plus" size={14} />
                <span>Thêm</span>
              </button>
            )}
          </div>

          <div className="p-2 space-y-1">
            {/* All Departments Item */}
            <button
              type="button"
              onClick={() => handleSelectDept('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
                selectedDeptId === 'all'
                  ? 'bg-primary-50 text-primary-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-100/70'
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  selectedDeptId === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {members.length}
              </span>
            </button>

            {/* Department Items */}
            {departments.map((dept) => {
              const isSelected = selectedDeptId === dept.id
              const count = members.filter((m) => m.departmentId === dept.id).length

              return (
                <div
                  key={dept.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-body-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50 text-primary-900 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100/70'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDept(dept.id)}
                    className="flex-1 text-left truncate flex items-center gap-2"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="truncate">{dept.name}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isSelected
                          ? 'bg-primary-100 text-primary-800 font-semibold'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {count}
                    </span>
                    {!isMemberView && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeptToEdit(dept)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 rounded transition-opacity"
                        title="Chỉnh sửa phòng ban"
                      >
                        <Icon name="edit" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Members Table Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* S4-06: Filter and Search Bar */}
          <div className="bg-whiteboard p-3.5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-0">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm theo tên hoặc phòng ban..."
                  className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>

              {/* Department Dropdown */}
              <div className="sm:w-52">
                <select
                  id={deptSelectId}
                  value={selectedDeptId}
                  onChange={(e) => handleSelectDept(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-800 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Dropdown */}
              <div className="sm:w-44">
                <select
                  id={roleSelectId}
                  value={selectedRole}
                  onChange={(e) => handleSelectRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-body-sm text-neutral-800 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="manager">Quản lý (Manager)</option>
                  <option value="member">Thành viên (Member)</option>
                  <option value="lead">Trưởng nhóm (Lead)</option>
                </select>
              </div>

              {/* Reset / Refresh Button */}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="p-2 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors shrink-0 cursor-pointer"
                title="Làm mới bộ lọc"
                aria-label="Làm mới bộ lọc"
              >
                <Icon name="refresh" size={16} />
              </button>
            </div>

            {/* Active Filters Tag Bar (S4-06) */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100 text-xs">
                <span className="text-neutral-500 font-medium">Đang lọc:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                    Từ khóa: &quot;{searchQuery}&quot;
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="text-neutral-400 hover:text-neutral-700 ml-0.5"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                )}
                {selectedDeptId !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                    Phòng ban: {departments.find((d) => d.id === selectedDeptId)?.name}
                    <button
                      type="button"
                      onClick={() => handleSelectDept('all')}
                      className="text-primary-600 hover:text-primary-900 ml-0.5"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                )}
                {selectedRole !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                    Vai trò: {selectedRole === 'manager' ? 'Quản lý' : 'Thành viên'}
                    <button
                      type="button"
                      onClick={() => handleSelectRole('all')}
                      className="text-neutral-400 hover:text-neutral-700 ml-0.5"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-primary-600 hover:text-primary-800 hover:underline font-semibold ml-auto cursor-pointer"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-whiteboard rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="py-16 text-center text-neutral-500 space-y-3">
                <div className="w-8 h-8 mx-auto border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-body-sm">Đang tải dữ liệu thành viên...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              /* S4-12 Empty State */
              <div className="py-16 px-4 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Icon name="users" size={32} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-title-small font-bold text-neutral-900">
                    {hasActiveFilters
                      ? 'Không tìm thấy thành viên phù hợp'
                      : 'Chưa có thành viên nào trong dự án'}
                  </h3>
                  <p className="text-body-sm text-neutral-500 mt-1">
                    {hasActiveFilters
                      ? 'Không có thành viên nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử lại với từ khóa khác.'
                      : 'Bắt đầu mời các kỹ sư, chuyên viên thiết kế và quản lý tham gia vào không gian làm việc này.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-body-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Xóa toàn bộ bộ lọc
                    </button>
                  ) : (
                    !isMemberView && (
                      <button
                        type="button"
                        onClick={() => setIsAddMemberOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-whiteboard text-body-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <Icon name="user-plus" size={16} />
                        <span>Mời thành viên đầu tiên</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      <th scope="col" className="px-5 py-3.5">
                        Họ tên &amp; Vai trò
                      </th>
                      <th scope="col" className="px-5 py-3.5">
                        Email
                      </th>
                      <th scope="col" className="px-5 py-3.5">
                        Phòng ban
                      </th>
                      <th scope="col" className="px-5 py-3.5">
                        Ngày tham gia
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {paginatedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        {/* Member Identity & Role */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setMemberForDetail(member)}
                              className="relative cursor-pointer group-hover:opacity-90"
                              title="Xem chi tiết"
                            >
                              <div className="w-9 h-9 rounded-full bg-neutral-800 text-whiteboard font-semibold text-xs flex items-center justify-center shrink-0">
                                {member.avatarCode}
                              </div>
                              <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-whiteboard ${
                                  member.isOnline ? 'bg-success-500' : 'bg-neutral-400'
                                }`}
                              />
                            </button>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setMemberForDetail(member)}
                                className="font-semibold text-body-sm text-neutral-900 hover:text-primary-700 truncate block text-left cursor-pointer"
                              >
                                {member.name}
                              </button>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                    member.role === 'manager'
                                      ? 'bg-primary-100 text-primary-800'
                                      : 'bg-neutral-100 text-neutral-700'
                                  }`}
                                >
                                  {member.role === 'manager'
                                    ? 'Quản lý'
                                    : member.role === 'lead'
                                      ? 'Trưởng nhóm'
                                      : 'Thành viên'}
                                </span>
                                <span className="text-xs text-neutral-500 truncate">
                                  {member.roleTitle}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5 text-body-sm text-neutral-600">
                          {member.email}
                        </td>

                        {/* Department */}
                        <td className="px-5 py-3.5">
                          <span className="text-body-sm font-medium text-neutral-800">
                            {member.departmentName}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td className="px-5 py-3.5 text-body-sm text-neutral-500">
                          {member.joinDate}
                        </td>

                        {/* Action Menu */}
                        <td className="px-4 py-3.5 text-right">
                          <MemberRowActions
                            member={member}
                            onViewDetails={(m) => setMemberForDetail(m)}
                            onTransfer={(m) => setMemberToTransfer(m)}
                            onRemove={(m) => setMemberToRemove(m)}
                            isReadOnly={isMemberView}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredMembers.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/70 border-t border-neutral-200 text-xs text-neutral-600 flex-wrap gap-2">
                <div>
                  Hiển thị{' '}
                  <span className="font-semibold text-neutral-900">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}
                  </span>{' '}
                  trong số{' '}
                  <span className="font-semibold text-neutral-900">
                    {filteredMembers.length}
                  </span>{' '}
                  thành viên
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-neutral-300 bg-whiteboard hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded border text-xs font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 border-primary-600 text-whiteboard'
                            : 'bg-whiteboard border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-neutral-300 bg-whiteboard hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawer */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        departments={departments}
        candidates={candidates}
        onAddMember={handleAddMember}
      />

      <RemoveMemberModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        onConfirmRemove={handleRemoveMember}
      />

      <TransferDepartmentModal
        isOpen={Boolean(memberToTransfer)}
        onClose={() => setMemberToTransfer(null)}
        member={memberToTransfer}
        departments={departments}
        onConfirmTransfer={handleTransferDepartment}
      />

      <MemberDetailDrawer
        isOpen={Boolean(memberForDetail)}
        onClose={() => setMemberForDetail(null)}
        member={memberForDetail}
        onOpenTransfer={(m) => {
          setMemberForDetail(null)
          setMemberToTransfer(m)
        }}
        onOpenRemove={(m) => {
          setMemberForDetail(null)
          setMemberToRemove(m)
        }}
        isReadOnly={isMemberView}
      />

      <AddDepartmentModal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
        members={members}
        onAddDepartment={handleAddDepartment}
      />

      <EditDepartmentModal
        isOpen={Boolean(deptToEdit)}
        onClose={() => setDeptToEdit(null)}
        department={deptToEdit}
        members={members}
        onUpdateDepartment={handleUpdateDepartment}
        onTriggerDelete={(dept) => {
          setDeptToEdit(null)
          setDeptToDelete(dept)
        }}
      />

      <DeleteDepartmentModal
        isOpen={Boolean(deptToDelete)}
        onClose={() => setDeptToDelete(null)}
        department={deptToDelete}
        members={members}
        onConfirmDelete={handleDeleteDepartment}
      />
    </div>
  )
}
