// MORGOTH® Train Invite 2026 — chaos scripts (no real tracking / no data stored)

(function () {
  const COOKIE_KEY = "morgoth_cookie_consent_v∞";
  const MODAL_KEY = "morgoth_modal_last";
  const photos = window.MORGOTH_PHOTOS || [];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function guestId(seed) {
    const n = Math.abs((seed * 7919 + 104729) % 900000) + 100000;
    return "GUEST #" + n;
  }

  function pickPhoto(i) {
    if (!photos.length) return "assets/logo.png";
    return photos[i % photos.length];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ——— LOUD DUBSTEP (Web Audio, starts on user gesture) ——— */
  let audioCtx = null;
  let musicOn = false;
  let musicNodes = [];

  function startLoudDubstep() {
    if (musicOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const master = audioCtx.createGain();
      master.gain.value = 0.95; // extremely loud for a browser tab
      master.connect(audioCtx.destination);

      // Wub bass
      const bass = audioCtx.createOscillator();
      bass.type = "sawtooth";
      bass.frequency.value = 55;
      const bassGain = audioCtx.createGain();
      bassGain.gain.value = 0.55;
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 1 / 3;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 40;
      lfo.connect(lfoGain);
      lfoGain.connect(bass.frequency);
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 180;
      filter.Q.value = 12;
      const filterLfo = audioCtx.createOscillator();
      filterLfo.frequency.value = 2;
      const filterLfoGain = audioCtx.createGain();
      filterLfoGain.gain.value = 2200;
      filterLfo.connect(filterLfoGain);
      filterLfoGain.connect(filter.frequency);
      bass.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(master);

      // Screech lead
      const lead = audioCtx.createOscillator();
      lead.type = "square";
      lead.frequency.value = 220;
      const leadGain = audioCtx.createGain();
      leadGain.gain.value = 0.12;
      const leadLfo = audioCtx.createOscillator();
      leadLfo.frequency.value = 8;
      const leadLfoGain = audioCtx.createGain();
      leadLfoGain.gain.value = 80;
      leadLfo.connect(leadLfoGain);
      leadLfoGain.connect(lead.frequency);
      lead.connect(leadGain);
      leadGain.connect(master);

      // Noise hats
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 6000;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.08;
      // gate the noise for "dubstep" rhythm
      const gate = audioCtx.createGain();
      gate.gain.value = 0;
      const now = audioCtx.currentTime;
      for (let t = 0; t < 60; t += 0.5) {
        gate.gain.setValueAtTime(0.9, now + t);
        gate.gain.exponentialRampToValueAtTime(0.01, now + t + 0.12);
      }
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gate);
      gate.connect(master);

      // Kick thump
      function scheduleKicks() {
        if (!musicOn || !audioCtx) return;
        const t0 = audioCtx.currentTime;
        for (let i = 0; i < 8; i++) {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.frequency.setValueAtTime(150, t0 + i * 0.5);
          osc.frequency.exponentialRampToValueAtTime(40, t0 + i * 0.5 + 0.2);
          g.gain.setValueAtTime(0.7, t0 + i * 0.5);
          g.gain.exponentialRampToValueAtTime(0.01, t0 + i * 0.5 + 0.25);
          osc.connect(g);
          g.connect(master);
          osc.start(t0 + i * 0.5);
          osc.stop(t0 + i * 0.5 + 0.3);
        }
        setTimeout(scheduleKicks, 4000);
      }

      bass.start();
      lfo.start();
      filterLfo.start();
      lead.start();
      leadLfo.start();
      noise.start();
      musicNodes = [bass, lfo, filterLfo, lead, leadLfo, noise, master];
      musicOn = true;
      scheduleKicks();
      updateMusicUi(true);

      // Optional real file if present — stacked on top, also max volume
      const fileAudio = $("#morgoth-audio");
      if (fileAudio) {
        fileAudio.volume = 1;
        fileAudio.loop = true;
        fileAudio.play().catch(() => {});
      }
    } catch (err) {
      console.warn("dubstep failed", err);
    }
  }

  function stopMusic() {
    musicOn = false;
    musicNodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (_) {}
    });
    musicNodes = [];
    const fileAudio = $("#morgoth-audio");
    if (fileAudio) {
      fileAudio.pause();
      fileAudio.currentTime = 0;
    }
    updateMusicUi(false);
  }

  function updateMusicUi(on) {
    $all("[data-music-toggle]").forEach((btn) => {
      btn.textContent = on ? "MUTE THE BASS" : "UNLEASH DUBSTEP";
      btn.classList.toggle("music-live", on);
    });
  }

  function bindMusic() {
    $all("[data-music-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (musicOn) stopMusic();
        else startLoudDubstep();
      });
    });
  }

  function openCookieWall() {
    const wall = $("#cookie-wall");
    if (wall) wall.classList.add("open");
  }

  function closeCookieWall() {
    const wall = $("#cookie-wall");
    if (wall) wall.classList.remove("open");
  }

  function maybeCookie() {
    const accepted = sessionStorage.getItem(COOKIE_KEY);
    if (!accepted) {
      setTimeout(openCookieWall, 600);
    } else {
      setTimeout(openCookieWall, 45000 + Math.random() * 30000);
    }
  }

  function bindCookies() {
    const wall = $("#cookie-wall");
    if (!wall) return;

    wall.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      if (t.matches("[data-cookie-accept]")) {
        sessionStorage.setItem(COOKIE_KEY, "lol");
        closeCookieWall();
        startLoudDubstep();
        setTimeout(openCookieWall, 20000);
      }
      if (t.matches("[data-cookie-essential]")) {
        closeCookieWall();
        startLoudDubstep();
        setTimeout(openCookieWall, 8000);
      }
      if (t.matches("[data-cookie-reject]")) {
        window.location.href = "terms.html#cookies";
      }
      if (t.matches("[data-cookie-more]")) {
        window.location.href = "terms.html";
      }
    });
  }

  function spawnModal() {
    const modal = $("#modal-spam");
    if (!modal) return;
    const last = Number(sessionStorage.getItem(MODAL_KEY) || 0);
    if (Date.now() - last < 12000) return;
    sessionStorage.setItem(MODAL_KEY, String(Date.now()));

    modal.style.top = 10 + Math.random() * 50 + "%";
    modal.style.left = 5 + Math.random() * 55 + "%";
    modal.classList.add("open");
  }

  function bindModal() {
    const modal = $("#modal-spam");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.matches("[data-modal-close]")) {
        modal.classList.remove("open");
        setTimeout(spawnModal, 25000);
      }
    });
    setTimeout(spawnModal, 4000 + Math.random() * 4000);
  }

  function showLoader(ms, msg) {
    const el = $("#loader-overlay");
    if (!el) return Promise.resolve();
    const text = el.querySelector("[data-loader-text]");
    if (text && msg) text.textContent = msg;
    el.classList.add("open");
    return new Promise((resolve) => {
      setTimeout(() => {
        el.classList.remove("open");
        resolve();
      }, ms || 1800);
    });
  }

  function bindDecoys() {
    $all("[data-decoy]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const mode = el.getAttribute("data-decoy");
        if (mode === "alert") {
          alert(
            el.getAttribute("data-decoy-msg") ||
              "ERROR 42069: Your vibe was rejected by the AI ethics board. Try being hotter."
          );
          return;
        }
        if (mode === "loader") {
          showLoader(2200, el.getAttribute("data-decoy-msg") || "SYNCHRONIZING WITH FLOCK…");
          return;
        }
        if (mode === "ads") {
          window.location.href = "ads.html";
          return;
        }
        if (mode === "support") {
          window.location.href = "support.html";
          return;
        }
        if (mode === "nowhere") {
          showLoader(1500, "REDIRECTING…").then(() => {
            window.location.href = el.getAttribute("href") || "ads.html";
          });
        }
      });
    });

    $all("[data-fake-back]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Back is a privilege reserved for Series B investors.");
      });
    });
  }

  function bindTicketWizard() {
    const root = $("#ticket-wizard");
    if (!root) return;
    let step = 1;
    const max = 4;

    function render() {
      $all("[data-step]", root).forEach((panel) => {
        panel.hidden = Number(panel.getAttribute("data-step")) !== step;
      });
      $all("[data-wizard-dot]", root).forEach((dot) => {
        dot.classList.toggle("on", Number(dot.getAttribute("data-wizard-dot")) <= step);
      });
      const bar = $("#ticket-progress-bar");
      if (bar) bar.style.width = Math.min(12 + step * 3, 22) + "%";
    }

    root.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.matches("[data-next]")) {
        e.preventDefault();
        showLoader(1200, "CHATGPTxGROK IS THINKING ABOUT YOUR FACE…").then(() => {
          if (step >= max) {
            window.location.href = "support.html?ticket=never";
            return;
          }
          step += 1;
          render();
        });
      }
      if (t.matches("[data-prev]")) {
        e.preventDefault();
        step = Math.max(1, step - 1);
        if (Math.random() < 0.35) {
          window.location.href = "pfdt.html";
          return;
        }
        render();
      }
    });

    render();
  }

  function bindTrainCoin() {
    const buy = $("#buy-coin");
    if (!buy) return;
    buy.addEventListener("click", (e) => {
      e.preventDefault();
      showLoader(2500, "CONNECTING TO SKUNKCHAIN…\nGAS FEES: YOUR SOUL").then(() => {
        const err = $("#coin-error");
        if (err) {
          err.hidden = false;
          err.textContent =
            "TRANSACTION REVERTED: Wallet looks mid. Buy more Train Coin® to unlock buying Train Coin®. Code: 0xDEADBEEF";
        }
        setTimeout(() => {
          window.location.href = "terms.html#train-coin";
        }, 2200);
      });
    });
  }

  function bindPfdt() {
    const form = $("#pfdt-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showLoader(2800, "SCANNING BONE STRUCTURE…\nCONSULTING JOE ROGAN…").then(() => {
        const out = $("#pfdt-result");
        if (!out) return;
        out.hidden = false;
        out.innerHTML =
          '<p class="err">REJECTED.</p><p class="slop">Pretty Face Score: <strong>3/10</strong>. It\'s giving NPC. Equity means fair access — you still pay full price. Apply to <a href="careers.html">become hotter</a> or buy <a href="train-coin.html">Train Coin®</a>. Stay delulu tho.</p>';
      });
    });
  }

  function bindBaitForms() {
    $all("[data-bait-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const msg =
          form.querySelector(".bait-msg") ||
          form.parentElement?.querySelector(".bait-msg");
        showLoader(1600, "UPLOADING YOUR DATA TO NOWHERE…\nNO CAP").then(() => {
          if (msg) {
            msg.hidden = false;
            msg.textContent =
              msg.getAttribute("data-success") ||
              "Synced to the cloud. Psych. Nothing was stored. Your autofill just got played. L + ratio.";
          } else {
            alert("Thanks. We threw it away immediately. Google autofill ate good though.");
          }
          form.reset();
        });
      });
    });
  }

  function bindSupport() {
    const form = $("#support-form");
    if (!form) return;
    const wait = $("#wait-time");
    if (wait) {
      let n = 847;
      setInterval(() => {
        n += Math.floor(Math.random() * 12);
        wait.textContent = n.toLocaleString() + " years";
      }, 2000);
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showLoader(2000, "OPENING TICKET WITH OUR AI AGENT…").then(() => {
        window.location.href = "tickets.html?from=support";
      });
    });
  }

  function bindTermsLoop() {
    const accept = $("#terms-accept");
    if (!accept) return;
    accept.addEventListener("click", (e) => {
      e.preventDefault();
      openCookieWall();
      showLoader(1000, "UPDATING TERMS…").then(() => {
        window.location.hash = "cookies";
        window.scrollTo(0, 0);
        alert("New terms dropped. Please accept again. Forever.");
      });
    });
  }

  function makeFlockOverlays(seed, count) {
    const boxes = [];
    const n = count || 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const top = 8 + ((seed * (i + 3) * 17) % 55);
      const left = 6 + ((seed * (i + 5) * 23) % 60);
      const w = 18 + ((seed * (i + 7)) % 22);
      const h = 22 + ((seed * (i + 11)) % 26);
      const conf = (72 + ((seed + i * 13) % 27)).toFixed(1);
      boxes.push(
        `<div class="flock-box" style="top:${top}%;left:${left}%;width:${w}%;height:${h}%">` +
          `<span class="flock-label">${guestId(seed + i * 97)}</span>` +
          `<span class="flock-conf">${conf}% match · FLOCK</span>` +
          `</div>`
      );
    }
    return boxes.join("");
  }

  function buildFlockCard(src, seed, extraClass) {
    return (
      `<figure class="flock-frame ${extraClass || ""}" data-seed="${seed}">` +
      `<img src="${src}" alt="CANDIDA® capture ${guestId(seed)}" loading="lazy">` +
      makeFlockOverlays(seed) +
      `<figcaption class="flock-cap">CANDIDA® · ${guestId(seed)} · DHS-adjacent</figcaption>` +
      `</figure>`
    );
  }

  function fillGallery() {
    const gallery = $("#candida-gallery");
    if (!gallery || !photos.length) return;
    const count = Math.min(24, photos.length);
    const picks = shuffle(photos).slice(0, count);
    gallery.innerHTML = picks
      .map((src, i) => buildFlockCard(src, 1000 + i * 37, "gallery-card"))
      .join("");
  }

  function fillPhotoSpam() {
    $all("[data-photo-spam]").forEach((el) => {
      const n = Number(el.getAttribute("data-photo-spam")) || 12;
      const start = Number(el.getAttribute("data-photo-offset")) || 0;
      const withFlock = el.hasAttribute("data-flock");
      let html = "";
      for (let i = 0; i < n; i++) {
        const src = pickPhoto(start + i);
        if (withFlock) {
          html += buildFlockCard(src, start * 13 + i * 41, "spam-card");
        } else {
          html += `<img class="spam-img jackpot-glow" src="${src}" alt="party" loading="lazy">`;
        }
      }
      el.innerHTML = html;
    });
  }

  function fillReels() {
    $all("[data-photo-reel]").forEach((reel) => {
      const n = Number(reel.getAttribute("data-photo-reel")) || 20;
      const start = Math.floor(Math.random() * Math.max(photos.length, 1));
      let html = "";
      for (let i = 0; i < n; i++) {
        const src = pickPhoto(start + i);
        html +=
          `<div class="reel-cell">` +
          `<img src="${src}" alt="" loading="lazy">` +
          `<span class="reel-tag">${guestId(start + i * 19)}</span>` +
          `</div>`;
      }
      // duplicate for seamless scroll
      reel.innerHTML = html + html;
    });
  }

  function fillHeroCollage() {
    const hero = $("#hero-collage");
    if (!hero || !photos.length) return;
    const picks = shuffle(photos).slice(0, 9);
    hero.innerHTML = picks
      .map((src, i) => buildFlockCard(src, 4200 + i * 53, "hero-card"))
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindCookies();
    maybeCookie();
    bindModal();
    bindDecoys();
    bindTicketWizard();
    bindTrainCoin();
    bindPfdt();
    bindSupport();
    bindTermsLoop();
    bindBaitForms();
    bindMusic();
    fillGallery();
    fillPhotoSpam();
    fillReels();
    fillHeroCollage();

    const logoImg = new Image();
    logoImg.onload = () => {
      $all(".logo-slot").forEach((s) => s.setAttribute("data-has-logo", "1"));
    };
    logoImg.src = "assets/logo.png";
  });

  window.Morgoth = { showLoader, openCookieWall, startLoudDubstep, stopMusic };
})();
