const FIREWORK_COLORS = ["#f25f5c", "#ffe066", "#70c1b3", "#247ba0", "#f7b267"];

const buildFireworks = (container) => {
  container.innerHTML = "";
  const burstCount = 4;
  const sparkCount = 12;

  for (let i = 0; i < burstCount; i += 1) {
    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = `${10 + Math.random() * 80}%`;
    firework.style.top = `${10 + Math.random() * 60}%`;

    for (let j = 0; j < sparkCount; j += 1) {
      const spark = document.createElement("span");
      const angle = (360 / sparkCount) * j;
      const color = FIREWORK_COLORS[(i + j) % FIREWORK_COLORS.length];
      const delay = `${Math.random() * 0.2}s`;
      spark.className = "spark";
      spark.style.setProperty("--angle", `${angle}deg`);
      spark.style.setProperty("--color", color);
      spark.style.setProperty("--delay", delay);
      firework.appendChild(spark);
    }

    container.appendChild(firework);
  }
};

const launchFireworks = (container) => {
  if (!container) {
    return;
  }
  container.classList.remove("active");
  buildFireworks(container);
  window.requestAnimationFrame(() => {
    container.classList.add("active");
  });
};

const resetFireworks = (container) => {
  if (!container) {
    return;
  }
  container.classList.remove("active");
  container.innerHTML = "";
};

export const initVariableTypeClassifier = () => {
  const container = document.getElementById("variable-classifier");
  if (!container || container.dataset.bound === "true") {
    return;
  }

  const poolList = container.querySelector("#variable-list");
  const items = Array.from(container.querySelectorAll(".variable-item"));
  const dropTargets = Array.from(container.querySelectorAll(".drop-target"));
  const checkBtn = container.querySelector("#classifier-check");
  const resetBtn = container.querySelector("#classifier-reset");
  const feedback = container.querySelector("#classifier-feedback");
  const fireworks = container.querySelector("#fireworks");
  const initialOrder = items.map((item) => item.dataset.itemId);
  let selectedId = null;

  const clearSelection = () => {
    items.forEach((item) => item.classList.remove("selected"));
    selectedId = null;
  };

  const selectItem = (item) => {
    clearSelection();
    selectedId = item.dataset.itemId;
    item.classList.add("selected");
  };

  const moveItem = (item, target) => {
    const list = target.classList.contains("drop-zone")
      ? target.querySelector(".drop-list")
      : poolList;
    list.appendChild(item);
    item.classList.remove("selected");
    item.classList.remove("correct", "incorrect");
    selectedId = null;
  };

  const clearFeedback = () => {
    feedback.textContent = "";
    feedback.classList.remove("success", "error");
  };

  items.forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", item.dataset.itemId);
      event.dataTransfer.effectAllowed = "move";
      item.classList.add("dragging");
      clearSelection();
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    item.addEventListener("click", (event) => {
      event.stopPropagation();
      selectItem(item);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectItem(item);
      }
    });
  });

  dropTargets.forEach((target) => {
    target.addEventListener("dragover", (event) => {
      event.preventDefault();
      target.classList.add("drop-over");
    });

    target.addEventListener("dragleave", () => {
      target.classList.remove("drop-over");
    });

    target.addEventListener("drop", (event) => {
      event.preventDefault();
      target.classList.remove("drop-over");
      const itemId = event.dataTransfer.getData("text/plain");
      const item = container.querySelector(`.variable-item[data-item-id="${itemId}"]`);
      if (item) {
        moveItem(item, target);
      }
      clearFeedback();
      resetFireworks(fireworks);
    });

    target.addEventListener("click", () => {
      if (!selectedId) {
        return;
      }
      const item = container.querySelector(`.variable-item[data-item-id="${selectedId}"]`);
      if (item) {
        moveItem(item, target);
      }
      clearFeedback();
      resetFireworks(fireworks);
    });
  });

  if (checkBtn) {
    checkBtn.addEventListener("click", () => {
      let correctCount = 0;
      items.forEach((item) => {
        const zone = item.closest(".drop-zone");
        const isCorrect = zone && zone.dataset.category === item.dataset.category;
        item.classList.toggle("correct", isCorrect);
        item.classList.toggle("incorrect", !isCorrect);
        if (isCorrect) {
          correctCount += 1;
        }
      });

      clearFeedback();
      if (correctCount === items.length) {
        feedback.textContent = "Ottimo! Tutte le variabili sono nella categoria corretta.";
        feedback.classList.add("success");
        launchFireworks(fireworks);
      } else {
        const remaining = items.length - correctCount;
        feedback.textContent = `Ci sono ${remaining} variabili da sistemare.`;
        feedback.classList.add("error");
        resetFireworks(fireworks);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      clearSelection();
      initialOrder.forEach((id) => {
        const item = container.querySelector(`.variable-item[data-item-id="${id}"]`);
        if (item) {
          poolList.appendChild(item);
        }
      });
      items.forEach((item) => item.classList.remove("correct", "incorrect", "selected"));
      clearFeedback();
      resetFireworks(fireworks);
    });
  }

  container.dataset.bound = "true";
};
