"use client";

import type { JSX } from "react";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

import { PayButton } from "./ui/PayButton";
import { SaleSummary } from "./ui/SaleSummary";
import { PosMoreMenu, type PosMoreMenuHandle } from "./ui/PosMoreMenu";
import { usePosHotkeys } from "./hooks/usePosHotkeys";
import { PosLeftStatusPanel } from "./ui/PosLeftStatusPanel";
import { PosCenterInfoBar } from "./ui/PosCenterInfoBar";

type Role = "ADMIN" | "MANAGER" | "CASHIER";

export function PosBottomBar(props: {
  className?: string;

  role: Role;

  offline: boolean;
  cashOpen: boolean;

  itemsCount: number;
  total: number;
  paying: boolean;
  payDisabled: boolean;

  onPay: () => void;
  onCancelSale: () => void;
  onHoldSale: () => void;
  onNote: () => void;
  onCustomer: () => void;
}): JSX.Element {
  const menuRef = useRef<PosMoreMenuHandle>(null);

  const canPay = useCallback(
    () => !props.payDisabled && !props.paying,
    [props.payDisabled, props.paying]
  );

  const openMenu = useCallback(() => {
    menuRef.current?.open();
  }, []);

  usePosHotkeys({
    enabled: true,
    canPay,
    onPay: props.onPay,
    onOpenMenu: openMenu,
  });

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur",
        "shadow-[0_-10px_24px_-18px_rgba(0,0,0,0.35)]",
        props.className
      )}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: "260px 1fr 400px" }}
      >
        {/* LEFT — estado de caja (verde sólido) */}
        <div className="px-4 py-2 flex items-center bg-emerald-200/60">
          <PosLeftStatusPanel cashOpen={props.cashOpen} />
        </div>

        {/* CENTER */}
        <PosCenterInfoBar/>


        {/* RIGHT — sesión de venta (amarillo sólido) */}
        <div className="px-3 py-3 flex justify-end bg-amber-100/70">

          <div className="flex items-stretch gap-2">
            <PayButton
              paying={props.paying}
              disabled={props.payDisabled}
              onPay={props.onPay}
              className="focus-visible:ring-2 focus-visible:ring-amber-300"
            />

            <SaleSummary
              itemsCount={props.itemsCount}
              total={props.total}
              tone="emerald"
            />

            <PosMoreMenu
              ref={menuRef}
              tone="amber"
              onHold={props.onHoldSale}
              onNote={props.onNote}
              onCustomer={props.onCustomer}
              onCancel={props.onCancelSale}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
