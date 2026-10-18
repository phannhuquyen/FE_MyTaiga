import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { getIconDefinition } from './registry'
import type { IconProps } from './types'

/**
 * Shared SVG Icon component for MyTaiga.
 *
 * Precedence rules:
 * - Color: If `color` prop is specified, it applies inline `style={{ color }}`.
 *   Otherwise, inherits `currentColor`, which is controlled via Tailwind text
 *   utilities (e.g., `className="text-neutral-500 hover:text-primary-600"`).
 * - Size: If `size` prop is provided (e.g. `size={20}` or `size="1.5rem"`), it sets
 *   explicit inline `width` and `height`. Otherwise, size can be set via Tailwind
 *   classes in `className` (e.g., `className="w-4 h-4"`).
 * - Accessibility: Decorative by default (`aria-hidden="true"`). When `aria-label`
 *   or `title` is provided, it automatically switches to `role="img"` and `aria-hidden="false"`.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size,
      color,
      className,
      style,
      'aria-label': ariaLabel,
      title,
      decorative,
      ...restProps
    },
    ref,
  ) => {
    const def = getIconDefinition(name)

    // Compute dimensions if size is provided
    const dimension =
      typeof size === 'number'
        ? `${size}px`
        : typeof size === 'string'
          ? size
          : undefined

    // Determine accessibility state
    const isMeaningful = Boolean(ariaLabel || title)
    const isDecorative = decorative ?? !isMeaningful

    // Combine inline styles
    const computedStyle: React.CSSProperties = {
      ...(color ? { color } : {}),
      ...(dimension ? { width: dimension, height: dimension } : {}),
      ...style,
    }

    const renderType = def.renderType ?? 'stroke'

    return (
      <svg
        ref={ref}
        viewBox={def.viewBox ?? '0 0 24 24'}
        fill={renderType === 'fill' ? 'currentColor' : 'none'}
        stroke={renderType === 'fill' ? 'none' : 'currentColor'}
        preserveAspectRatio="xMidYMid meet"
        className={cn('inline-block shrink-0', className)}
        style={computedStyle}
        role={isDecorative ? undefined : 'img'}
        aria-hidden={isDecorative ? true : undefined}
        aria-label={ariaLabel}
        {...restProps}
      >
        {title && <title>{title}</title>}
        {def.render({ color })}
      </svg>
    )
  },
)

Icon.displayName = 'Icon'
