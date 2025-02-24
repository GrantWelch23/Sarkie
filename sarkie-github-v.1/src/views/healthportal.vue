<template>
  <div class="health-portal">
    <!-- Keep title invisible for spacing -->
    <h1>Health Portal</h1>

    <div class="health-portal-layout">
      <section class="effects">
        <div class="effects-container">
          <div class="effects-box positive-effects">
            <ul v-if="userEffects.some(e => e.effect_type === 'positive')">
              <li
                v-for="(effect, index) in userEffects.filter(e => e.effect_type === 'positive')"
                :key="'pos-' + index"
                :class="{ 'delete-mode': isDeletingPositive }"
                @click="isDeletingPositive ? deleteSingleEffect(effect.id) : null"
              >
                {{ effect.effect_description }}
              </li>
            </ul>
            <p v-else class="default-text positive-text">
              You haven't logged any positive effects yet.
            </p>

            <!-- Bottom Buttons -->
            <div style="margin-top: auto; display: flex; gap: 10px;">
              <!-- "Remove" toggles single-delete mode -->
              <button
                class="remove-effect-btn"
                :class="{ activeDelete: isDeletingPositive }"
                @click="toggleDeleteMode('positive')"
              >
                {{ isDeletingPositive ? "Cancel Delete" : "Remove" }}
              </button>

              <!--  Log positive effect -->
              <button class="add-effect-btn" @click="showPositiveForm = true">
                Log Positive Effect
              </button>
            </div>

            <!-- Inline form for new positive effect -->
            <div v-if="showPositiveForm" class="inline-form">
              <input
                v-model="newPositiveEffect"
                type="text"
                class="effect-input"
                placeholder="Enter positive effect"
              />
              <button @click="submitPositiveEffect" class="submit-effect-btn">
                Save
              </button>
              <button @click="cancelPositiveEffect" class="cancel-effect-btn">
                Cancel
              </button>
            </div>
          </div>

          <!-- Side Effects -->
          <div class="effects-box negative-effects">
            <ul v-if="userEffects.some(e => e.effect_type === 'negative')">
              <li
                v-for="(effect, index) in userEffects.filter(e => e.effect_type === 'negative')"
                :key="'neg-' + index"
                :class="{ 'delete-mode': isDeletingNegative }"
                @click="isDeletingNegative ? deleteSingleEffect(effect.id) : null"
              >
                {{ effect.effect_description }}
              </li>
            </ul>
            <p v-else class="default-text negative-text">
              You haven't logged any side effects yet.
            </p>

            <!-- Bottom Buttons -->
            <div style="margin-top: auto; display: flex; gap: 10px;">
              <!-- 1) "Remove" toggles single-delete mode -->
              <button
                class="remove-effect-btn"
                :class="{ activeDelete: isDeletingNegative }"
                @click="toggleDeleteMode('negative')"
              >
                {{ isDeletingNegative ? "Cancel Delete" : "Remove" }}
              </button>

              <!-- "Log Side Effect" -->
              <button class="add-effect-btn" @click="showNegativeForm = true">
                Log Side Effect
              </button>
            </div>

            <!-- Inline form for new negative effect -->
            <div v-if="showNegativeForm" class="inline-form">
              <input
                v-model="newNegativeEffect"
                type="text"
                class="effect-input"
                placeholder="Enter side effect"
              />
              <button @click="submitSideEffect" class="submit-effect-btn">
                Save
              </button>
              <button @click="cancelNegativeEffect" class="cancel-effect-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Placeholder for Wellness Metrics -->
      <section class="coming-soon wellness">
        <h2>Coming Soon: Wellness Metrics</h2>
        <p>Track your Mood, Energy, and Anxiety over time.</p>
      </section>

      <!-- Placeholder for Sleep Tracking -->
      <section class="coming-soon sleep">
        <h2>Coming Soon: Sleep Tracking</h2>
        <p>Monitor your sleep quality and trends.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Retrieve logged-in user data
const user = JSON.parse(localStorage.getItem("user"));
const userId = user ? user.id : null;

// Store all effects (both positive and negative)
const userEffects = ref([]);

// Inline form states
const showPositiveForm = ref(false);
const showNegativeForm = ref(false);
const newPositiveEffect = ref("");
const newNegativeEffect = ref("");

// Single-delete mode states
const isDeletingPositive = ref(false);
const isDeletingNegative = ref(false);

// Fetch existing effects
const fetchEffectsData = async () => {
  if (!userId) {
    console.warn("❌ No user logged in.");
    return;
  }

  try {
    const response = await axios.get(`https://sarkie-backend.onrender.com/supplements/user-effects/${userId}`);
    console.log("✅ Effects Data:", response.data);
    userEffects.value = response.data;
  } catch (error) {
    console.error("❌ Error fetching effects data:", error);
  }
};

// Submit a new positive effect
const submitPositiveEffect = async () => {
  const desc = newPositiveEffect.value.trim();
  if (!desc) return;

  try {
    await axios.post("https://sarkie-backend.onrender.com/supplements/user-effects", {
      user_id: userId,
      effect_type: "positive",
      effect_description: desc
    });

    newPositiveEffect.value = "";
    showPositiveForm.value = false;
    await fetchEffectsData();
  } catch (err) {
    console.error("❌ Error adding positive effect:", err);
  }
};

