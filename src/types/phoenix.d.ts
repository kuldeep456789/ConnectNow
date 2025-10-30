// Minimal ambient declaration for 'phoenix' when no @types package exists
declare module "phoenix" {
  export class Socket {
    constructor(endpoint: string, opts?: any);
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    channel(topic: string, params?: any): any;
  }
  export function LongPoller(): any;
  export default { Socket };
}