/* =========================================================
   ESCUELA INFANTIL BAJO EL MAR
   Interacciones globales + hero de puerta con peces SVG.
   ========================================================= */

// ---------- Header sticky y menú móvil ----------
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

function updateHeader(){
  if(!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 60);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive:true });

if(menuToggle && nav){
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- Hero: peces primero, apertura completa, bienvenida persistente ----------
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".home-gate-hero");
  if (!hero) return;

  const underwaterWorld = hero.querySelector(".underwater-world");
  const leftDoor = hero.querySelector(".door-panel.left");
  const rightDoor = hero.querySelector(".door-panel.right");
  const heroContent = hero.querySelector(".hero-content");
  const heroIntro = hero.querySelector(".hero-intro");
  const heroWelcomePanel = hero.querySelector(".hero-welcome-panel");
  const scrollCue = hero.querySelector(".scroll-cue");
  const doorShadow = hero.querySelector(".door-shadow");
  const doorGlow = hero.querySelector(".door-opening-glow");

  const doorFishes = Array.from(hero.querySelectorAll(".door-fish")).map((el, index) => ({
    el,
    side: el.dataset.side || "left",
    fromX: Number(el.dataset.fromX || 50),
    fromY: Number(el.dataset.fromY || 50),
    entryX: Number(el.dataset.midX || el.dataset.toX || 50),
    entryY: Number(el.dataset.midY || el.dataset.toY || 50),
    endX: Number(el.dataset.endX || el.dataset.midX || el.dataset.toX || 50),
    endY: Number(el.dataset.endY || el.dataset.midY || el.dataset.toY || 50),
    rot: Number(el.dataset.rot || 0),
    endRot: Number(el.dataset.endRot || el.dataset.rot || 0),
    scale: Number(el.dataset.scale || 1),
    endScale: Number(el.dataset.endScale || el.dataset.scale || 1),
    delay: index * 0.022
  }));

  if (!underwaterWorld || !leftDoor || !rightDoor || !heroContent) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const smoothStep = (start, end, value) => {
    const amount = clamp((value - start) / (end - start));
    return amount * amount * (3 - 2 * amount);
  };
  const easeOut = value => 1 - Math.pow(1 - clamp(value), 3);
  const easeInOut = value => {
    const t = clamp(value);
    return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  let autoOpenFrame = null;
  let savedScrollBehavior = null;

  const setPageScrollBehavior = value => {
    const html = document.documentElement;
    if (savedScrollBehavior === null) savedScrollBehavior = html.style.scrollBehavior || "";
    html.style.scrollBehavior = value;
  };

  const restorePageScrollBehavior = () => {
    if (savedScrollBehavior === null) return;
    document.documentElement.style.scrollBehavior = savedScrollBehavior;
    savedScrollBehavior = null;
  };

  const scrollHeroToFinalScene = () => {
    const startY = window.scrollY || window.pageYOffset || 0;
    const heroTop = hero.getBoundingClientRect().top + startY;
    const scrollableDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);

    const currentProgress = clamp((startY - heroTop) / scrollableDistance);
    const targetProgress = 0.99;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const targetY = clamp(heroTop + scrollableDistance * targetProgress, 0, maxScroll);
    const distance = Math.abs(targetY - startY);

    if (autoOpenFrame) {
      cancelAnimationFrame(autoOpenFrame);
      autoOpenFrame = null;
    }

    if (distance < 8 || currentProgress >= targetProgress - 0.01) {
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      requestUpdate();
      return;
    }

    /*
      Apertura por clic a ritmo constante y sin retrasos:
      - Se desactiva temporalmente el scroll-behavior:smooth del CSS para que
        cada frame vaya exactamente al punto calculado. Esto evita el retardo
        de varios segundos que provocaba el suavizado nativo del navegador.
      - El avance es lineal, sin easing, para que la puerta se vea abriéndose
        de forma continua desde el primer momento.
      - La duración depende del tramo de scroll restante, no de los píxeles,
        así la velocidad visual es estable en pantallas distintas.
    */
    setPageScrollBehavior("auto");

    const remainingProgress = Math.max(targetProgress - currentProgress, 0.02);
    const fullHeroDuration = 6400;
    const duration = prefersReducedMotion ? 0 : Math.max(900, remainingProgress * fullHeroDuration);
    const startTime = performance.now();

    hero.classList.add("is-opening-from-card");
    if (heroWelcomePanel) heroWelcomePanel.setAttribute("aria-pressed", "true");

    const finish = () => {
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      autoOpenFrame = null;
      requestUpdate();
      setTimeout(() => {
        hero.classList.remove("is-opening-from-card");
        if (heroWelcomePanel) heroWelcomePanel.setAttribute("aria-pressed", "false");
        restorePageScrollBehavior();
      }, 260);
    };

    const step = now => {
      const t = duration === 0 ? 1 : clamp((now - startTime) / duration);
      const y = lerp(startY, targetY, t);
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
      requestUpdate();

      if (t < 1) {
        autoOpenFrame = requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    // Primer frame inmediato: el usuario ve respuesta al clic sin esperar al scroll smooth del navegador.
    // La propia funcion step programa los siguientes frames.
    step(startTime);
  };

  if (heroWelcomePanel) {
    heroWelcomePanel.classList.add("is-clickable-ready");
    heroWelcomePanel.addEventListener("click", event => {
      event.preventDefault();
      scrollHeroToFinalScene();
    });
    heroWelcomePanel.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        scrollHeroToFinalScene();
      }
    });
  }

  let ticking = false;

  const updateHero = () => {
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const scrollableDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / scrollableDistance);

    /*
      Secuencia creativa:
      0.00 - 0.06  puerta cerrada; nacen los peces SVG sobre los peces reales de la puerta.
      0.06 - 0.62  la puerta se abre completamente hacia los lados a ritmo constante.
      0.18 - 0.42  los peces entran por la apertura.
      0.36 - 0.72  los peces se reparten por el mundo submarino.
      0.38 - 0.70  la bienvenida permanece y flota hacia arriba.
      0.64 - 0.90  aparece el mensaje comercial y CTAs de forma limpia.
    */
    const fishReveal = prefersReducedMotion ? 1 : smoothStep(0.006, 0.060, progress);
    // Apertura constante: primero aparecen los peces y la puerta empieza casi al instante al hacer clic.
    const doorProgress = prefersReducedMotion ? 1 : clamp((progress - 0.055) / 0.56);
    const worldProgress = prefersReducedMotion ? 1 : smoothStep(0.11, 0.50, progress);
    const introLift = prefersReducedMotion ? 1 : smoothStep(0.39, 0.72, progress);
    const introFade = prefersReducedMotion ? 1 : 1 - smoothStep(0.96, 1.00, progress);
    const contentProgress = prefersReducedMotion ? 1 : smoothStep(0.68, 0.92, progress);
    const cueProgress = prefersReducedMotion ? 0 : 1 - smoothStep(0.02, 0.16, progress);
    const glowProgress = prefersReducedMotion ? 0 : smoothStep(0.12, 0.36, progress) * (1 - smoothStep(0.84, 0.98, progress));

    const isMobile = window.innerWidth <= 760;
    const translateAmount = isMobile ? 25 : 22;
    const rotateAmount = isMobile ? 58 : 64;

    leftDoor.style.transform = `
      perspective(1400px)
      translateX(${-translateAmount * doorProgress}vw)
      rotateY(${-rotateAmount * doorProgress}deg)
    `;

    rightDoor.style.transform = `
      perspective(1400px)
      translateX(${translateAmount * doorProgress}vw)
      rotateY(${rotateAmount * doorProgress}deg)
    `;

    underwaterWorld.style.opacity = String(worldProgress.toFixed(3));
    underwaterWorld.style.transform = `scale(${(1.025 + doorProgress * 0.055).toFixed(3)})`;

    if (doorShadow) doorShadow.style.opacity = String(clamp(0.38 - doorProgress * 0.36).toFixed(3));

    if (doorGlow) {
      doorGlow.style.opacity = String(glowProgress.toFixed(3));
      doorGlow.style.transform = `translate(-50%, -50%) scale(${(0.78 + doorProgress * 0.34).toFixed(3)})`;
    }

    if (heroIntro) {
      // La bienvenida permanece visible, pero queda más baja y compacta para no chocar con el header.
      const introY = -50 - introLift * 18;
      const introScale = 1 - introLift * 0.20;
      heroIntro.style.opacity = String(introFade.toFixed(3));
      heroIntro.style.transform = `translate(-50%, ${introY.toFixed(2)}%) translateY(${-introLift * 4.5}vh) scale(${introScale.toFixed(3)})`;
    }

    if (heroContent) {
      heroContent.style.opacity = String(contentProgress.toFixed(3));
      heroContent.style.transform = `translate(-50%, -50%) translateY(${(34 - 34 * contentProgress).toFixed(2)}px) scale(${(0.965 + 0.035 * contentProgress).toFixed(3)})`;
      heroContent.style.pointerEvents = contentProgress > 0.82 ? "auto" : "none";
    }

    if (scrollCue) {
      scrollCue.style.opacity = String(cueProgress.toFixed(3));
      scrollCue.style.transform = `translateX(-50%) translateY(${(14 * (1 - cueProgress)).toFixed(2)}px)`;
      scrollCue.style.pointerEvents = cueProgress > 0.2 ? "auto" : "none";
    }

    doorFishes.forEach(({ el, side, fromX, fromY, entryX, entryY, endX, endY, rot, endRot, scale, endScale, delay }) => {
      const sideDirection = side === "left" ? -1 : 1;
      const entryProgress = easeInOut((progress - (0.145 + delay)) / 0.27);
      const spreadProgress = easeInOut((progress - (0.38 + delay * 0.55)) / 0.38);
      const lateFade = 1 - smoothStep(0.97, 1.00, progress);

      // Al principio el pez acompaña a la hoja, después se suelta hacia la apertura.
      const doorFollowX = sideDirection * translateAmount * doorProgress * (1 - entryProgress);
      const onDoorX = fromX + doorFollowX;
      const onDoorY = fromY;

      const throughDoorX = lerp(onDoorX, entryX, entryProgress);
      const throughDoorY = lerp(onDoorY, entryY, entryProgress);

      // Movimiento orgánico una vez dentro, con destinos separados para evitar la bola central.
      const floatX = Math.sin((progress * 13 + delay * 41) * Math.PI) * (0.55 + spreadProgress * 1.35);
      const floatY = Math.cos((progress * 11 + delay * 31) * Math.PI) * (0.45 + spreadProgress * 1.15);

      const x = lerp(throughDoorX, endX, spreadProgress) + floatX;
      const y = lerp(throughDoorY, endY, spreadProgress) + floatY;
      const angle = lerp(lerp(rot * 0.15, rot + sideDirection * -4, entryProgress), endRot, spreadProgress) + Math.sin(progress * 7 + delay * 9) * 2.2 * spreadProgress;
      const fishScale = lerp(scale * (0.72 + entryProgress * 0.24), endScale, spreadProgress);
      const opacity = clamp(fishReveal * lateFade * (0.58 + entryProgress * 0.20 + spreadProgress * 0.22));

      el.style.opacity = String(opacity.toFixed(3));
      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) rotate(${angle.toFixed(2)}deg) scale(${fishScale.toFixed(3)})`;
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHero);
  };

  updateHero();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
});

// ---------- Aparición suave de elementos ----------
const revealItems = document.querySelectorAll(".reveal,.card,.value-card,.program,.gallery-card,.post-card,.step");
if("IntersectionObserver" in window){
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold:.12 });

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 0.06}s`;
    io.observe(item);
  });
}else{
  revealItems.forEach(item => item.classList.add("visible"));
}

// ---------- Formularios estáticos ----------
document.querySelectorAll("[data-static-form]").forEach(form => {
  form.addEventListener("submit", () => {
    const btn = form.querySelector("button[type='submit']");
    if(btn){
      btn.textContent = "Abriendo tu correo...";
    }
  });
});
