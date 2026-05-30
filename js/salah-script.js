const menuView = document.getElementById("menuView");
const guideView = document.getElementById("guideView");

const prayerTitle = document.getElementById("prayerTitle");
const prayerInfo = document.getElementById("prayerInfo");

const stepsContainer = document.getElementById("stepsContainer");

async function loadSalahGuide() {
  try {
    const response = await fetch("salah-data.json");
    const data = await response.json();

    const params = new URLSearchParams(window.location.search);
    const prayerKey = params.get("prayer");

    if (!prayerKey || !data.prayers[prayerKey]) {
      showMenu();
      return;
    }

    renderPrayer(data, prayerKey);

  } catch (error) {
    console.error("Failed to load salah data:", error);
  }
}

function showMenu() {
  menuView.classList.remove("hidden");
  guideView.classList.add("hidden");
}

function renderPrayer(data, prayerKey) {
  const prayer = data.prayers[prayerKey];

  menuView.classList.add("hidden");
  guideView.classList.remove("hidden");

  prayerTitle.textContent = prayer.name;
  prayerInfo.textContent = `${prayer.rakaat} Rakaat • ${prayer.arabicName}`;

  stepsContainer.innerHTML = "";

  prayer.steps.forEach((stepId, index) => {
    const step = data.definitions[stepId];

    if (!step) return;

    // =========================================
    // META CARD (e.g. rakaat_repeat)
    // =========================================
    if (step.type === "meta") {
      const metaCard = document.createElement("div");
      metaCard.className = "meta-card";

      metaCard.innerHTML = `
        <div class="meta-arabic">${step.arabic}</div>
        <div class="meta-text">${step.translation_id}</div>
      `;

      stepsContainer.appendChild(metaCard);
      return;
    }

    // =========================================
    // TRANSITION CARD (Takbir antar gerakan)
    // =========================================
    if (step.type === "transition") {
      const transitionCard = document.createElement("div");
      transitionCard.className = "transition-card";

      transitionCard.innerHTML = `
        <div class="transition-arabic">${step.arabic}</div>
        <div class="transition-latin">${step.latin}</div>
      `;

      stepsContainer.appendChild(transitionCard);
      return;
    }

    // =========================================
    // NORMAL STEP CARD
    // =========================================
    const stepCard = document.createElement("article");
stepCard.className = "step-card";

stepCard.innerHTML = `
  <div class="step-number">${index + 1}</div>

  <h2 class="step-title">${step.title}</h2>

  <div class="arabic">${step.arabic}</div>

  <div class="latin">${step.latin}</div>

  <div class="translation-id">${step.translation_id}</div>

  ${step.translation_en ? `<div class="translation-en">${step.translation_en}</div>` : ""}
`;

    stepsContainer.appendChild(stepCard);
  });
}

loadSalahGuide();