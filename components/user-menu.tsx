"use client";

import { UserButton } from "@stackframe/stack";
import { useUser } from "@stackframe/stack";

export function UserMenu() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-right">
        <div className="font-medium">{user.displayName || "Usuario"}</div>
        <div className="text-muted-foreground text-xs">{user.primaryEmail}</div>
      </div>
      <UserButton />
    </div>
  );
}

