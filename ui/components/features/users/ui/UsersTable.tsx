"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { UserDTO } from "@/lib/modules/users/user.dto";

function RoleBadge({ role }: { role: UserDTO["role"] }) {
  return <Badge variant="secondary">{role}</Badge>;
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>;
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

function rowClassName(args: { selected: boolean; inactive?: boolean }) {
  return [
    "cursor-pointer",
    "hover:bg-muted/40",
    args.inactive ? "opacity-70" : "",
    args.selected ? "bg-muted/60 ring-1 ring-ring" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type Props = {
  rows: UserDTO[];
  loading: boolean;

  height?: number;

  hasMore?: boolean;
  loadMore?: () => void;

  selectedId?: string | null;
  onRowClick?: (u: UserDTO) => void;
};

export function UsersTable({
  rows,
  loading,
  height = 520,
  hasMore = false,
  loadMore,
  selectedId,
  onRowClick,
}: Props) {
  const columns = React.useMemo<VirtualColumnDef<UserDTO>[]>(
    () => [
      {
        key: "username",
        header: "Username",
        className: "col-span-5",
        render: (u) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{u.username}</span>
            {u.isSystem ? <SystemBadge /> : null}
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        className: "col-span-3",
        render: (u) => <RoleBadge role={u.role} />,
      },
      {
        key: "state",
        header: "Estado",
        className: "col-span-4",
        render: (u) => <ActiveBadge isActive={u.isActive} />,
      },
    ],
    []
  );

  return (
    <VirtualDataTable<UserDTO>
      rows={rows}
      columns={columns}
      rowKey={(u) => u.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={hasMore}
      onEndReached={hasMore ? loadMore : undefined}
      empty={<span className="text-sm text-muted-foreground">Sin usuarios.</span>}
      onRowClick={onRowClick}
      getRowClassName={(u) =>
        rowClassName({
          selected: Boolean(selectedId && u.id === selectedId),
          inactive: !u.isActive,
        })
      }
    />
  );
}