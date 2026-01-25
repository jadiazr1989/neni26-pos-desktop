import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { UserDTO } from "@/lib/modules/users/user.dto";
import React from "react";

function RoleBadge({ role }: { role: UserDTO["role"] }) {
  return <Badge variant="secondary">{role}</Badge>;
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "ACTIVE" : "INACTIVE"}
    </Badge>
  );
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

export function UsersTable({
  rows,
  loading,
  hasMore,
  loadMore,
  onEdit,
  onToggleActive,
  height = 520,
}: {
  rows: UserDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onEdit: (u: UserDTO) => void;
  onToggleActive: (u: UserDTO) => void;
  height?: number;
}) {
  const columns = React.useMemo<VirtualColumnDef<UserDTO>[]>(() => [
    {
      key: "username",
      header: "Username",
      className: "col-span-4 font-medium truncate",
      render: (u) => (
        <div className="flex items-center gap-2">
          <span>{u.username}</span>
          {u.isSystem && <SystemBadge />}
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
      className: "col-span-3",
      render: (u) => <ActiveBadge isActive={u.isActive} />,
    },
    {
      key: "actions",
      header: <span className="block text-right">Acc.</span>,
      className: "col-span-2",
      render: (u) => (
        <RowActions
          onEdit={() => onEdit(u)}
          onToggle={() => onToggleActive(u)}
          hideToggle={u.isSystem}
          loading={loading}
          toggleConfirm={{
            title: u.isActive ? "Desactivar usuario" : "Reactivar usuario",
            message: u.isActive
              ? "El usuario no podrá iniciar sesión."
              : "El usuario podrá iniciar sesión nuevamente.",
            confirmText: u.isActive ? "Desactivar" : "Reactivar",
            destructive: u.isActive,
          }}
        />
      ),
    },
  ], [loading, onEdit, onToggleActive]);

  return (
    <VirtualDataTable
      rows={rows}
      columns={columns}
      rowKey={(u) => u.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={hasMore}
      onEndReached={loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin usuarios.</span>}
    />
  );
}
