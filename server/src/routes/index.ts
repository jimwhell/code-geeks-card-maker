import { Express } from "express";
import sessionsRoutes from "./session.routes";
import membersRoutes from "./member.routes";

export function routes(app: Express) {
  app.use("/api/members", membersRoutes);
  app.use("/api/sessions", sessionsRoutes);
}

export default routes;
