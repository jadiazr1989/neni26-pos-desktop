export type TerminalDTO = {
  id: string;
  warehouseId: string;
  name: string;
  code: string | null;
  hostname: string | null;
  ipAddress: string | null;
  isActive: boolean;
  createdAt: string; // o Date si tú lo parseas
  updatedAt: string;
  isSystem: boolean; // ✅ NEW
  // opcional si luego haces include del warehouse
  warehouse?: { id: string; name: string } | null;
};

export type ListTerminalsQuery = {
  warehouseId?: string;
  take?: number;
  skip?: number;
};

export type ListTerminalsResponse = {
  terminals: TerminalDTO[];
};

export type HandshakeRequest = {
  terminalId?: string;
  warehouseId?: string;
  code?: string;
  name?: string;
  hostname?: string;
  ipAddress?: string;
};

export type HandshakeResponse = {
  terminal: TerminalDTO;
};

export type CreateTerminalInput = {
  warehouseId: string;
  code: string;
  name: string;
  hostname?: string | null;
  ipAddress?: string | null;
};

export type CreateTerminalResponse = {
  terminalId: string; // viene de sendCreatedId(res,"terminalId",...)
};

export type PatchTerminalInput = {
  name?: string;
  isActive?: boolean;
  warehouseId?: string; // en tu API NO permites null
};

export type PatchTerminalResponse = {
  terminalId: string; // sendOk(res,{terminalId: out})
};
