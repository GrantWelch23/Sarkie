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
          <!-- AI Messages -->
          <div v-if="message.sender === 'sark'" class="sark">
            <img class="sark-avatar" src="/images/sark-avatar1.png" alt="SARK Avatar" />
            <p class="sark-text">{{ message.text }}</p>
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
  export default {
    name: "ChatView",
    data() {
      return {
        userInput: "",
        messages: [
          {
            text: "Hello! I'm the Supplements Analysis and Recommendation Kernel, but you can call me Sarkie! My job is to help you achieve your health goals. If you'd like, you can share your health goals, or you can ask how I work!",
            sender: "sark",
          },
        ],
        user: JSON.parse(localStorage.getItem("user")) || null, // ✅ Ensure user is stored
      };
    },
  
    methods: {
        async sendMessage() {
  if (this.userInput.trim() === "") return;

  const userId = this.user ? this.user.id : null;
  console.log("📤 Sending message:", this.userInput, "User ID:", userId);

  // Add user message to chat
  this.messages.push({ text: this.userInput, sender: "user" });

  try {
    console.log("📥 [DB SAVE] Attempting to save USER message...");
    
    // Log the payload before sending
    console.log("📤 Saving USER message:", { user_id: userId, message: this.userInput, sender: "user" });

    await fetch("https://sarkie-backend.onrender.com/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        message: this.userInput,
        sender: "user",
      }),
    });

    console.log("✅ [DB SAVE SUCCESS] USER message saved.");
  } catch (error) {
    console.error("❌ Error saving user message:", error);
  }

  try {
    console.log("🟢 [API REQUEST] Sending message to AI...");

    const response = await fetch("https://sarkie-backend.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: this.userInput, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔹 [AI RESPONSE] Received AI reply:", data.reply);

    this.messages.push({ text: data.reply, sender: "sark" });

    console.log("📥 [DB SAVE] Attempting to save AI response...");

    // Log the AI response payload
    console.log("📤 Saving AI message:", { user_id: userId, message: data.reply, sender: "ai" });

    await fetch("https://sarkie-backend.onrender.com/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        message: data.reply,
        sender: "ai",
      }),
    });

    console.log("✅ [DB SAVE SUCCESS] AI message saved.");
  } catch (error) {
    console.error("❌ Error saving AI response:", error);
  }

  this.userInput = ""; // Clear input field
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
  