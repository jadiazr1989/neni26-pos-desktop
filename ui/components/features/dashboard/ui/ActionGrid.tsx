import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard } from "./ActionCard";

export function ActionGrid(props: {
  onNewSale: () => void;
  onReturns: () => void;
  onCatalog: () => void;
  onCash: () => void;

  disableSales: boolean;
  disableCatalog: boolean;
  disableCash: boolean;

  salesReason: string | null;
  catalogReason: string | null;
  cashReason: string | null;

  returnsSubtitle: string;
  cashSubtitle: string;
}): JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Acciones</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <ActionCard
          icon="sale"
          title="Nueva venta"
          subtitle="Iniciar una venta (OPEN)"
          hotkey="F2"
          disabled={props.disableSales}
          reason={props.salesReason}
          onOpen={props.onNewSale}
          emphasis
        />

        <ActionCard
          icon="returns"
          title="Devoluciones"
          subtitle={props.returnsSubtitle}
          hotkey="F4"
          disabled={props.disableSales}
          reason={props.salesReason}
          onOpen={props.onReturns}
        />

        <ActionCard
          icon="catalog"
          title="Catálogo / Precio"
          subtitle="Buscar productos, escanear y verificar precio"
          hotkey="F6"
          disabled={props.disableCatalog}
          reason={props.catalogReason}
          onOpen={props.onCatalog}
        />

        <ActionCard
          icon="cash"
          title="Caja"
          subtitle={props.cashSubtitle}
          hotkey="F9"
          disabled={props.disableCash}
          reason={props.cashReason}
          onOpen={props.onCash}
        />
      </CardContent>
    </Card>
  );
}
