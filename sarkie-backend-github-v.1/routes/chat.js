const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AI Chat Route 
router.post("/", async (req, res) => {
  try {
    const { message, user_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    console.log(`🟢 [CHAT REQUEST] User ID: ${user_id}, Message: "${message}"`);

    let pastMessages = [];
    let supplementsList = "No supplements have been added yet.";
    let effectsSummary = "No supplement effects have been reported.";

    // Retrieve the LAST 30 messages (Most recent first)
    if (user_id) {
      const history = await pool.query(
        "SELECT message, sender FROM conversations WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 30",
        [user_id]
      );

      // Reverse to chronological order
      pastMessages = history.rows.reverse().map(msg => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.message,
      }));

      // Fetch User Supplements
      const supplements = await pool.query(
        "SELECT name, dosage, frequency FROM supplements WHERE user_id = $1",
        [user_id]
      );

      if (supplements.rows.length > 0) {
        supplementsList = supplements.rows
          .map(sup => `${sup.name} - ${sup.dosage} (${sup.frequency})`)
          .join(", ");
      }

      // Fetch User Effects
      const effects = await pool.query(
        "SELECT effect_type, effect_description FROM supplement_effects WHERE user_id = $1 ORDER BY timestamp DESC",
        [user_id]
      );

      if (effects.rows.length > 0) {
        effectsSummary = "The user has reported the following supplement effects:\n" + 
          effects.rows.map(e => `- ${e.effect_type}: ${e.effect_description}`).join("\n");
      }
    }

    // Retrieve memory
    let memory = null;
    if (user_id) {
      const memoryQuery = await pool.query(
        "SELECT message FROM conversations WHERE user_id = $1 AND sender = 'ai' AND message ILIKE 'Got it!%' ORDER BY timestamp DESC LIMIT 1",
        [user_id]
      );

      if (memoryQuery.rows.length > 0) {
        memory = memoryQuery.rows[0].message;
      }
    }

    // AI Prompt
    const systemMessage = {
      role: "system",
      content: memory
        ? `You are SARK, an AI that helps users track supplements and health goals. You also remember past instructions: ${memory}. The user is currently taking these supplements: ${supplementsList}. Additionally, ${effectsSummary}`
        : `You are SARK, an AI that helps users track supplements and health goals. The user is currently taking these supplements: ${supplementsList}. Additionally, ${effectsSummary}`,
    };

    // Prepare messages for OpenAI API call
    const messagesForAI = [systemMessage, ...pastMessages, { role: "user", content: message }];

    // Send request to OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messagesForAI,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content || "I have recorded your supplement.";

    console.log(`✅ [AI RESPONSE] "${aiReply}"`);

    // Store messages in database 
    if (user_id) {
      await pool.query(
        "INSERT INTO conversations (user_id, message, sender) VALUES ($1, $2, $3)",
        [user_id, message, "user"]
      );

      await pool.query(
        "INSERT INTO conversations (user_id, message, sender) VALUES ($1, $2, $3)",
        [user_id, aiReply, "ai"]
      );
    }

    res.json({ reply: aiReply });

  } catch (err) {
    console.error("❌ Error communicating with OpenAI:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: "AI response error", details: err.response ? err.response.data : err.message });
  }
});

module.exports = router;
