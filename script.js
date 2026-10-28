/**
 * TOMUZA - TRABAJOS VERTICALES EN MADRID
 * Script interactivo: Operario en cuerda por scroll, modal cualificador, anti-spam y CRO.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';  // =========================================================================
  // 1. ANIMACION DEL OPERARIO EN CUERDA (SCROLL CLIMBER)
  // =========================================================================
  const ropeClimber = document.getElementById('ropeClimber');
  const climberWindStream = document.getElementById('climberWindStream');
  const climberTag = document.getElementById('climberTag');
  const ropeTrack = document.getElementById('ropeScrollTrack');
  const pulleyWheel = document.getElementById('pulleyWheel');
  const altMeters = document.getElementById('altMeters');
  const altFloor = document.getElementById('altFloor');
  const speechBubble = document.getElementById('climberSpeechBubble');

  let lastScrollY = window.scrollY;
  let targetClimberY = 0;
  let currentClimberY = 0;
  let targetRotation = 0;
  let currentRotation = 0;
  let isTicking = false;
  let speechTimer = null;

  // Control sutil de estela de viento (solo durante descenso)
  let lastWindTime = 0;

  // 5 Frases aleatorias en voz auténtica de operario de altura
  const climberQuotes = [
    '¡Todo asegurado a doble cuerda!',
    'Revisando paramento al detalle',
    'Bajando seguro y sin ruidos',
    'Trabajo limpio, sin tocar la acera',
    'Listo para cualquier altura'
  ];

  let lastQuoteIndex = -1;
  let isInitialLoad = true;

  function getRandomQuote() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * climberQuotes.length);
    } while (newIndex === lastQuoteIndex && climberQuotes.length > 1);

    lastQuoteIndex = newIndex;
    return climberQuotes[newIndex];
  }

  function spawnWindWisp(container) {
    if (!container) return;
    const line = document.createElement('span');
    line.className = 'wind-line';

    // Posicionamiento lateral visible a ambos lados del operario
    const isRight = Math.random() > 0.5;
    const posX = isRight ? (33 + Math.random() * 4) : (6 + Math.random() * 4);
    const startY = 14 + Math.random() * 20;
    const height = 24 + Math.random() * 10; // 24px a 34px de estela

    line.style.left = `${posX.toFixed(1)}px`;
    line.style.top = `${startY.toFixed(1)}px`;
    line.style.height = `${height.toFixed(1)}px`;

    container.appendChild(line);

    // Auto-limpieza garantizada al finalizar la animacion CSS
    line.addEventListener('animationend', () => {
      if (line.parentNode) line.remove();
    }, { once: true });
    // Salvaguarda
    setTimeout(() => {
      if (line.parentNode) line.remove();
    }, 500);
  }

  function updateClimberPosition() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const maxScroll = Math.max(1, docHeight - winHeight);
    const scrollRatio = Math.min(1, Math.max(0, scrollY / maxScroll));

    // Rango vertical de recorrido sobre la cuerda (con 54px de margen limpio sobre la polea)
    const topOffset = 130;
    const bottomPadding = 90;
    const availableHeight = winHeight - topOffset - bottomPadding;
    targetClimberY = scrollRatio * availableHeight;

    // Calculo de velocidad de scroll para balanceo pendular
    const scrollDiff = scrollY - lastScrollY;
    lastScrollY = scrollY;
    
    // Inclinacion muy sutil del operario (max 6 grados, suave y natural)
    targetRotation = Math.max(-6, Math.min(6, scrollDiff * 0.2));

    // Modulo 1: Giro de polea mecanica en azotea
    if (pulleyWheel) {
      pulleyWheel.style.transform = `rotate(${scrollY * 0.8}deg)`;
    }

    // Modulo 1: Altimetro en tiempo real
    if (altMeters) {
      const currentMeters = (scrollRatio * 42).toFixed(1);
      altMeters.textContent = `-${currentMeters}m`;
    }
    if (altFloor) {
      if (scrollRatio < 0.08) {
        altFloor.textContent = 'Azotea';
      } else if (scrollRatio > 0.94) {
        altFloor.textContent = 'Planta Baja';
      } else {
        const floorNum = Math.max(1, Math.round((1 - scrollRatio) * 14));
        altFloor.textContent = `Planta ${floorNum}`;
      }
    }

    // Modulo 1: Bocadillo de comic reactivo (escritorio) con frases aleatorias
    // (Aparicion inicial tras 1.5s de carga, o 2s tras detenerse el scroll)
    if (speechBubble && window.innerWidth >= 768) {
      speechBubble.classList.remove('bubble--visible');
      clearTimeout(speechTimer);
      const delay = isInitialLoad ? 1500 : 2000;
      speechTimer = setTimeout(() => {
        speechBubble.textContent = getRandomQuote();
        speechBubble.classList.add('bubble--visible');
        isInitialLoad = false;
      }, delay);
    }

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderClimberPhysics);
    }
  }

  function renderClimberPhysics() {
    // Interpolacion de seguimiento suave (Lerp)
    currentClimberY += (targetClimberY - currentClimberY) * 0.12;
    currentRotation += (targetRotation - currentRotation) * 0.1;

    // Decaimiento del balanceo
    targetRotation *= 0.85;

    // Detectar si el operario esta descendiendo activamente
    // Solo cuando se baja (targetClimberY > currentClimberY) con avance perceptible
    const isDescending = (targetClimberY - currentClimberY) > 0.2;

    if (isDescending && climberWindStream) {
      const now = performance.now();
      // Emitir micro-linea cada ~100ms durante el descenso (maximo 3 lineas activas)
      if (now - lastWindTime > 80) {
        lastWindTime = now;
        if (climberWindStream.childElementCount < 3) {
          spawnWindWisp(climberWindStream);
        }
      }
    }

    if (ropeClimber) {
      ropeClimber.style.transform = `translate3d(0, ${currentClimberY}px, 0) rotate(${currentRotation}deg)`;
    }

    if (Math.abs(targetClimberY - currentClimberY) > 0.1 || Math.abs(currentRotation) > 0.05) {
      requestAnimationFrame(renderClimberPhysics);
    } else {
      isTicking = false;
    }
  }

  window.addEventListener('scroll', updateClimberPosition, { passive: true });
  window.addEventListener('resize', updateClimberPosition, { passive: true });
  updateClimberPosition();

  // =========================================================================
  // 2. CABECERA STICKY CON CAMBIO DE ESTADO
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader');
  function checkHeaderScroll() {
    if (window.scrollY > 30) {
      siteHeader?.classList.add('site-header--scrolled');
    } else {
      siteHeader?.classList.remove('site-header--scrolled');
    }
  }
  window.addEventListener('scroll', checkHeaderScroll, { passive: true });
  checkHeaderScroll();

  // =========================================================================
  // 3. MODAL CUALIFICADOR MULTI-PASO Y ANTI-SPAM
  // =========================================================================
  const leadModal = document.getElementById('leadModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalFinalCloseBtn = document.getElementById('modalFinalCloseBtn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const modalSteps = document.querySelectorAll('.modal-step');
  const progressFill = document.getElementById('modalProgressFill');
  const progressText = document.getElementById('modalProgressText');
  const leadForm = document.getElementById('leadForm');
  const prevStepBtns = document.querySelectorAll('.prev-step-btn');
  const nextStepBtns = document.querySelectorAll('.next-step-btn');

  let currentStep = 1;
  let lockedScrollY = 0;

  const leadData = {
    service: '',
    buildingType: '',
    urgency: '',
    name: '',
    phone: '',
    location: ''
  };

  const savingsData = {
    'Fachadas': 'Ahorras entre 800€ y 2.400€ al no pagar tasa de ocupación de acera ni semanas de alquiler de andamio.',
    'Tejados': 'Ahorras hasta un 35% en accesos complejos: anclaje directo a cubierta en 40 minutos.',
    'Bajantes': 'Ahorras entre 500€ y 1.600€: sustitución vertical en patios de luces sin molestar a los vecinos.',
    'Pintura': 'Ahorro directo de hasta el 40% respecto a montaje de andamiaje perimetral completo.',
    'Antiaves': 'Instalación ágil en 24-48h sin andamios, sin ruidos y sin trámites burocráticos.',
    'Urgencia 24h': 'Intervención de emergencia inmediata sin trámites burocráticos de ocupación de vía pública.'
  };

  function updateSavingsEstimator(serviceKey) {
    const estimator = document.getElementById('savingsEstimator');
    const desc = document.getElementById('savingsDesc');
    if (estimator && desc && savingsData[serviceKey]) {
      desc.textContent = savingsData[serviceKey];
      estimator.style.display = 'block';
    }
  }

  function checkStepNextState(stepNum) {
    if (stepNum === 1) {
      const nextBtn = document.getElementById('nextStep1Btn');
      if (nextBtn) nextBtn.disabled = !leadData.service;
    } else if (stepNum === 2) {
      const nextBtn = document.getElementById('nextStep2Btn');
      if (nextBtn) nextBtn.disabled = !leadData.buildingType;
    } else if (stepNum === 3) {
      const nextBtn = document.getElementById('nextStep3Btn');
      if (nextBtn) nextBtn.disabled = !leadData.urgency;
    }
  }

  function openModal(defaultService = '') {
    if (!leadModal) return;

    // 1. Congelar y anclar estrictamente la pantalla en la posicion actual
    lockedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    leadModal.classList.add('modal-overlay--active');

    // Mapeo amigable de data-service a valor del modal
    const serviceMap = {
      'fachadas': 'Fachadas',
      'bajantes': 'Bajantes',
      'impermeabilizacion': 'Tejados',
      'pintura': 'Pintura',
      'antiaves': 'Antiaves',
      'urgencia': 'Urgencia 24h'
    };

    const targetService = serviceMap[defaultService.toLowerCase()] || '';
    if (targetService) {
      leadData.service = targetService;
      const step1Parent = document.querySelector('.modal-step[data-step="1"]');
      if (step1Parent) {
        step1Parent.querySelectorAll('.option-btn').forEach(b => {
          if (b.getAttribute('data-value') === targetService) {
            b.classList.add('option-btn--selected');
          } else {
            b.classList.remove('option-btn--selected');
          }
        });
      }
      updateSavingsEstimator(targetService);
    }

    goToStep(1);
  }

  function closeModal() {
    if (!leadModal) return;
    leadModal.classList.remove('modal-overlay--active');

    // 2. Restaurar el estado y scroll de la pagina sin saltos
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('left');
    document.body.style.removeProperty('right');
    document.body.style.removeProperty('width');
    document.body.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow');

    window.scrollTo(0, lockedScrollY);
  }

  // Prevenir cualquier intento de scroll táctil fuera del contenido del modal
  leadModal?.addEventListener('touchmove', (e) => {
    const card = e.target.closest('.modal-card');
    if (!card) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevenir propagacion de rueda de raton al fondo
  leadModal?.addEventListener('wheel', (e) => {
    const card = e.target.closest('.modal-card');
    if (!card) {
      e.preventDefault();
    }
  }, { passive: false });

  function goToStep(stepNumber) {
    currentStep = stepNumber;
    modalSteps.forEach(step => {
      const stepIndex = parseInt(step.getAttribute('data-step') || '0', 10);
      if (stepIndex === currentStep) {
        step.classList.add('modal-step--active');
      } else {
        step.classList.remove('modal-step--active');
      }
    });

    // Resetear scroll interno del modal al cambiar de paso
    const modalCard = leadModal?.querySelector('.modal-card');
    if (modalCard) modalCard.scrollTop = 0;

    // Actualizar barra de progreso
    if (progressFill && progressText) {
      const percentage = (currentStep / 4) * 100;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `Paso ${currentStep} de 4`;
    }

    checkStepNextState(currentStep);
  }

  // Event Listeners para abrir modal
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || 'general';
      openModal(service);
    });
  });

  // Cerrar modal
  modalCloseBtn?.addEventListener('click', closeModal);
  modalFinalCloseBtn?.addEventListener('click', closeModal);

  leadModal?.addEventListener('click', (e) => {
    if (e.target === leadModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leadModal?.classList.contains('modal-overlay--active')) {
      closeModal();
    }
  });

  // Seleccion de opciones en pasos 1, 2 y 3:
  // MODELO HIBRIDO: 1er clic selecciona (permite leer con calma) y habilita "Continuar".
  // 2º clic sobre la misma tarjeta O clic en el boton "Continuar" avanza al siguiente paso.
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepParent = btn.closest('.modal-step');
      if (!stepParent) return;

      const stepNum = parseInt(stepParent.getAttribute('data-step') || '1', 10);
      const value = btn.getAttribute('data-value') || '';
      const isAlreadySelected = btn.classList.contains('option-btn--selected');

      // Si ya estaba seleccionada: el segundo clic es de confirmacion inmediata
      if (isAlreadySelected) {
        if (currentStep < 4) {
          goToStep(currentStep + 1);
        }
        return;
      }

      // Si es el primer clic o cambio de opcion: marcar visualmente
      stepParent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('option-btn--selected'));
      btn.classList.add('option-btn--selected');

      if (stepNum === 1) {
        leadData.service = value;
        updateSavingsEstimator(value);
      } else if (stepNum === 2) {
        leadData.buildingType = value;
      } else if (stepNum === 3) {
        leadData.urgency = value;
      }

      checkStepNextState(stepNum);
    });
  });

  // Botones 'Continuar' en pasos 1, 2 y 3
  nextStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < 4) {
        goToStep(currentStep + 1);
      }
    });
  });

  // Boton 'Atras'
  prevStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  });

  // Envio de formulario con validacion y trampa anti-spam silenciosa
  leadForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Doble Trampa Honeypot: si algun campo oculto tiene valor, es un bot
    const botWebsite = document.getElementById('bot_website');
    const contactConfirm = document.getElementById('contact_confirm');
    if ((botWebsite && botWebsite.value.trim() !== '') || (contactConfirm && contactConfirm.value.trim() !== '')) {
      // Fingir exito silencioso para no alertar al bot
      showSuccessStep();
      return;
    }

    const nameInput = document.getElementById('userName');
    const phoneInput = document.getElementById('userPhone');
    const locationInput = document.getElementById('userLocation');

    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.replace(/\s+/g, '') || '';

    // Validacion basica de nombre
    if (name.length < 2) {
      alert('Por favor, indica un nombre o persona de contacto.');
      nameInput?.focus();
      return;
    }

    // Validacion de telefono (al menos 9 digitos)
    const phoneRegex = /^[+]?[0-9]{9,13}$/;
    if (!phoneRegex.test(phone)) {
      alert('Por favor, introduce un número de teléfono válido (ej: 642 93 62 54).');
      phoneInput?.focus();
      return;
    }

    leadData.name = name;
    leadData.phone = phone;
    leadData.location = locationInput?.value.trim() || '';

    // Guardar registro simulado en localStorage para persistencia
    try {
      const storedLeads = JSON.parse(localStorage.getItem('tomuza_leads') || '[]');
      storedLeads.push({
        ...leadData,
        date: new Date().toISOString()
      });
      localStorage.setItem('tomuza_leads', JSON.stringify(storedLeads));
    } catch (err) {
      console.warn('LocalStorage no disponible:', err);
    }

    showSuccessStep();
  });

  function showSuccessStep() {
    modalSteps.forEach(s => s.classList.remove('modal-step--active'));
    const successStep = document.getElementById('successStep');
    if (successStep) {
      successStep.classList.add('modal-step--active');
    }
    if (progressFill && progressText) {
      progressFill.style.width = '100%';
      progressText.textContent = '¡Completado!';
    }
  }

  // =========================================================================
  // 4. AVISO DE CUMPLIMIENTO LEGAL (COOKIES / PRIVACIDAD)
  // =========================================================================
  const complianceBar = document.getElementById('complianceBar');
  const acceptComplianceBtn = document.getElementById('acceptComplianceBtn');

  if (localStorage.getItem('tomuza_compliance_consent') === 'true') {
    complianceBar?.classList.add('hidden');
  }

  acceptComplianceBtn?.addEventListener('click', () => {
    localStorage.setItem('tomuza_compliance_consent', 'true');
    complianceBar?.classList.add('hidden');
  });

  // =========================================================================
  // 5. NAVEGACION SUAVE CON COMPENSACION DE HEADER
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.startsWith('#!')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 70;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =========================================================================
  // 6. ANIO ACTUAL EN FOOTER
  // =========================================================================
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  // =========================================================================
  // 7. MODULO DETALLE 3: FISICA DEL CURSOR INERCIAL SEDOSO (SOLO ESCRITORIO)
  //    - Circulo mediano con aceleracion progresiva y velocidad maxima contenida
  //    - Ocultable / desactivable de forma modular
  // =========================================================================
  (function initSmoothCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let vx = 0;
    let vy = 0;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      isVisible = true;
    });

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, input, select, textarea, label, [role="button"], .btn, .dock-btn, .option-btn, .service-card, .faq-trigger, .tab-btn');
      if (target) {
        ring.classList.add('cursor-ring--hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, input, select, textarea, label, [role="button"], .btn, .dock-btn, .option-btn, .service-card, .faq-trigger, .tab-btn');
      if (target) {
        ring.classList.remove('cursor-ring--hover');
      }
    }, { passive: true });

    window.addEventListener('mousedown', () => ring.classList.add('cursor-ring--click'), { passive: true });
    window.addEventListener('mouseup', () => ring.classList.remove('cursor-ring--click'), { passive: true });

    function renderCursor() {
      if (isVisible) {
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        const spring = 0.075;
        const friction = 0.68;

        vx = (vx + dx * spring) * friction;
        vy = (vy + dy * spring) * friction;

        const maxSpeed = 26;
        const speed = Math.hypot(vx, vy);
        if (speed > maxSpeed) {
          const factor = maxSpeed / speed;
          vx *= factor;
          vy *= factor;
        }

        currentX += vx;
        currentY += vy;

        ring.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(renderCursor);
    }

    requestAnimationFrame(renderCursor);
  })();

  // =========================================================================
  // EXTRA 2: HAZ DE LINTERNA FRONTAL EN PANELES OSCUROS (FACILMENTE EXTRAIBLE)
  // - Si deseas retirar la Idea 2, basta con eliminar o comentar este bloque.
  // =========================================================================
  (function initHeadlampEffect() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    
    const darkPanels = document.querySelectorAll('.has-headlamp-effect');
    darkPanels.forEach(panel => {
      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        panel.style.setProperty('--lamp-x', `${x}px`);
        panel.style.setProperty('--lamp-y', `${y}px`);
      }, { passive: true });
    });
  })();
});
