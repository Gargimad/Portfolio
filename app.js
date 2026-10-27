const loadingStartedAt = Date.now();
const minimumLoadingTime = 1500;
const loadingScreen = document.querySelector(".loading-screen");
const header = document.querySelector("#headerContent");
const skyCanvas = document.querySelector(".garden-canvas");
const bee = document.querySelector(".bee");
const portfolio = document.querySelector(".project-garden");

window.addEventListener("load", function () {
  if (!loadingScreen) {
    return;
  }

  const remainingTime = Math.max(
    0,
    minimumLoadingTime - (Date.now() - loadingStartedAt)
  );

  window.setTimeout(function () {
    loadingScreen.style.display = "none";
  }, remainingTime);
});

if (header && skyCanvas) {
  const context = skyCanvas.getContext("2d");

  if (context) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const heading = header.querySelector("h1");
    const flowerSlots = Array.from(
      document.querySelectorAll(".project-card .project-flower")
    );
    const clouds = [
      { x: 0.08, y: 0.12, size: 0.11, speed: 7, opacity: 0.82 },
      { x: 0.42, y: 0.24, size: 0.08, speed: 4, opacity: 0.64 },
      { x: 0.83, y: 0.1, size: 0.13, speed: 9, opacity: 0.78 },
      { x: 0.22, y: 0.47, size: 0.1, speed: 5, opacity: 0.58 },
      { x: 0.69, y: 0.58, size: 0.12, speed: 6, opacity: 0.65 },
      { x: 0.94, y: 0.77, size: 0.09, speed: 4, opacity: 0.55 },
    ];
    const birds = [
      { x: 0.16, y: 0.19, size: 8, speed: 9 },
      { x: 0.33, y: 0.16, size: 6, speed: 7 },
      { x: 0.7, y: 0.2, size: 9, speed: 6 },
      { x: 0.88, y: 0.28, size: 6, speed: 8 },
    ];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let lastTime = 0;
    let previousBeePosition = null;
    let beeDirection = 0;

    function wrap(value, range) {
      return ((value % range) + range) % range;
    }

    function resizeCanvas() {
      const bounds = header.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = header.offsetHeight;

      skyCanvas.width = Math.round(width * pixelRatio);
      skyCanvas.height = Math.round(height * pixelRatio);
      skyCanvas.style.width = `${width}px`;
      skyCanvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawSky(lastTime);
      updateBee();
    }

    function drawCloud(cloud, time) {
      const cloudWidth = Math.max(80, width * cloud.size);
      const cloudHeight = cloudWidth * 0.34;
      const x = wrap(
        cloud.x * width + (reducedMotion.matches ? 0 : time * cloud.speed),
        width + cloudWidth * 2
      ) - cloudWidth;
      const y = cloud.y * height;

      context.save();
      context.globalAlpha = cloud.opacity;
      context.fillStyle = "#fff";
      context.beginPath();
      context.ellipse(x, y, cloudWidth * 0.42, cloudHeight * 0.38, 0, 0, Math.PI * 2);
      context.ellipse(x + cloudWidth * 0.22, y - cloudHeight * 0.18, cloudWidth * 0.3, cloudHeight * 0.48, 0, 0, Math.PI * 2);
      context.ellipse(x + cloudWidth * 0.51, y, cloudWidth * 0.39, cloudHeight * 0.34, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function drawWind(time) {
      context.save();
      context.strokeStyle = "rgba(255, 255, 255, 0.36)";
      context.lineWidth = 1.5;
      context.lineCap = "round";

      for (let index = 0; index < 5; index += 1) {
        const range = width + 220;
        const x = wrap(index * width * 0.27 + time * 24, range) - 110;
        const y = height * (0.34 + index * 0.115);
        const length = Math.max(60, width * (0.12 + (index % 2) * 0.04));

        context.beginPath();
        context.moveTo(x, y);
        context.bezierCurveTo(
          x + length * 0.25,
          y - 11,
          x + length * 0.62,
          y + 10,
          x + length,
          y - 2
        );
        context.stroke();
      }

      context.restore();
    }

    function drawBird(bird, time) {
      const x = wrap(
        bird.x * width + (reducedMotion.matches ? 0 : time * bird.speed),
        width + 40
      ) - 20;
      const y = bird.y * height;

      context.beginPath();
      context.moveTo(x - bird.size, y);
      context.quadraticCurveTo(x - bird.size * 0.35, y + bird.size * 0.28, x, y + bird.size);
      context.quadraticCurveTo(x + bird.size * 0.35, y + bird.size * 0.28, x + bird.size, y);
      context.strokeStyle = "rgba(49, 79, 91, 0.7)";
      context.lineWidth = 1.6;
      context.lineCap = "round";
      context.stroke();
    }

    function drawSky(time) {
      context.clearRect(0, 0, width, height);
      clouds.forEach((cloud) => drawCloud(cloud, time));
      drawWind(time);
      birds.forEach((bird) => drawBird(bird, time));
    }

    function getScrollProgress() {
      const scrollableHeader = Math.max(
        1,
        header.offsetHeight - window.innerHeight
      );

      return Math.max(
        0,
        Math.min(1, -header.getBoundingClientRect().top / scrollableHeader)
      );
    }

    function updateBee(time = lastTime) {
      if (!bee || !heading || !portfolio || reducedMotion.matches) {
        if (bee) {
          bee.style.opacity = "0";
          bee.style.visibility = "hidden";
        }
        previousBeePosition = null;
        return;
      }

      if (getScrollProgress() < 0.025 && window.scrollY < 30) {
        bee.style.opacity = "0";
        bee.style.visibility = "hidden";
        previousBeePosition = null;
        return;
      }

      const headingBounds = heading.getBoundingClientRect();
      const scrollY = window.scrollY;
      const headingPageY = headingBounds.top + scrollY + headingBounds.height / 2;
      let x;
      let y;

      if (scrollY <= headingPageY) {
        const orbitX = Math.min(width * 0.34, headingBounds.width * 0.58 + 36);
        const orbitY = Math.max(42, headingBounds.height * 1.1);
        const angle = scrollY * 0.012 + time * 0.8;

        x = headingBounds.left + headingBounds.width / 2 + Math.cos(angle) * orbitX;
        y = headingBounds.top + headingBounds.height / 2 + Math.sin(angle) * orbitY;
      } else if (flowerSlots.length > 0) {
        const targets = [
          {
            x: headingBounds.left + headingBounds.width / 2,
            y: headingPageY,
            stageY: headingPageY,
          },
          ...flowerSlots.map(function (flower) {
            const bounds = flower.getBoundingClientRect();
            const pageY = bounds.top + bounds.height / 2 + scrollY;
            return {
              x: bounds.left + bounds.width / 2,
              y: pageY,
              stageY: pageY - window.innerHeight / 2,
            };
          }),
        ];
        let targetIndex = targets.length - 2;

        for (let index = 0; index < targets.length - 1; index += 1) {
          if (scrollY <= targets[index + 1].stageY) {
            targetIndex = index;
            break;
          }
        }

        const start = targets[targetIndex];
        const end = targets[targetIndex + 1];
        const segmentProgress = Math.max(
          0,
          Math.min(
            1,
            (scrollY - start.stageY) / Math.max(1, end.stageY - start.stageY)
          )
        );
        x = start.x + (end.x - start.x) * segmentProgress;
        y =
          start.y +
          (end.y - start.y) * segmentProgress -
          scrollY +
          Math.sin(segmentProgress * Math.PI) * 105;
      } else {
        x = headingBounds.left + headingBounds.width / 2;
        y = headingBounds.top + headingBounds.height / 2;
      }

      const beeCenter = { x, y };
      const deltaX = previousBeePosition ? x - previousBeePosition.x : 0;
      const deltaY = previousBeePosition ? y - previousBeePosition.y : 0;
      if (Math.hypot(deltaX, deltaY) > 0.5) {
        beeDirection = Math.atan2(deltaY, deltaX);
      }
      const inView = y > -70 && y < window.innerHeight + 70;
      const beeRotation = (beeDirection * 180) / Math.PI + 90;
      const horizontalFlip = Math.cos(beeDirection) > 0 ? -1 : 1;

      bee.style.visibility = inView ? "visible" : "hidden";
      bee.style.opacity = inView ? "1" : "0";
      bee.style.transform =
        `translate3d(${x - 41}px, ${y - 41}px, 0) ` +
        `rotate(${beeRotation}deg) scaleX(${horizontalFlip})`;
      previousBeePosition = beeCenter;
    }

    function animate(timestamp) {
      lastTime = timestamp / 1000;
      drawSky(lastTime);
      updateBee(lastTime);
      animationFrame = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (reducedMotion.matches) {
        drawSky(0);
        updateBee(0);
        return;
      }
      animationFrame = window.requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", function () {
      updateBee();
    }, { passive: true });
    reducedMotion.addEventListener("change", startAnimation);
    resizeCanvas();
    startAnimation();
  }
}
