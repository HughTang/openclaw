import { defineChannelSetupContract } from "openclaw/plugin-sdk/channel-setup";
// Googlechat plugin module implements setup core behavior.
import {
  createPatchedAccountSetupAdapter,
  createSetupInputPresenceValidator,
} from "openclaw/plugin-sdk/setup-runtime";

const channel = "googlechat" as const;

export const googlechatSetupAdapter = createPatchedAccountSetupAdapter({
  channelKey: channel,
  validateInput: createSetupInputPresenceValidator({
    defaultAccountOnlyEnvError:
      "GOOGLE_CHAT_SERVICE_ACCOUNT env vars can only be used for the default account.",
    whenNotUseEnv: [
      {
        someOf: ["token", "tokenFile"],
        message: "Google Chat requires --token (service account JSON) or --token-file.",
      },
    ],
  }),
  buildPatch: (input) => {
    const patch = input.useEnv
      ? {}
      : input.tokenFile
        ? { serviceAccountFile: input.tokenFile }
        : input.token
          ? { serviceAccount: input.token }
          : {};
    const audienceType = input.audienceType?.trim();
    const audience = input.audience?.trim();
    const webhookPath = input.webhookPath?.trim();
    const webhookUrl = input.webhookUrl?.trim();
    return {
      ...patch,
      ...(audienceType ? { audienceType } : {}),
      ...(audience ? { audience } : {}),
      ...(webhookPath ? { webhookPath } : {}),
      ...(webhookUrl ? { webhookUrl } : {}),
    };
  },
});

export const googlechatSetupContract = defineChannelSetupContract({
  fields: {
    token: {
      kind: "string",
      sensitive: true,
      cli: { flags: "--token <json>", description: "Google Chat service account JSON" },
    },
    tokenFile: {
      kind: "string",
      sensitive: true,
      cli: { flags: "--token-file <path>", description: "Google Chat service account file" },
    },
    audienceType: {
      kind: "choice",
      choices: ["app-url", "project-number"],
      cli: { flags: "--audience-type <type>", description: "Google Chat audience type" },
    },
    audience: {
      kind: "string",
      cli: { flags: "--audience <value>", description: "Google Chat audience value" },
    },
    webhookPath: {
      kind: "string",
      cli: { flags: "--webhook-path <path>", description: "Google Chat webhook path" },
    },
    webhookUrl: {
      kind: "string",
      cli: { flags: "--webhook-url <url>", description: "Google Chat webhook URL" },
    },
    useEnv: {
      kind: "boolean",
      cli: { flags: "--use-env", description: "Use Google Chat environment credentials" },
    },
  },
  legacyAdapter: googlechatSetupAdapter,
});
