document.addEventListener("DOMContentLoaded", function () {
  const bonusButton = document.getElementById("bonus-button");
  bonusButton.classList.add("pulse-animation");

  const sliderContainer = document.querySelector(".slider-container");
  const slides = document.querySelectorAll(".slide");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  let index = 0;
  let autoPlayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  let isTransitioning = false;

  // Клонуємо перший і останній слайди
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  // Додаємо клони в контейнер
  sliderContainer.appendChild(firstClone);
  sliderContainer.insertBefore(lastClone, slides[0]);

  // Оновлюємо початкову позицію
  sliderContainer.style.transform = `translateX(-100%)`;
  let currentPosition = -100;

  function updateButtons() {
    prevButton.style.display = slides.length > 1 ? "block" : "none";
    nextButton.style.display = slides.length > 1 ? "block" : "none";
  }

  function transition(direction) {
    if (isTransitioning) return; // Блокуємо нову анімацію, якщо попередня ще не закінчилась

    isTransitioning = true;
    sliderContainer.style.transition = "transform 0.5s ease-in-out";

    if (direction === "next") {
      currentPosition -= 100;
      index++;
    } else {
      currentPosition += 100;
      index--;
    }

    sliderContainer.style.transform = `translateX(${currentPosition}%)`;
  }

  function checkBoundaries() {
    if (index === slides.length) {
      sliderContainer.style.transition = "none";
      currentPosition = -100;
      index = 0;
      sliderContainer.style.transform = `translateX(${currentPosition}%)`;
    }
    if (index === -1) {
      sliderContainer.style.transition = "none";
      currentPosition = -(slides.length * 100);
      index = slides.length - 1;
      sliderContainer.style.transform = `translateX(${currentPosition}%)`;
    }

    // Дозволяємо нову анімацію після завершення переходу
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitioning = false;
      });
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
      if (!isTransitioning) {
        transition("next");
      }
    }, 3000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // Оновлена обробка тач-подій
  function touchStart(event) {
    if (isTransitioning) return; // Ігноруємо нові тачі під час анімації

    stopAutoPlay();
    touchStartX = event.touches[0].clientX;
    isDragging = true;

    // Зберігаємо поточну позицію слайдера
    const style = window.getComputedStyle(sliderContainer);
    const matrix = new WebKitCSSMatrix(style.transform);
    currentPosition = (matrix.m41 / sliderContainer.offsetWidth) * 100;

    sliderContainer.style.transition = "none";
  }

  function touchMove(event) {
    if (!isDragging || isTransitioning) return;

    const currentX = event.touches[0].clientX;
    const diff = currentX - touchStartX;
    const movePercent = (diff / sliderContainer.offsetWidth) * 100;

    // Обмежуємо рух одним слайдом за раз
    const maxMove = 100;
    const limitedMove = Math.max(Math.min(movePercent, maxMove), -maxMove);

    const newPosition = currentPosition + limitedMove;
    sliderContainer.style.transform = `translateX(${newPosition}%)`;
  }

  function touchEnd(event) {
    if (!isDragging || isTransitioning) return;

    isDragging = false;
    touchEndX = event.changedTouches[0].clientX;

    const diff = touchEndX - touchStartX;
    const movePercent = (diff / sliderContainer.offsetWidth) * 100;

    sliderContainer.style.transition = "transform 0.5s ease-in-out";

    if (Math.abs(movePercent) > 50) {
      if (movePercent > 0) {
        transition("prev");
      } else {
        transition("next");
      }
    } else {
      // Повертаємось до початкової позиції
      sliderContainer.style.transform = `translateX(${currentPosition}%)`;
      isTransitioning = true; // Встановлюємо прапор для анімації повернення
    }

    startAutoPlay();
  }

  // Події для тач-пристроїв
  sliderContainer.addEventListener("touchstart", touchStart, { passive: true });
  sliderContainer.addEventListener("touchmove", touchMove, { passive: true });
  sliderContainer.addEventListener("touchend", touchEnd);

  // Події для кнопок
  nextButton.addEventListener("click", () => {
    if (!isTransitioning) {
      stopAutoPlay();
      transition("next");
      startAutoPlay();
    }
  });

  prevButton.addEventListener("click", () => {
    if (!isTransitioning) {
      stopAutoPlay();
      transition("prev");
      startAutoPlay();
    }
  });

  sliderContainer.addEventListener("mouseenter", stopAutoPlay);
  sliderContainer.addEventListener("mouseleave", startAutoPlay);

  sliderContainer.addEventListener("transitionend", () => {
    checkBoundaries();
  });

  updateButtons();
  startAutoPlay();
});
