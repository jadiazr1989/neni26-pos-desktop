import type {
  CreateTerminalInput,
  CreateTerminalResponse,
  HandshakeRequest,
  HandshakeResponse,
  ListTerminalsQuery,
  ListTerminalsResponse,
  PatchTerminalInput,
  PatchTerminalResponse,
} from "./terminal.dto";

export interface TerminalPort {
  list(params?: ListTerminalsQuery): Promise<ListTerminalsResponse>;
  handshake(body: HandshakeRequest): Promise<HandshakeResponse>;

  create(input: CreateTerminalInput): Promise<CreateTerminalResponse>;
  patch(id: string, input: PatchTerminalInput): Promise<PatchTerminalResponse>;
}
