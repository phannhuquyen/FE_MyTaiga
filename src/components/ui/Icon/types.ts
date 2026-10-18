import type { SVGAttributes } from 'react'

/**
 * Union of all supported stable icon names in Taiga ScrumBan Flow.
 */
export type IconName =
  // ── Navigation ──
  | 'dashboard'
  | 'kanban'
  | 'backlog'
  | 'sprint'
  | 'epic'
  | 'bug'
  | 'metrics'
  | 'members'
  | 'chat'
  | 'settings'
  | 'shield'

  // ── Actions & Controls ──
  | 'search'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'menu'
  | 'more-horizontal'
  | 'more-vertical'
  | 'check'
  | 'filter'
  | 'sliders'
  | 'sort'
  | 'send'
  | 'external-link'
  | 'paperclip'
  | 'download'
  | 'refresh'
  | 'copy'
  | 'mail'
  | 'log-out'
  | 'help-circle'
  | 'camera'
  | 'upload'
  | 'phone'
  | 'minus'
  | 'sparkles'
  | 'folder-plus'
  | 'user-plus'
  | 'user-minus'

  // ── Directionals ──
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevrons-up-down'
  | 'arrow-right'
  | 'arrow-left'

  // ── Status, Indicators & Metadata ──
  | 'bell'
  | 'calendar'
  | 'clock'
  | 'user'
  | 'users'
  | 'flag'
  | 'tag'
  | 'folder'
  | 'lock'
  | 'unlock'
  | 'eye'
  | 'eye-off'
  | 'check-circle'
  | 'alert-triangle'
  | 'alert-circle'
  | 'info'
  | 'message-square'
  | 'file-text'
  | 'pin'
  | 'hash'
  | 'smile'
  | 'at-sign'
  | 'archive'

export type IconCategory =
  | 'navigation'
  | 'action'
  | 'direction'
  | 'status'
  | 'meta'

export interface IconDefinition {
  /** SVG viewBox attribute. Defaults to '0 0 24 24' */
  viewBox?: string
  /** Whether the icon is primarily filled or stroked. Default is 'stroke' */
  renderType?: 'stroke' | 'fill' | 'custom'
  /** Render function returning SVG paths/elements */
  render: (props: { color?: string }) => React.ReactNode
  /** Descriptive Vietnamese label */
  label: string
  /** Category grouping */
  category: IconCategory
  /** Whether this is a temporary fallback icon awaiting official Figma export */
  isTemporary: boolean
}

export interface IconProps extends Omit<SVGAttributes<SVGElement>, 'name' | 'color'> {
  /** Stable identifier of the icon */
  name: IconName
  /** Size in pixels (number) or CSS string (e.g. 20, '1.25rem', '100%') */
  size?: number | string
  /**
   * Optional direct color override (e.g. '#076859', 'var(--color-primary-500)').
   * If omitted, inherits currentColor, allowing Tailwind text utilities (e.g. 'text-neutral-500').
   */
  color?: string
  /** Additional CSS class names (Tailwind classes) */
  className?: string
  /** Accessible label for screen readers. When provided, decorative is automatically false */
  'aria-label'?: string
  /** Tooltip title element */
  title?: string
  /**
   * Whether the icon is purely decorative (hides from screen readers).
   * Defaults to true unless `aria-label` or `title` is supplied.
   */
  decorative?: boolean
}
