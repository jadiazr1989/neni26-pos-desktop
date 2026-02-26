"use client";

import * as React from "react";
import type { JSX } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CheckoutState, SyncStatus } from "../domain/checkoutViewModel";

export function SyncAlerts(props: {
  syncStatus: SyncStatus;
  syncErrorMessage?: string | null;
  state: CheckoutState;
}): JSX.Element | null {
  if (props.syncStatus === "error" && props.syncErrorMessage) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{props.syncErrorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (props.state.status === "error") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{props.state.message}</AlertDescription>
      </Alert>
    );
  }

  if (props.state.status === "editing" && props.state.message) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-amber-900">{props.state.message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
