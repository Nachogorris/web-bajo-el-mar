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

  const updateHero = () => {
    const rect = hero.getBoundingClientRect();
    // Optimización: si el hero no está en pantalla, no hacemos nada para consumir 0% CPU/GPU.
    if (rect.bottom < 0) return;

    const isMobile = window.innerWidth <= 768;
    
    let progress;
    let rawProgress = 0;
    if (isMobile) {
      // En móvil, mapeamos el progreso a lo largo de un rango cómodo de 320px de scroll.
      const mobileScrollRange = 320;
      let scrollOffset = -rect.top; // Píxeles reales de scroll del hero
      rawProgress = clamp(scrollOffset / mobileScrollRange);
      progress = 0.65 + rawProgress * 0.32; // Rango suave de 0.65 a 0.97
    } else {
      const scrollableDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
      rawProgress = clamp(-rect.top / scrollableDistance);
      progress = rawProgress;
    }

    // Tiempo real en segundos para animar de forma constante y fluida
    const time = performance.now() * 0.001;

    const fishReveal = prefersReducedMotion ? 1 : smoothStep(0.006, 0.060, progress);
    const doorProgress = prefersReducedMotion ? 1 : clamp((progress - 0.055) / 0.56);
    const worldProgress = prefersReducedMotion ? 1 : smoothStep(0.11, 0.50, progress);
    const introLift = prefersReducedMotion ? 1 : smoothStep(0.39, 0.72, progress);
    const introFade = prefersReducedMotion ? 1 : 1 - smoothStep(0.96, 1.00, progress);
    const contentProgress = isMobile ? 1 : (prefersReducedMotion ? 1 : smoothStep(0.68, 0.92, progress));
    const cueProgress = prefersReducedMotion ? 0 : 1 - smoothStep(0.02, 0.16, progress);
    const glowProgress = prefersReducedMotion ? 0 : smoothStep(0.12, 0.36, progress) * (1 - smoothStep(0.84, 0.98, progress));

    const translateAmount = isMobile ? 25 : 22;
    const rotateAmount = isMobile ? 58 : 64;

    if (!isMobile) {
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

      if (doorShadow) doorShadow.style.opacity = String(clamp(0.38 - doorProgress * 0.36).toFixed(3));

      if (doorGlow) {
        doorGlow.style.opacity = String(glowProgress.toFixed(3));
        doorGlow.style.transform = `translate(-50%, -50%) scale(${(0.78 + doorProgress * 0.34).toFixed(3)})`;
      }

      if (heroIntro) {
        const introY = -50 - introLift * 18;
        const introScale = 1 - introLift * 0.20;
        heroIntro.style.opacity = String(introFade.toFixed(3));
        heroIntro.style.transform = `translate(-50%, ${introY.toFixed(2)}%) translateY(${-introLift * 4.5}vh) scale(${introScale.toFixed(3)})`;
      }
    }

    underwaterWorld.style.opacity = String(worldProgress.toFixed(3));
    underwaterWorld.style.transform = `scale(${(1.025 + doorProgress * 0.055).toFixed(3)})`;

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
      
      let entryProgress, spreadProgress, lateFade, travelDamp;

      if (isMobile) {
        // En móvil: movimiento lineal y directo sin saltos ni retrasos
        entryProgress = 1.0; // Ya han entrado
        spreadProgress = rawProgress; // Progreso de 0.0 a 1.0 totalmente acoplado al scroll manual
        lateFade = 1 - smoothStep(0.78, 0.95, rawProgress); // Desaparecen gradualmente al final del scroll
        travelDamp = 0.28; // Rango de movimiento corto
      } else {
        entryProgress = easeInOut((progress - (0.145 + delay)) / 0.27);
        spreadProgress = easeInOut((progress - (0.38 + delay * 0.55)) / 0.38);
        lateFade = 1 - smoothStep(0.97, 1.00, progress);
        travelDamp = 0.30;
      }

      const doorFollowX = sideDirection * translateAmount * doorProgress * (1 - entryProgress);
      const onDoorX = fromX + doorFollowX;
      const onDoorY = fromY;

      const throughDoorX = lerp(onDoorX, entryX, entryProgress);
      const throughDoorY = lerp(onDoorY, entryY, entryProgress);

      // Movimiento de flotación basado en tiempo: constante, lento y fluido
      const floatTime = time * (isMobile ? 0.38 : 0.65);
      const ampX = isMobile ? 0.42 : 1.1;
      const ampY = isMobile ? 0.32 : 0.85;

      const floatX = Math.sin(floatTime + delay * 19) * ampX;
      const floatY = Math.cos(floatTime * 0.85 + delay * 23) * ampY;

      const x = lerp(throughDoorX, endX, spreadProgress * travelDamp) + floatX;
      const y = lerp(throughDoorY, endY, spreadProgress * travelDamp) + floatY;

      // Rotación suave a lo largo del tiempo
      const angle = lerp(lerp(rot * 0.15, rot + sideDirection * -4, entryProgress), endRot, spreadProgress * travelDamp) + Math.sin(time * (isMobile ? 0.4 : 1.1) + delay * 7) * (isMobile ? 1.1 : 2.2) * spreadProgress;
      const fishScale = lerp(scale * (0.72 + entryProgress * 0.24), endScale, spreadProgress * travelDamp);
      const opacity = clamp(fishReveal * lateFade * (0.58 + entryProgress * 0.20 + spreadProgress * 0.22));

      el.style.opacity = String(opacity.toFixed(3));
      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) rotate(${angle.toFixed(2)}deg) scale(${fishScale.toFixed(3)})`;
    });
  };

  // Bucle de animación continuo y optimizado
  const tick = () => {
    updateHero();
    requestAnimationFrame(tick);
  };
  tick();

  window.addEventListener("resize", () => updateHero());
  window.addEventListener("load", () => updateHero());
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

// ---------- Procesamiento de Formularios con FormSubmit + Mensaje de Éxito ----------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach(form => {
    const action = form.getAttribute("action");
    if (!action || !action.includes("formsubmit.co")) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "Enviar";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Enviando...";
      }

      let ajaxAction = action;
      if (action.includes("formsubmit.co/") && !action.includes("formsubmit.co/ajax/")) {
        ajaxAction = action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(ajaxAction, {
          method: "POST",
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (response.ok) {
          const isNewsletter = form.classList.contains("newsletter");
          form.innerHTML = `
            <div class="form-success-msg" style="padding: ${isNewsletter ? '1.2rem' : '2.5rem'}; text-align: center; background: rgba(20, 184, 166, 0.08); border: 1px solid rgba(20, 184, 166, 0.25); border-radius: 20px; width: 100%;">
              <div style="font-size: ${isNewsletter ? '1.8rem' : '2.8rem'}; margin-bottom: 0.3rem;">🎉</div>
              <h3 style="font-family: 'Fraunces', Georgia, serif; color: var(--deep); margin-bottom: 0.4rem; font-size: ${isNewsletter ? '1.1rem' : '1.5rem'};">¡Mensaje enviado con éxito!</h3>
              <p style="color: var(--muted); font-size: ${isNewsletter ? '0.85rem' : '0.95rem'}; margin: 0; line-height: 1.5;">${isNewsletter ? 'Te has suscrito correctamente a nuestra lista de correo.' : 'Hemos recibido tu solicitud. Nos pondremos en contacto contigo a la mayor brevedad posible.'}</p>
            </div>
          `;
        } else {
          throw new Error("Respuesta no OK");
        }
      } catch (err) {
        console.error("Error enviando formulario:", err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        alert("Hubo un problema al enviar el mensaje. Por favor inténtalo de nuevo o contáctanos directamente por teléfono/WhatsApp.");
      }
    });
  });
});
