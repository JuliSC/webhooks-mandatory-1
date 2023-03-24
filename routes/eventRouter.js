import {Router} from "express";

const router = Router();

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
router.get("/trigger-bob", (req, res) => {
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
router.get("/trigger-alice", (req, res) => {
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

export default router;
