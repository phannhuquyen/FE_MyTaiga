import { Icon } from '@/components/ui'

interface EmptyMetricsStateProps {
  onSwitchToSprint14: () => void
}

export function EmptyMetricsState({ onSwitchToSprint14 }: EmptyMetricsStateProps) {
  return (
    <div className="space-y-6">
      {/* Future sprint alert banner (S10-02) */}
      <div className="p-3.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <Icon name="info" size={15} className="text-primary-600 shrink-0" />
          <span>
            <strong>Đang chọn chu kỳ tương lai:</strong> Sprint 16 dự kiến khởi chạy ngày 18/11/2024.
            Hiện tại chưa có luồng dịch chuyển thẻ.
          </span>
        </div>
        <button
          type="button"
          onClick={onSwitchToSprint14}
          className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>Chuyển sang Sprint 14 đang hoạt động</span>
          <Icon name="arrow-right" size={13} />
        </button>
      </div>

      {/* Main Empty State Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-10 text-center shadow-2xs space-y-4">
        <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-700 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
          <Icon name="metrics" size={28} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Chưa có dữ liệu cho khoảng thời gian này
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Sprint 16 chưa bắt đầu hoặc chưa có tác vụ nào được di chuyển vào luồng{' '}
            <strong>Đang làm / Hoàn thành</strong> trong khoảng thời gian đã chọn. Vui lòng chọn chu
            kỳ khác hoặc quay lại sau khi đội ngũ bắt đầu thực hiện công việc.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSwitchToSprint14}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>► Xem Sprint 14 đang chạy</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToSprint14}
            className="px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>↺ Đặt lại bộ lọc về Sprint hiện tại</span>
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => alert('Quy chuẩn tính: Cycle Time = Completed Date - In Progress Date')}
            className="hover:text-primary-600 transition-colors flex items-center gap-1"
          >
            <Icon name="file-text" size={13} />
            <span>Tìm hiểu cách tính Flow Metrics</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => alert('Cấu hình cột đo lường: Chỉ đo lường In Progress, Testing, Done')}
            className="hover:text-primary-600 transition-colors flex items-center gap-1"
          >
            <Icon name="sliders" size={13} />
            <span>Cấu hình trạng thái cột tính toán</span>
          </button>
        </div>
      </div>

      {/* 3 Bottom Rule Cards (S10-02) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
            <Icon name="clock" size={15} className="text-teal-600" />
            <span>Quy tắc tính WIP</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
            Chỉ đếm các thẻ nằm giữa cột &ldquo;Bắt đầu làm&rdquo; (In Progress) và &ldquo;Sẵn sàng
            bàn giao&rdquo; (Done). Cột Backlog và Thùng rác bị loại trừ.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
            <Icon name="shield" size={15} className="text-teal-600" />
            <span>Độ chính xác dữ liệu</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
            Báo cáo tự động làm mới sau mỗi 15 phút từ luồng sự kiện Webhook của các bảng Kanban phân
            bổ trực tiếp.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
            <Icon name="sliders" size={15} className="text-teal-600" />
            <span>Giới hạn WIP Khuyến nghị</span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-[11px]">
            Đội ngũ hiện có 5 thành viên. Giới hạn luồng khuyến nghị tối ưu là không vượt quá 8 thẻ
            đang mở cùng một lúc.
          </p>
        </div>
      </div>
    </div>
  )
}
