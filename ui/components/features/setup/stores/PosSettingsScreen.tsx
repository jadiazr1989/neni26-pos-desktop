"use client";

import type { JSX } from "react";
import {
  CreditCard,
  Receipt,
  RefreshCcw,
  Settings2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePosSettings } from "./hooks/usePosSettings";
import { PosCashSettingsCard } from "./ui/PosCashSettingsCard";
import { PosGeneralSettingsCard } from "./ui/PosGeneralSettingsCard";
import { PosCheckoutSettingsCard } from "./ui/PosCheckoutSettingsCard";
import { PosReceiptSettingsCard } from "./ui/PosReceiptSettingsCard";
import { SettingsIntroCard } from "../metrics/ui/SettingsIntroCard";

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

export function PosSettingsScreen(): JSX.Element {
  const {
    settings,
    loading,
    refreshing,
    error,
    reload,
    updateCashBusinessHours,
    updatePosGeneral,
    updatePosCheckout,
    updatePosReceipt,
  } = usePosSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="size-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Configuración del POS</h1>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ajusta cómo funciona el sistema en la tienda: caja, operación diaria,
            cobro y recibos.
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
        title="Configuración general del POS"
        description={
          <>
            Aquí puedes ajustar cómo funciona el punto de venta para la tienda
            actual.
            <br />
            Si no estás segura de un valor, es mejor no cambiarlo.
          </>
        }
      />

      {loading ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Cargando configuración del POS...
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
              icon={<Settings2 className="size-5 text-muted-foreground" />}
              title="Operación general"
              description="Opciones principales para el funcionamiento diario del sistema."
            />

            <div className="grid gap-4">
              <PosGeneralSettingsCard
                value={settings.posGeneral}
                onSubmit={updatePosGeneral}
                onRefresh={reload}
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={<Wallet className="size-5 text-muted-foreground" />}
              title="Caja"
              description="Configuración relacionada con horarios y reglas de operación de caja."
            />

            <div className="grid gap-4">
              <PosCashSettingsCard
                value={settings.cashBusinessHours}
                onSubmit={updateCashBusinessHours}
                onRefresh={reload}
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={<CreditCard className="size-5 text-muted-foreground" />}
              title="Cobro y checkout"
              description="Define cómo se comporta el proceso de venta y cobro al cliente."
            />

            <div className="grid gap-4">
              <PosCheckoutSettingsCard
                value={settings.posCheckout}
                onSubmit={updatePosCheckout}
                onRefresh={reload}
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              icon={<Receipt className="size-5 text-muted-foreground" />}
              title="Recibos"
              description="Configura la información que aparecerá en los recibos entregados al cliente."
            />

            <div className="grid gap-4">
              <PosReceiptSettingsCard
                value={settings.posReceipt}
                onSubmit={updatePosReceipt}
                onRefresh={reload}
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}