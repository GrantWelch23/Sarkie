<template>
  <div class="chat-wrapper">
    <!-- Chat History -->
    <div class="chat-container">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="chat-message"
        :class="message.sender"
      >
        <!-- AI (SARK) Messages -->
        <div v-if="message.sender === 'sark'" class="sark">
          <img class="sark-avatar" src="/images/sark-avatar1.png" alt="SARK Avatar" />
          <!-- If it's a placeholder (thinking), italicize the text -->
          <p v-if="message.placeholder" class="sark-text">
            <em>{{ message.text }}</em>
          </p>
          <p v-else class="sark-text">{{ message.text }}</p>
        </div>

        <!-- User Messages -->
        <div v-if="message.sender === 'user'" class="user">
          <p class="user-text">{{ message.text }}</p>
        </div>
      </div>
    </div>

    <!-- Pinned Input (Bottom Chat Bar) -->
    <div
      class="chat-input-container"
      style="
        position: fixed;
        bottom: 0;
        left: 290px;
        width: calc(100% - 270px);
        background: #343541;
        border-top: 1px solid #565869;
        padding: 1rem 0;
        display: flex;
        justify-content: center;
        z-index: 1000;
      "
    >
      <div class="chat-input">
        <input
          v-model="userInput"
          type="text"
          placeholder="Message S.A.R.K..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from "../Services/api";

export default {
  name: "ChatView",
  data() {
    return {
      userInput: "",
      messages: [
        {
          text: "Hello! I'm the Supplements Analysis and Research Kernel, but you can call me Sarky! My job is to help you achieve your health goals. If you'd like, you can share your health goals, or you can ask how I work!",
          sender: "sark",
        },
      ],
      user: JSON.parse(localStorage.getItem("user")) || null,
    };
  },
  methods: {
    async sendMessage() {
      if (this.userInput.trim() === "") return;

      const userId = this.user ? this.user.id : null;
      const userMessage = this.userInput.trim();

      console.log("Sending message:", userMessage, "User ID:", userId);

      // 1) Add user message to chat immediately
      this.messages.push({ text: userMessage, sender: "user" });

      // 2) Clear input field immediately so it doesn't hang
      this.userInput = "";

      // 3) Try saving user message to DB
      try {
        console.log("📥 [DB SAVE] Attempting to save USER message...");
        await api.post("/conversations", {
          user_id: userId,
          message: userMessage,
          sender: "user",
        });
        console.log("[DB SAVE SUCCESS] USER message saved.");
      } catch (error) {
        console.error("Error saving user message:", error);
      }

      // 4) Sark's placeholder "thinking..." message
      const placeholderIndex = this.messages.push({
        text: "Thinking...",
        sender: "sark",
        placeholder: true,
      }) - 1;

      // 5) Request AI response
      try {
        console.log("[API REQUEST] Sending message to AI...");
        const response = await api.post("/chat", {
          message: userMessage,
          user_id: userId,
        });

        // Log the entire response to debug the structure
        console.log("Full response from AI endpoint:", response);

        // Fallback in case the API returns 'message' or some other field
        const aiReply = response.data?.reply || response.data?.message || null;
        if (!aiReply) {
          throw new Error("Invalid AI response format - no 'reply' or 'message' field found.");
        }

        // Remove the placeholder before pushing real AI response
        this.messages.splice(placeholderIndex, 1);
        this.messages.push({ text: aiReply, sender: "sark" });

        // Attempt to save AI response to DB
        console.log("[DB SAVE] Attempting to save AI response...");
        await api.post("/conversations", {
          user_id: userId,
          message: aiReply,
          sender: "ai",
        });
        console.log("[DB SAVE SUCCESS] AI message saved.");
      } catch (error) {
        console.error("Error receiving/saving AI response:", error);

        // Remove the placeholder and show error text
        this.messages.splice(placeholderIndex, 1);
        this.messages.push({
          text: "Sorry, there was an error. Please try again.",
          sender: "sark",
        });
      }
    },
  },
};
</script>



  
  <style>
  .chat-wrapper {
    display: flex;
    flex-direction: column;
    width: 800px;
    margin: 1rem auto 5rem auto;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    width: 800px;
    margin: 1rem auto 5rem auto;
  }
  
  .chat-message {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    max-width: 95%;
  }
  
  .sark {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .sark-avatar {
    width: 48px;
    height: 50px;
    border-radius: 50%;
    object-fit: contain;
    flex-shrink: 0;
  }
  
  .sark-text {
    background: none;
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
  }
  
  .user {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
  
  .user-text {
    background: #444654;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    max-width: 60%;
    text-align: right;
  }
  
  .chat-input {
    width: 800px;
    display: flex;
    background: #40414f;
    padding: 10px;
    border-radius: 10px;
    align-items: center;
  }
  
  .chat-input input {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    background: #40414f;
    color: white;
  }
  
  .chat-input input:focus {
    outline: none;
  }
  
  .chat-input button {
    margin-left: 10px;
    padding: 10px 15px;
    border: none;
    background: #007bff;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  .chat-input button:hover {
    background: #0056b3;
  }
  </style>
  