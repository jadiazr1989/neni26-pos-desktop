import { useTerminalStore } from "@/stores/terminal.store";
import { notify } from "@/lib/notify/notify";

export function useUnpairTerminal() {
  const unpair = useTerminalStore((s) => s.unpairTerminal);

  return async function run(): Promise<void> {
    await unpair();
    notify.success({ title: "Terminal reseteado", description: "Debes asignar un terminal nuevamente." });
  };
}
