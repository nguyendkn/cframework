// Endpoints module exports
export * from "./decorators";

// Re-export controller types explicitly to avoid ambiguity
import { Controller as ControllerClass } from "./controller";
export { ControllerClass as Controller };
