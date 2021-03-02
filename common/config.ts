import { schema, TypeOf } from "@kbn/config-schema";

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  allowUnsafe: schema.boolean({ defaultValue: false }),
});

// @kbn/config-schema is written in TypeScript, so you can use your schema
// definition to create a type to use in your plugin code.
export type ConfigType = TypeOf<typeof configSchema>;
