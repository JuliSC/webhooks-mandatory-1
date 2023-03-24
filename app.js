// Required packages
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const PORT = 4000;

// Create the express app
const app = express();

// Use body-parser to parse incoming requests
app.use(bodyParser.json());

const file = fetchFile("./webhooks.json");
// Set up a variable to store registered webhooks
let webhooks = JSON.parse(file);

// Route to register a webhook
app.post("/register", (req, res) => {
  const {eventType, endpoint} = req.body;
  webhooks.push({eventType, endpoint});
  saveWebhooks();
  res.send("Webhook registered successfully");
});

// Route to unregister a webhook
app.post("/unregister", (req, res) => {
  const {endpoint} = req.body;
  webhooks = webhooks.filter((webhook) => webhook.endpoint !== endpoint);
  saveWebhooks();
  res.send("Webhook unregistered successfully");
});

app.get("/trigger-bob", (req, res) => {
  printBob();
  res.send("Bob has been triggered");
});

app.get("/trigger-alice", (req, res) => {
  printAlice();
  res.send("Alice has been triggered");
});

// Events to invoke
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

// Example script to ping registered endpoints
pingEndpoints();

// Save the registered webhooks to a file
function saveWebhooks() {
  fs.writeFileSync("./webhooks.json", JSON.stringify(webhooks));
}

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
