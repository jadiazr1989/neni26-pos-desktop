"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UsersTable } from "./ui/UsersTable";
import { UserDialog } from "./ui/UserDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TriStateFilterBar } from "@/components/shared/TriStateFilterBar";

import { useUsersScreenController } from "./hooks/useUsersScreenController";

export function UsersScreen() {
  const c = useUsersScreenController();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de usuarios (CRUD) con paginación.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void c.refresh()} disabled={c.busy}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={c.openCreate} variant="outline" disabled={c.busy}>
            <Plus className="mr-2 size-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <TriStateFilterBar
            search={c.search}
            onSearchChange={c.setSearch}
            onSearchSubmit={() => void c.refresh()}
            placeholder="Buscar por username / role…"
            searchButtonText="Buscar"
            filter={c.filter}
            onFilterChange={c.setFilter}
            counts={c.counts}
            busy={c.busy}
          />

          <UsersTable
            rows={c.rows}
            loading={c.busy}
            hasMore={c.hasMore}
            loadMore={c.loadMore}
            onEdit={c.openEdit}
            onToggleActive={c.requestToggleActive}
          />
        </CardContent>
      </Card>

      <UserDialog
        open={c.dialogOpen}
        mode={c.dialogMode}
        initial={c.selected}
        loading={c.busy}
        onOpenChange={c.setDialogOpen}
        onSubmit={c.submit}
      />

      <ConfirmDialog
        open={!!c.confirmToggle}
        onOpenChange={(v) => !v && c.setConfirmToggle(null)}
        title={c.confirmToggle?.isActive ? "Desactivar usuario" : "Reactivar usuario"}
        description={
          c.confirmToggle
            ? c.confirmToggle.isActive
              ? `Desactivar “${c.confirmToggle.username}”. El usuario no podrá iniciar sesión.`
              : `Reactivar “${c.confirmToggle.username}”. El usuario podrá iniciar sesión nuevamente.`
            : undefined
        }
        confirmText={c.confirmToggle?.isActive ? "Desactivar" : "Reactivar"}
        destructive={!!c.confirmToggle?.isActive}
        busy={c.busy}
        onConfirm={c.confirmToggleNow}
      />
    </div>
  );
}
