// Required packages
import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";

import webhooksRouter from "./routes/webhookRouter.js";
import eventsRouter from "./routes/eventRouter.js";

const PORT = process.env.PORT || 8080;

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

app.use("/webhooks", webhooksRouter);
app.use("/events", eventsRouter);

const file = fetchFile("./webhooks.json");
let webhooks = JSON.parse(file);

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
