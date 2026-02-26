"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ActionBar(props: {
  onCancel: () => void;
  cancelDisabled: boolean;

  onPreview: () => void;
  previewDisabled: boolean;
  previewLoading: boolean;
  previewTooltip?: string;

  onApply: () => void;
  applyDisabled: boolean;
  applyLoading: boolean;
  applyTooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button type="button" variant="secondary" disabled={props.previewDisabled} onClick={props.onPreview}>
                {props.previewLoading ? "Calculando..." : "Preview"}
              </Button>
            </span>
          </TooltipTrigger>
          {props.previewDisabled && props.previewTooltip ? (
            <TooltipContent side="top" align="start" className="max-w-[320px]">
              <p className="text-xs">{props.previewTooltip}</p>
            </TooltipContent>
          ) : null}
        </Tooltip>

        <div className="text-xs text-muted-foreground">Confirma “after” antes de aplicar.</div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={props.onCancel} disabled={props.cancelDisabled}>
          Cancelar
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button onClick={props.onApply} disabled={props.applyDisabled}>
                {props.applyLoading ? "Aplicando..." : "Aplicar"}
              </Button>
            </span>
          </TooltipTrigger>
          {props.applyDisabled && props.applyTooltip ? (
            <TooltipContent side="top" align="end" className="max-w-[340px]">
              <p className="text-xs">{props.applyTooltip}</p>
            </TooltipContent>
          ) : null}
        </Tooltip>
      </div>
    </div>
  );
}