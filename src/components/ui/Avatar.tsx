import { useState } from 'react'

/** Fits the existing avatar container and preserves initials on failed delivery. */
export function Avatar({ src, name, fallback }: { src?: string | null; name?: string; fallback: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const url = src?.trim()
  const usable = url && (/^https?:\/\//i.test(url) || url.startsWith('/'))
  return usable && failedSrc !== url ? (
    <img src={url} alt={name || 'Ảnh đại diện'} loading="lazy" decoding="async"
      className="w-full h-full rounded-[inherit] object-cover" onError={() => setFailedSrc(url)} />
  ) : <>{fallback}</>
}
