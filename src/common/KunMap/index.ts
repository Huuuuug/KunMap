import { registerPainter } from "zrender";
import CanvasPainter from "zrender/lib/canvas/Painter";
registerPainter("canvas", CanvasPainter);

export * from "./core/KunMap";
export * from "./core/BasicElement";

export * from "./core/elements/index";
