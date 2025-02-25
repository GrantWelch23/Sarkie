<template>
  <div class="sidebar">
    <h2>Your Supplements</h2>

    <!-- If user is logged in, show the supplement list and controls -->
    <div v-if="user">
      <!-- List Supplements -->
      <ul v-if="supplements.length">
        <li v-for="supplement in supplements" :key="supplement.id"
            @click="selectSupplementToRemove(supplement.id)"
            :class="{ removable: removeMode }">
          <span>{{ supplement.name }} - {{ supplement.dosage }} ({{ supplement.frequency }})</span>
        </li>
      </ul>
      <p v-else>No supplements added yet.</p>

      <!-- Add Supplement Form -->
      <button @click="showAddForm = !showAddForm" class="toggle-btn">
        {{ showAddForm ? "Cancel" : "Add Supplement" }}
      </button>
      <div v-if="showAddForm" class="inline-form">
        <input v-model="newSupplement.name" type="text" placeholder="Supplement Name" class="input-field" />
        <input v-model="newSupplement.dosage" type="text" placeholder="Dosage (e.g., 500mg)" class="input-field" />
        <input v-model="newSupplement.frequency" type="text" placeholder="Frequency (e.g., Daily)" class="input-field" />
        <button @click="addSupplement" class="confirm-btn">Save</button>
      </div>

      <!-- Remove Supplement Button -->
      <button @click="toggleRemoveMode" class="toggle-btn remove-btn">
        {{ removeMode ? "Cancel Remove" : "Remove Supplement" }}
      </button>

      <!-- Remove Confirmation -->
      <div v-if="showRemoveConfirm" class="inline-form">
        <p>Are you no longer taking this supplement?</p>
        <button @click="confirmDelete" class="confirm-btn">Yes</button>
        <button @click="showRemoveConfirm = false" class="cancel-btn">No</button>
      </div>
    </div>

    <!-- If user is NOT logged in, show a link to login or register -->
    <div v-else>
      <p>
        <router-link to="/login">Login</router-link>
        or
        <router-link to="/register">Register</router-link>
        to begin supplement tracking!
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SupplementSidebar",
  data() {
    return {
      supplements: [],
      showAddForm: false,
      showRemoveConfirm: false,
      removeMode: false,
      selectedSupplementId: null,
      newSupplement: { name: "", dosage: "", frequency: "" },
      // Attempt to read from localStorage; if none, user remains null
      user: JSON.parse(localStorage.getItem("user")) || null,
    };
  },
  mounted() {
    // Only fetch supplements if the user is logged in
    if (this.user) {
      this.fetchSupplements();
    }
  },
  methods: {
    async fetchSupplements() {
      try {
        const response = await fetch(`https://sarkie-backend.onrender.com/supplements/${this.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch supplements.");
        this.supplements = await response.json();
      } catch (error) {
        console.error("❌ Error fetching supplements:", error);
      }
    },
    async addSupplement() {
      if (!this.newSupplement.name.trim()) return;

      try {
        const response = await fetch("https://sarkie-backend.onrender.com/supplements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_id: this.user.id,
            name: this.newSupplement.name,
            dosage: this.newSupplement.dosage,
            frequency: this.newSupplement.frequency
          }),
        });

        if (!response.ok) throw new Error("Failed to add supplement.");

        const addedSupplement = await response.json();
        this.supplements.push(addedSupplement);
        this.newSupplement = { name: "", dosage: "", frequency: "" };
        this.showAddForm = false;
      } catch (error) {
        console.error("❌ Error adding supplement:", error);
      }
    },
    toggleRemoveMode() {
      this.removeMode = !this.removeMode;
    },
    selectSupplementToRemove(supplementId) {
      if (this.removeMode) {
        this.selectedSupplementId = supplementId;
        this.showRemoveConfirm = true;
      }
    },
    async confirmDelete() {
      try {
        const response = await fetch(`https://sarkie-backend.onrender.com/supplements/${this.selectedSupplementId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete supplement.");

        this.supplements = this.supplements.filter(sup => sup.id !== this.selectedSupplementId);
        this.showRemoveConfirm = false;
        this.removeMode = false;
      } catch (error) {
        console.error("❌ Error deleting supplement:", error);
      }
    }
  },
};
</script>

<style>
.sidebar {
  width: 250px;
  background: #444654;
  color: white;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

/* List Styling */
ul {
  list-style: none;
  padding: 0;
  width: 100%;
}

li {
  background: #565869;
  padding: 10px;
  margin: 5px -20px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% + 20px);
}

li span {
  width: 100%;
  text-align: center;
}

li.removable {
  background: #ff4d4d;
}

/* Toggle Buttons */
.toggle-btn {
  width: 100%;
  padding: 10px;
  background: #565869;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  border-radius: 5px;
}

.toggle-btn:hover {
  background: #66677a;
}

.remove-btn {
  background: #ff4d4d;
}

.remove-btn:hover {
  background: #cc0000;
}

/* Inline form for adding & removing */
.inline-form {
  background: #565869;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  width: 100%; 
  align-items: center;
}

.inline-form input {
  width: 90%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 5px;
  border: none;
  background: #66677a;
  color: white;
}

.inline-form input::placeholder {
  color: #ccc;
}

.inline-form button {
  padding: 8px;
  margin-top: 5px;
  border: none;
  cursor: pointer;
  background: #444654;
  color: white;
  border-radius: 5px;
  width: 100%;
}

.inline-form button:hover {
  background: #66677a;
}

/* Confirmation buttons */
.confirm-btn {
  background: #007bff;
}
.confirm-btn:hover {
  background: #0056b3;
}

.cancel-btn {
  background: #565869;
}
.cancel-btn:hover {
  background: #66677a;
}
</style>
