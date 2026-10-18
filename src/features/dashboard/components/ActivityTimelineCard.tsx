import { Icon } from '@/components/ui'
import type { ActivityItem } from '../types'

export interface ActivityTimelineCardProps {
  activities: ActivityItem[]
}

export function ActivityTimelineCard({
  activities,
}: ActivityTimelineCardProps) {
  return (
    <section className="bg-whiteboard rounded-lg border border-neutral-200 p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
        <h2 className="text-headline-sm font-semibold text-neutral-900 flex items-center gap-2">
          <Icon name="clock" size={16} className="text-neutral-500" />
          <span>Lịch sử cập nhật dự án</span>
        </h2>
        <span className="text-body-sm text-neutral-500 font-medium">Hôm nay</span>
      </div>

      {/* Activity List */}
      <div className="space-y-3.5">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 text-body-sm">
            {/* Avatar Circle */}
            <div className="w-7 h-7 rounded-full bg-neutral-800 text-whiteboard flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 shadow-xs">
              {item.avatarCode}
            </div>

            {/* Content & Timestamp */}
            <div className="flex-1 min-w-0">
              <p className="text-neutral-700 leading-snug">
                <span className="font-semibold text-neutral-900">
                  {item.author}{' '}
                </span>
                <span>{item.action} </span>
                {item.targetCode && (
                  <span className="font-semibold text-primary-700 bg-primary-50 px-1 rounded">
                    {item.targetCode}
                  </span>
                )}
                {item.targetTitle && <span> {item.targetTitle} </span>}
                {item.targetState && (
                  <span className="font-medium text-warning-700">
                    {' '}
                    ● {item.targetState}
                  </span>
                )}
              </p>
              <span className="text-[12px] text-neutral-400 mt-0.5 block">
                {item.timeAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
