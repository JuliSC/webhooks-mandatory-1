import {Router} from "express";

const router = Router();

// Route to register a webhook
/**
 * @openapi
 * /webhooks/register:
 *   post:
 *     description: Registers a new webhook for a provided endpoint and event.
 *     requestBody:
 *       description: Endpoint to register. And which event to register it for. NOTICE - eventType CAN ONLY BE alice OR bob.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *               eventType:
 *                 type: string
 *                 enum: [bob, alice]
 *             required:
 *               - endpoint
 *               - eventType
 *           example:
 *             endpoint: http://example.com/your-endpoint
 *             eventType: bob
 *     responses:
 *       200:
 *         description: Returns confirmation msg.
 */
router.post("/register", (req, res) => {
  const {eventType, endpoint} = req.body;
  webhooks.push({eventType, endpoint});
  saveWebhooks();
  res.send("Webhook registered successfully");
});

// Route to unregister a webhook
/**
 * @openapi
 * /webhooks/unregister:
 *   post:
 *     description: Unregisters all webhooks created with the provided endpoint.
 *     requestBody:
 *       description: Endpoint to unregister.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *             required:
 *               - endpoint
 *           example:
 *             endpoint: http://example.com/your-endpoint
 *     responses:
 *       200:
 *         description: Returns confirmation msg.
 */
router.post("/unregister", (req, res) => {
  const {endpoint} = req.body;
  webhooks = webhooks.filter((webhook) => webhook.endpoint !== endpoint);
  saveWebhooks();
  res.send("Webhook unregistered successfully");
});

// Save the registered webhooks to a file
function saveWebhooks() {
  fs.writeFileSync("./webhooks.json", JSON.stringify(webhooks));
}

export default router;
