import type { TerminalPort } from "./terminal.port";
import { terminalHttp } from "./terminal.http";
import type {
  CreateTerminalInput,
  HandshakeRequest,
  ListTerminalsQuery,
  PatchTerminalInput,
  TerminalDTO,
} from "./terminal.dto";

function isActiveTerminal(t: TerminalDTO): boolean {
  return Boolean(t.isActive);
}

export class TerminalService {
  constructor(private readonly port: TerminalPort) {}

  list(params?: ListTerminalsQuery) {
    return this.port.list(params);
  }

  async listActive(params?: ListTerminalsQuery): Promise<TerminalDTO[]> {
    const res = await this.port.list(params);
    return res.terminals.filter(isActiveTerminal);
  }

  handshakeById(body: HandshakeRequest) {
    return this.port.handshake(body);
  }

  create(input: CreateTerminalInput) {
    return this.port.create(input);
  }

  patch(id: string, input: PatchTerminalInput) {
    return this.port.patch(id, input);
  }
}

export const terminalService = new TerminalService(terminalHttp);
