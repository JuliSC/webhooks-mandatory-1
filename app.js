// Required packages
import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";

// import webhooksRouter from "./routes/webhookRouter.js";
// import eventsRouter from "./routes/eventRouter.js";

import {Router} from "express";

const router = Router();

const PORT = process.env.PORT || 8080;

const file = fetchFile("./webhooks.json");
let webhooks = JSON.parse(file);

// Create the express app
const app = express();

// Use body-parser to parse incoming requests
app.use(bodyParser.json());

// Swagger documentation
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Users API",
    version: "1.0.0",
    description: "A simple Express Users API",
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./routes/*.js"],
  explorer: true,
};

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJSDoc(swaggerOptions))
);

// Webhooks router
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
router.post("/webhooks/register", (req, res) => {
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
router.post("/webhooks/unregister", (req, res) => {
  const {endpoint} = req.body;
  webhooks = webhooks.filter((webhook) => webhook.endpoint !== endpoint);
  saveWebhooks();
  res.send("Webhook unregistered successfully");
});

// Save the registered webhooks to a file
function saveWebhooks() {
  fs.writeFileSync("./webhooks.json", JSON.stringify(webhooks));
}

// Event router
// Events to invoke
/**
 * @openapi
 * /events/trigger-bob:
 *   get:
 *     description: Invokes the printBob() event.
 *     responses:
 *       200:
 *         description: Returns confirmation msg.
 */
router.get("/events/trigger-bob", (req, res) => {
  printBob();
  res.send("Bob has been triggered");
});

/**
 * @openapi
 * /events/trigger-alice:
 *   get:
 *     description: Invokes the printAlice() event.
 *     responses:
 *       200:
 *         description: Returns confirmation msg.
 */
router.get("/events/trigger-alice", (req, res) => {
  printAlice();
  res.send("Alice has been triggered");
});

function printBob() {
  console.log("Bob");
  webhooks.forEach((webhook) => {
    if (webhook.eventType === "bob") {
      fetch(webhook.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({msg: "Bob has been triggered"}),
      }).catch((err) => {
        console.log(err);
      });
    }
  });
}

function printAlice() {
  console.log("Alice");
  webhooks.forEach((webhook) => {
    if (webhook.eventType === "alice") {
      fetch(webhook.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({msg: "Alice has been triggered"}),
      }).catch((err) => {
        console.log(err);
      });
    }
  });
}

// Function to call all registered endpoints at random intervals
function pingEndpoints() {
  setInterval(() => {
    webhooks.forEach((webhook) => {
      fetch(webhook.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({eventType: webhook.eventType, msg: "Ping"}),
      }).catch((err) => {
        console.log(err);
      });
    });
  }, 5000);
}

app.use("", router);

// Example script to ping registered endpoints
pingEndpoints();

// Function for fetching a file
function fetchFile(filePath) {
  const fileExists = fs.existsSync(filePath);
  if (!fileExists) {
    fs.writeFileSync(filePath, "[]");
  }
  const file = fs.readFileSync(filePath, "utf8");
  return file;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
