"use client";

import type { JSX } from "react";
import { SaleWorkspaceView } from "./ui/SaleWorkspaceView";
import { useSaleWorkspaceController } from "./hooks/useSaleWorkspaceController";

export function SaleWorkspaceScreen(): JSX.Element {
  const vm = useSaleWorkspaceController();
  return <SaleWorkspaceView {...vm} />;
}
