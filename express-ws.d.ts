// Augment Express so app.ws() is typed (added at runtime by express-ws).
import type { Request } from "express";
import type { WebSocket } from "ws";

declare module "express-serve-static-core" {
  interface Application {
    ws(path: string, callback: (ws: WebSocket, req: Request) => void): void;
  }
}