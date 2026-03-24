import * as express from "express";
import * as path from "path";

import { HttpStatusCode, SqliteStorageProvider } from "@mrwhale-io/core";
import { GameJoltBotClient } from "./client/gamejolt-bot-client";
import * as config from "../config.json";

const app = express();

// Middleware to parse raw body for PayPal webhook signature verification
app.use("/webhook/paypal", express.raw({ type: "application/json" }));
app.use(express.json());

// Initialize the bot client
const client = new GameJoltBotClient(
  {
    userId: config.userId,
    frontend: config.frontend,
    mrwhaleToken: config.mrwhaleToken,
    baseApiUrl: config.baseApiUrl,
    baseGridUrl: config.baseGridUrl,
    rateLimitRequests: 3,
  },
  {
    commandsDir: path.join(__dirname, "./commands"),
    cleverbotToken: config.cleverbot,
    prefix: config.prefix,
    ownerId: config.ownerId,
    privateKey: config.privateKey,
    gameId: config.gameId,
    provider: SqliteStorageProvider(path.join(process.cwd(), config.database)),
  },
);

// PayPal Webhook endpoint
app.post(
  "/webhook/paypal",
  async (req: express.Request, res: express.Response) => {
    try {
      if (!client.subscriptionManager) {
        client.logger.error("Subscription manager not available");
        return res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Subscription system not configured" });
      }

      const signature = req.headers["paypal-transmission-sig"] as string;
      const transmissionId = req.headers["paypal-transmission-id"] as string;
      const timestamp = req.headers["paypal-transmission-time"] as string;
      const certId = req.headers["paypal-cert-id"] as string;

      if (!signature || !transmissionId || !timestamp || !certId) {
        client.logger.error("Missing PayPal webhook headers");
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ error: "Missing required headers" });
      }

      const webhookId = config.paypal?.webhookId;
      if (!webhookId) {
        client.logger.error("PayPal webhook ID not configured");
        return res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Webhook not configured" });
      }

      const rawBody = req.body;
      const webhookEvent = JSON.parse(rawBody.toString());

      client.logger.info(`Received PayPal webhook: ${webhookEvent.event_type}`);

      // Verify webhook signature
      const isVerified =
        await client.subscriptionManager.verifyWebhookSignature({
          signature,
          transmissionId,
          timestamp,
          certId,
          webhookId,
          rawBody: rawBody.toString(),
        });

      if (!isVerified) {
        client.logger.error("PayPal webhook signature verification failed");
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ error: "Signature verification failed" });
      }

      // Process webhook event
      await client.subscriptionManager.handleWebhook(webhookEvent);

      res
        .status(HttpStatusCode.OK)
        .json({ message: "Webhook processed successfully" });
    } catch (error) {
      client.logger.error("Error processing PayPal webhook:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  },
);

// Health check endpoint
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Dashboard endpoint for subscription analytics (optional)
app.get(
  "/admin/subscriptions",
  async (req: express.Request, res: express.Response) => {
    try {
      // This could be protected with authentication middleware
      const authToken = req.headers.authorization;
      const expectedToken = `Bearer ${config.adminToken}`;

      if (authToken !== expectedToken) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ error: "Unauthorized" });
      }

      if (!client.subscriptionManager) {
        return res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Subscription system not configured" });
      }

      // Get subscription stats (you'd implement this method)
      const stats = await client.subscriptionManager.getSubscriptionStats();
      res.json(stats);
    } catch (error) {
      client.logger.error("Error fetching subscription stats:", error);
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  client.logger.info(`PayPal webhook server running on port ${PORT}`);
  client.logger.info(
    `Webhook endpoint: http://localhost:${PORT}/webhook/paypal`,
  );
});

// Handle graceful shutdown
process.on("unhandledRejection", (err) => {
  client.logger.error("Unhandled rejection:", err);
});

process.on("SIGINT", () => {
  client.logger.info("Shutting down gracefully...");
  client.logger.info("Shutting down gracefully...");

  client.destroy().then(() => {
    client.logger.info("Shutdown complete. Exiting process.");
    client.logger.info("Shutdown complete. Exiting process.");
    process.exit(0);
  });
});

export { app, client };