// Submit a new side effect
const submitSideEffect = async () => {
  const desc = newNegativeEffect.value.trim();
  if (!desc) return;

  try {
    await axios.post("https://sarkie-backend.onrender.com/supplements/user-effects", {
      user_id: userId,
      effect_type: "negative",
      effect_description: desc
    });

    newNegativeEffect.value = "";
    showNegativeForm.value = false;
    await fetchEffectsData();
  } catch (err) {
    console.error("❌ Error adding side effect:", err);
  }
};

// Cancel forms
const cancelPositiveEffect = () => {
  newPositiveEffect.value = "";
  showPositiveForm.value = false;
};
const cancelNegativeEffect = () => {
  newNegativeEffect.value = "";
  showNegativeForm.value = false;
};

// Toggle single-delete mode
const toggleDeleteMode = (effectType) => {
  if (effectType === "positive") {
    isDeletingPositive.value = !isDeletingPositive.value;
    if (isDeletingPositive.value) {
      // turn off negative mode
      isDeletingNegative.value = false;
    }
  } else {
    isDeletingNegative.value = !isDeletingNegative.value;
    if (isDeletingNegative.value) {
      // turn off positive mode
      isDeletingPositive.value = false;
    }
  }
};

// Delete a single effect by ID
const deleteSingleEffect = async (effectId) => {
  try {
    console.log("Deleting effect ID:", effectId);
    await axios.delete(`https://sarkie-backend.onrender.com/supplements/user-effects/${effectId}`);
    await fetchEffectsData();
  } catch (error) {
    console.error("❌ Error deleting effect:", error);
  }
};

onMounted(fetchEffectsData);
</script>

<style scoped>
/* Full Page Layout */
.health-portal {
  width: 100vw;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 97vh;
  overflow: hidden; /* ensures no scrolling */
}

/* Make "Health Portal" invisible but keep layout spacing */
.health-portal h1 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: transparent;
}

/* Expands to Full Width & Height */
.health-portal-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px;
  width: 98vw;
  height: 82vh;
  box-sizing: border-box;
}

/* Effects Container */
.effects-container {
  display: flex;
  justify-content: flex-end; /* keep them on the right */
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 900px;
  margin-left: 200px; /* pushes the boxes to the right */
  margin-right: 50px;
}

/* Effects Boxes */
.effects-box {
  width: 400px;
  min-height: 400px;
  padding: 20px;
  border-radius: 10px;
  background: #FAE79B; /* notepad yellow */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  position: relative; /* Let the inline form position absolutely */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left; /* left align text/bullets */
  font-size: 1.2rem;
  overflow: hidden; /* ensures form won't overflow horizontally */
}

/* Default text for empty boxes */
.default-text {
  font-size: 1rem;
  margin-bottom: auto;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Default text colors */
.positive-text {
  color: #26734D;
}
.negative-text {
  color: #B22222;
}

/* Standard disc bullets, left aligned, no emojis */
.effects-box ul {
  list-style-type: disc;
  list-style-position: outside;
  margin: 0;
  padding-left: 20px; /* indent bullets */
  background: transparent;
}
.positive-effects li::marker {
  color: #26734D;
}
.negative-effects li::marker {
  color: #B22222;
}

/* Buttons at bottom-right */
.add-effect-btn {
  margin-top: auto;
  align-self: flex-end;
  padding: 10px 15px;
  background: #444654; /* old dark gray background */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.add-effect-btn:hover {
  background: #66677a;
}

/* Inline Form flush with left, right, bottom */
.inline-form {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #faf2cc; /* a subtle, slightly greyish variant of #FAE79B */
  border-top: 1px solid #d2c18f;
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  box-sizing: border-box; /* ensures padding doesn't break flush edges */
}

/* Input inside inline form */
.effect-input {
  flex: 1;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #aaa;
  font-size: 1rem;
}

/* Submit/Cancel Buttons inside form */
.submit-effect-btn,
.cancel-effect-btn {
  padding: 8px 14px;
  background: #444654;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.submit-effect-btn:hover,
.cancel-effect-btn:hover {
  background: #66677a;
}

/* Remove borders & define colors */
.positive-effects {
  color: #26734D;
  border-left: none;
}
.negative-effects {
  color: #B22222;
  border-left: none;
}

/* Coming Soon Sections */
.coming-soon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  height: 100%;
  width: 100%;
  font-size: 1.4rem;
  font-weight: bold;
  color: #444;
}

/* Expand "Coming Soon" Sections */
.wellness {
  border-left: 8px solid blue;
}
.sleep {
  grid-column: span 2;
  border-left: 8px solid purple;
}

/* ------------------------------------------ */
/* FINAL OVERRIDES to beat global li { ... }  */
/* ------------------------------------------ */
.effects-box ul {
  list-style-type: disc !important;
  list-style-position: outside !important;
  padding-left: 20px !important;
  margin: 0 !important;
  width: auto !important;
}
.effects-box ul li {
  display: list-item !important;
  background: none !important;
  margin: 0 0 6px 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  width: auto !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  text-align: left !important;
  color: inherit !important;
  box-shadow: none !important;
  outline: none !important;
}
.effects-box * {
  text-align: left !important;
}

/* 
  Red "Remove" button toggles single-delete mode
*/
.remove-effect-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.remove-effect-btn:hover {
  background: #ff4d4d;
}

/* Indicate it's active with a slight glow */
.activeDelete {
  box-shadow: 0 0 5px rgba(255,0,0,0.8);
}

/* When in delete mode, highlight <li> with a light red background and pointer */
.delete-mode {
  cursor: pointer;
  background: rgba(255, 0, 0, 0.15);
  transition: background 0.2s;
}
.delete-mode:hover {
  background: rgba(255, 0, 0, 0.3);
}
</style>
