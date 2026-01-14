export type TerminalDTO = {
  id: string;
  warehouseId: string;
  name: string;
  code: string | null;
  isActive: boolean;
};

export type TerminalSelectableDTO = Omit<TerminalDTO, "code"> & { code: string };
