"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"
import type { User } from "@/types/user"

type UserAvatarProps = {
  user: User | undefined
  size?: number
  className?: string
}

export function UserAvatar({ user, size = 24, className }: UserAvatarProps) {
  // Provider avatar URLs go stale — the account is unlinked, the image is
  // removed — so a failed load falls back to the initial rather than leaving
  // a broken image icon in the header.
  const [failed, setFailed] = useState(false)

  const initial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()
  const showImage = user?.avatarUrl && !failed

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={user.avatarUrl!}
          alt={user.name ?? user.email}
          width={size}
          height={size}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  )
}
