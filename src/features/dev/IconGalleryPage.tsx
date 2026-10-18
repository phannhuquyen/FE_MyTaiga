import { useState } from 'react'
import {
  Icon,
  getAllIconNames,
  getIconDefinition,
  type IconCategory,
  type IconName,
} from '@/components/ui/Icon'
import { Badge, Button } from '@/components/ui'

const CATEGORY_LABELS: Record<IconCategory | 'all', string> = {
  all: 'Tất cả icon',
  navigation: 'Điều hướng',
  action: 'Hành động & Thao tác',
  direction: 'Mũi tên & Hướng',
  status: 'Trạng thái & Cảnh báo',
  meta: 'Chỉ số & Siêu dữ liệu',
}

export default function IconGalleryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | 'all'>('all')
  const [demoSize, setDemoSize] = useState<number>(20)
  const [demoColor, setDemoColor] = useState<string>('currentColor')
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const allNames = getAllIconNames()

  const filteredNames = allNames.filter((name) => {
    const def = getIconDefinition(name)
    const matchesCategory =
      selectedCategory === 'all' || def.category === selectedCategory
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.label.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const copyToClipboard = (name: IconName) => {
    const code = `<Icon name="${name}" size={${demoSize}} />`
    navigator.clipboard.writeText(code)
    setCopiedName(name)
    setTimeout(() => setCopiedName(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-whiteboard border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-headline-md font-semibold text-neutral-900">
                Thư viện Icon Hệ thống (Taiga Icon Registry)
              </h1>
              <Badge variant="primary">
                {allNames.length} icons
              </Badge>
            </div>
            <p className="mt-1 text-body-sm text-neutral-500">
              Hệ thống SVG icon tập trung, tương thích Tailwind CSS v4, hỗ trợ thay thế linh hoạt cho Figma assets.
            </p>
          </div>

          <div className="flex items-center gap-2 text-body-sm text-neutral-600 bg-paper-100 p-2 rounded-md">
            <Icon name="info" size={16} className="text-info-500" />
            <span>Nhấp vào icon để sao chép cú pháp code JSX</span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc nhãn..."
              className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-whiteboard border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as IconCategory | 'all')}
            className="px-3 py-1.5 text-body-sm bg-whiteboard border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-neutral-800"
          >
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
              <option key={cat} value={cat}>
                {label}
              </option>
            ))}
          </select>

          {/* Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-neutral-500 shrink-0">Cỡ demo:</span>
            {[16, 20, 24, 32].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDemoSize(s)}
                className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  demoSize === s
                    ? 'bg-primary-500 text-whiteboard border-primary-500 font-semibold'
                    : 'bg-whiteboard text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {s}px
              </button>
            ))}
          </div>

          {/* Color Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-body-sm text-neutral-500 shrink-0">Màu:</span>
            {[
              { label: 'Default', value: 'currentColor', bg: 'bg-neutral-700' },
              { label: 'Primary', value: '#076859', bg: 'bg-primary-500' },
              { label: 'Success', value: '#107e3e', bg: 'bg-success-500' },
              { label: 'Danger', value: '#b52a2a', bg: 'bg-danger-500' },
              { label: 'Warning', value: '#bd6a00', bg: 'bg-warning-500' },
              { label: 'Info', value: '#0c6ca8', bg: 'bg-info-500' },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setDemoColor(c.value)}
                className={`w-6 h-6 rounded-full ${c.bg} transition-transform cursor-pointer ${
                  demoColor === c.value
                    ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredNames.map((name) => {
          const def = getIconDefinition(name)
          const isCopied = copiedName === name

          return (
            <button
              key={name}
              type="button"
              onClick={() => copyToClipboard(name)}
              className="group relative flex flex-col items-center justify-center p-4 bg-whiteboard hover:bg-paper-50 border border-neutral-200 hover:border-primary-500 rounded-lg transition-all text-center cursor-pointer shadow-xs"
            >
              {/* Temporary badge */}
              {def.isTemporary && (
                <span className="absolute top-1.5 right-1.5 px-1 py-0.5 text-[9px] font-semibold bg-neutral-100 text-neutral-500 rounded">
                  temp
                </span>
              )}

              {/* Icon render */}
              <div
                className="flex items-center justify-center transition-transform group-hover:scale-110 text-neutral-800"
                style={{
                  height: 40,
                  color: demoColor === 'currentColor' ? undefined : demoColor,
                }}
              >
                <Icon
                  name={name}
                  size={demoSize}
                  color={demoColor === 'currentColor' ? undefined : demoColor}
                />
              </div>

              {/* Icon Name */}
              <span className="mt-2 text-xs font-semibold text-neutral-800 group-hover:text-primary-600 truncate w-full">
                {name}
              </span>

              {/* Vietnamese Label */}
              <span className="text-[11px] text-neutral-400 truncate w-full">
                {def.label}
              </span>

              {/* Copy Feedback */}
              {isCopied && (
                <div className="absolute inset-0 bg-primary-500/90 text-whiteboard flex items-center justify-center rounded-lg text-xs font-semibold backdrop-blur-xs transition-opacity animate-in fade-in">
                  Đã chép JSX!
                </div>
              )}
            </button>
          )
        })}
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-12 bg-whiteboard border border-neutral-200 rounded-lg">
          <Icon name="search" size={32} className="text-neutral-400 mx-auto mb-2" />
          <p className="text-body-medium text-neutral-600 font-medium">
            Không tìm thấy icon nào khớp với "{searchTerm}"
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
            }}
            className="mt-3"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
