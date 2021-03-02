import { CoreSetup, PluginConfigDescriptor } from "kibana/server";
import { configSchema, ConfigType } from "../common/config";
import { defineRoutes } from "./routes";

export const config: PluginConfigDescriptor<ConfigType> = {
  exposeToBrowser: {
    allowUnsafe: true
  },
  schema: configSchema,
};

export const plugin = () => ({
  setup(core: CoreSetup) {
    defineRoutes(core.http.createRouter());
  },
  start() {},
});
