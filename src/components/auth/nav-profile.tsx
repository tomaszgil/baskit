'use client'

import { BadgeCheck, LogOut, Settings2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { api } from '~/convex/_generated/api'
import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'

function getInitials(name: string) {
  if (name.length === 0) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) {
    return parts[0][0]
  }
  return parts[0][0] + parts[parts.length - 1][0]
}

export function NavProfile() {
  const user = useQuery(api.users.viewer)
  const { signOut } = useAuthActions()

  if (!user) return <Skeleton className="h-8 w-8 rounded-lg" />

  const fallback = getInitials(user.name ?? '')
  const avatar = (
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
    </Avatar>
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          {avatar}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side="bottom"
        align="end"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            {avatar}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings2 />
            Preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
