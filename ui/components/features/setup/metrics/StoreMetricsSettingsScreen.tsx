"use client";

import type { JSX } from "react";
import {
  Activity,
  RefreshCcw,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStoreMetricsSettings } from "./hooks/useStoreMetricsSettings";
import { SettingsIntroCard } from "./ui/SettingsIntroCard";
import { InventoryThresholdsCard } from "./ui/InventoryThresholdsCard";
import { DashboardAlertsCard } from "./ui/DashboardAlertsCard";
import { InventoryWeaknessesCard } from "./ui/InventoryWeaknessesCard";
import { DashboardHealthConfigCard } from "./ui/DashboardHealthConfigCard";

function SectionHeader(props: {
  icon: JSX.Element;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {props.icon}
        <h2 className="text-base font-semibold">{props.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </div>
  );
}

export function StoreMetricsSettingsScreen(): JSX.Element {
  const {
    settings,
    loading,
    refreshing,
    error,
    reload,
    updateInventoryLowStockThresholds,
    updateDashboardAlertsThresholds,
    updateInventoryDashboardWeaknesses,
    updateDashboardHealthConfig,
  } = useStoreMetricsSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Métricas de la tienda</h1>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ajusta alertas, niveles de inventario y parámetros de análisis para
            entender mejor cómo está funcionando el negocio.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void reload()}
            disabled={loading || refreshing}
          >
            <RefreshCcw className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refrescar
          </Button>
        </div>
      </div>

      <SettingsIntroCard
        title="Configuración del negocio"
        description={
          <>
            Aquí puedes ajustar cómo funciona el sistema para controlar
            inventario, alertas y análisis del negocio.
            <br />
            Si no estás segura de un valor, es mejor no cambiarlo.
          </>
        }
      />

      {loading ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Cargando configuración de métricas...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!loading && settings ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <SectionHeader
              icon={<ShieldAlert className="size-5 text-muted-foreground" />}
              title="Configuración básica"
              description="Opciones principales para controlar inventario y alertas del negocio."
            />

            <div className="grid gap-4">
              <InventoryThresholdsCard
                value={settings.inventoryLowStockThresholds}
                details={settings.inventoryLowStockThresholdsDetails}
                onSubmit={updateInventoryLowStockThresholds}
                onRefresh={reload}
              />
              <DashboardAlertsCard
                value={settings.dashboardAlertsThresholds}
                onSubmit={updateDashboardAlertsThresholds}
                onRefresh={reload}
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={<SlidersHorizontal className="size-5 text-muted-foreground" />}
              title="Configuración avanzada"
              description="Opciones más técnicas para el análisis del inventario y la salud general del negocio."
            />

            <div className="grid gap-4">
              <InventoryWeaknessesCard
                value={settings.inventoryDashboardWeaknesses}
                onSubmit={updateInventoryDashboardWeaknesses}
                onRefresh={reload}
              />

              <DashboardHealthConfigCard
                value={settings.dashboardHealthConfig}
                onSubmit={updateDashboardHealthConfig}
                onRefresh={reload}
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}