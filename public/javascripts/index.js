document.addEventListener("DOMContentLoaded", function () {
  const scoreContainer = document.querySelector("#score-container");

  scoreContainer.addEventListener("click", () => {
    window.open("/score-panel", "_blank");
  })

  const clickableImages = document.querySelectorAll(".clickable-image");

  clickableImages.forEach(item => {
    item.addEventListener("click", () => {
      window.open(item.src, "_blank");
    });
  });

  function animateNumber(element, targetScore, duration) {
    return new Promise((resolve) => {
      const startScore = parseFloat(element.textContent);
      const difference = targetScore - startScore;
      const startTime = performance.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeOutCubic(progress);

        const currentScore = startScore + difference * easedProgress;
        element.textContent = Math.round(currentScore);

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          element.textContent = targetScore;
          resolve();
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  class AnimationQueue {
    constructor() {
      this.queue = [];
      this.isPlaying = false;
    }

    add(element, targetScore, duration) {
      this.queue.push({ element, targetScore, duration });
      if (!this.isPlaying) {
        this.playNext();
      }
    }

    async playNext() {
      if (this.queue.length === 0) {
        this.isPlaying = false;
        return;
      }

      this.isPlaying = true;
      const { element, targetScore, duration } = this.queue.shift();
      await animateNumber(element, targetScore, duration);
      this.playNext();
    }
  }
  const $blueScore = document.querySelector("#blue-score");
  const $yellowScore = document.querySelector("#yellow-score");

  const blueAnimationQueue = new AnimationQueue();
  const yellowAnimationQueue = new AnimationQueue();

  function updateTotalScores(totals) {
    if (typeof (totals.blueTotal) === "number" && typeof (totals.yellowTotal) === "number") {
      if (parseInt($blueScore.innerHTML) !== totals.blueTotal) {
        blueAnimationQueue.add($blueScore, totals.blueTotal, 1000);
      }
      if (parseInt($yellowScore.innerHTML) !== totals.yellowTotal) {
        yellowAnimationQueue.add($yellowScore, totals.yellowTotal, 3000);
      }
    }
  }

  const eventSource = new EventSource("/sse");

  eventSource.onmessage = function (event) {
    const totals = JSON.parse(event.data);
    updateTotalScores(totals);
  };

  fetch("/api/total-score")
    .then(response => response.json())
    .then(({ data }) => {
      updateTotalScores(data)
    });

  const $clock = document.querySelector("#clock");
  const targetDate = new Date("2024-07-06T10:00:00");

  function updateCountdown() {
    const currentDate = new Date();
    const timeDifference = targetDate - currentDate;

    if (timeDifference <= 0) {
      $clock.innerHTML = `0d 0h 0m 0s`;
    } else {
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      $clock.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  setInterval(updateCountdown, 1000);

  const $hamburger = document.querySelector("#hamburger");
  const $navItems = document.querySelector("#nav-items");

  $hamburger.addEventListener("click", function () {
    $navItems.classList.toggle("show");
  });

  const $mainContainer = document.querySelector("#main-container");

  function updateClockFontSize() {
    const containerWidth = $mainContainer.offsetWidth;
    const fontSize = containerWidth / 15;

    $clock.style.fontSize = `${fontSize}px`;
  }

  function updateScoreFontSize() {
    const containerWidth = $mainContainer.offsetWidth;
    const fontSize = containerWidth / 10;

    $blueScore.style.fontSize = `${fontSize}px`;
    $yellowScore.style.fontSize = `${fontSize}px`;
  }

  updateClockFontSize();
  updateScoreFontSize();

  window.addEventListener("resize", () => {
    updateClockFontSize();
    updateScoreFontSize();
  });
});