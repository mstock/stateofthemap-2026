---
---
/* =============================================================================
   STATE OF THE MAP 2026 — APPLICATION
   -----------------------------------------------------------------------------
   AJOUTER UNE LANGUE (3 étapes) :
     1. Copier assets/i18n/en.js → assets/i18n/xx.js et traduire les valeurs.
     2. Ajouter <script src="assets/i18n/xx.js"></script> dans index.html,
        juste à côté des autres scripts i18n (avant app.js).
     3. Ajouter une ligne { code:'xx', native:'Nom dans sa langue' } au
        tableau LANGUAGES ci-dessous.

   MODIFIER LES FLUX :
     Tout se passe dans le bloc CONFIG ci-dessous (URLs, UUID PeerTube,
     URL du lecteur 360°). Les intitulés affichés (titre, nom de salle)
     sont eux dans les fichiers assets/i18n/*.js, sous "channels".
   ============================================================================= */
(function(){
  "use strict";

  /* =========================================================================
     CONFIG
     ========================================================================= */
  const CONFIG = {
    peertubeInstance: "https://peertube.openstreetmap.fr",

    channels: [
      { id: "ch1", num: "01",   kind: "peertube", uuid: "dckBR2e4YcrjJkQrQv67mt" },
      { id: "ch2", num: "02",   kind: "peertube", uuid: "rHGTro2UhSN9XGzekQoVxP" },
      { id: "ch3", num: "03",   kind: "peertube", uuid: "5oNj2pdYsuJgfcVkrpwRat" },
      { id: "ch4", num: "04",   kind: "peertube", uuid: "tgnVaCkHp8So6zz1GtnhZU" },
      {
        // Lecteur 360° dédié (three.js + hls.js, gyroscope, pinch-to-zoom,
        // plein écran natif), hébergé et maintenu séparément sur
        // 360.k-prod.fr. On l'intègre tel quel en <iframe> — voir le
        // .htaccess de ce sous-domaine (dossier /sotm2026/) pour l'en-tête
        // CSP frame-ancestors qui autorise cette intégration croisée.
        id: "pano", num: "360°", kind: "pano",
        src: "{{ site.baseurl }}/stream/360/"
      }
    ],

    // p2p=1 est volontairement laissé activé : pour un évènement avec
    // beaucoup de spectateurs simultanés, le partage P2P de PeerTube
    // réduit la charge sur le serveur de diffusion.
    embedParams: "autoplay=1&warningTitle=0&p2p=1&peertubeLink=0",

    // Chaîne PeerTube qui recevra au fur et à mesure les rediffusions des
    // directs (une fois chaque session terminée). Ses vidéos sont listées
    // via l'API et ajoutées en vignettes après celle de la caméra 360°
    // (voir loadReplayChannel ci-dessous). Mettre à "" pour désactiver.
    replaysChannel: "sotm_2026",
  };

  const LANGUAGES = [
    { code: 'fr', native: 'Français' },
    { code: 'en', native: 'English' },
    { code: 'es', native: 'Español' },
    { code: 'de', native: 'Deutsch' },
    { code: 'it', native: 'Italiano' },
    { code: 'pt', native: 'Português' },
    { code: 'nl', native: 'Nederlands' },
    { code: 'ru', native: 'Русский' },
    { code: 'zh', native: '中文' },
    { code: 'ja', native: '日本語' },
    { code: 'ar', native: 'العربية' },
    { code: 'hi', native: 'हिन्दी' },
  ];
  // Langues qui se lisent de droite à gauche : bascule document.dir en
  // conséquence (voir applyStaticI18n) pour un alignement de texte correct.
  const RTL_LANGS = ['ar'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'sotm2026_lang';

  /* =========================================================================
     I18N
     ========================================================================= */
  function detectInitialLang(){
    try{
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGES.some(l => l.code === stored)) return stored;
    }catch(e){ /* localStorage indisponible (mode privé strict, etc.) */ }

    const nav = (navigator.language || navigator.userLanguage || '').slice(0,2).toLowerCase();
    if (LANGUAGES.some(l => l.code === nav)) return nav;
    return DEFAULT_LANG;
  }

  let currentLang = detectInitialLang();

  function dictFor(lang){
    return (window.SOTM_I18N && window.SOTM_I18N[lang]) || null;
  }

  function t(path, vars){
    const get = (obj, p) => p.split('.').reduce((o,k)=> (o && o[k] != null) ? o[k] : undefined, obj);
    let str = get(dictFor(currentLang), path);
    if (str == null) str = get(dictFor(DEFAULT_LANG), path);
    if (str == null) return path;
    if (vars){
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function applyStaticI18n(){
    document.documentElement.lang = currentLang;
    document.documentElement.dir = RTL_LANGS.includes(currentLang) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
  }

  function buildLangSwitch(){
    const select = document.getElementById('langSelect');
    select.innerHTML = LANGUAGES.map(l =>
      `<option value="${l.code}"${l.code === currentLang ? ' selected' : ''}>${l.native}</option>`
    ).join('');
    select.addEventListener('change', () => setLanguage(select.value));
  }

  function setLanguage(lang){
    if (!LANGUAGES.some(l => l.code === lang)) return;
    currentLang = lang;
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
    applyStaticI18n();
    rebuildLegendPreservingState();
    updateToolbarTexts();
    refreshLiveCount();
  }

  /* =========================================================================
     ÉTAT
     ========================================================================= */
  const els = {
    viewport: document.getElementById('stageViewport'),
    empty: document.getElementById('stageEmpty'),
    toolbar: document.getElementById('stageToolbar'),
    ttTag: document.getElementById('ttTag'),
    ttTitle: document.getElementById('ttTitle'),
    ttRoom: document.getElementById('ttRoom'),
    ttPopout: document.getElementById('ttPopout'),
    ttClose: document.getElementById('ttClose'),
    legendList: document.getElementById('legendList'),
    legendCollapse: document.getElementById('legendCollapse'),
    legendToggle: document.getElementById('legendToggle'),
    liveCountText: document.getElementById('liveCountText'),
  };

  let activeId = null;
  const metaCache = {};       // id -> { live, thumb }
  let replayVideos = [];      // toutes les rediffusions de CONFIG.replaysChannel
  let latestReplay = null;    // replayVideos[0] — sert de vignette unique dans la légende

  /* =========================================================================
     LÉGENDE
     ========================================================================= */
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function channelTitle(ch){
    return t('channels.' + ch.id + '.title');
  }

  const DEFAULT_EMBED_ALLOW = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';

  // Construit et affiche un lecteur iframe dans la scène, avec le titre
  // donné. Partagé entre les flux de CONFIG.channels et la lecture d'une
  // rediffusion choisie dans le sélecteur (voir plus bas).
  function playEmbed(src, title, allow){
    const iframe = document.createElement('iframe');
    iframe.className = 'fill';
    iframe.src = src;
    iframe.allow = allow || DEFAULT_EMBED_ALLOW;
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'origin';
    iframe.title = title;
    els.viewport.appendChild(iframe);
  }

  function embedUrl(ch){
    if (ch.kind === 'pano') return ch.src;
    return `${CONFIG.peertubeInstance}/videos/embed/${ch.uuid}?${CONFIG.embedParams}`;
  }

  // Pour tous les types de flux, la page à intégrer est aussi la
  // meilleure cible de pop-out : c'est le lecteur lui-même, rien d'autre
  // ne se charge.
  function popoutTarget(ch){
    return embedUrl(ch);
  }

  function openPopout(ch){
    const target = popoutTarget(ch);
    if (ch.kind === 'peertube'){
      window.open(target, '_blank', 'noopener,width=960,height=540');
    } else {
      // Vue 360° : on laisse l'utilisateur agrandir/redimensionner
      // librement, plus confortable pour regarder autour de soi.
      window.open(target, '_blank', 'noopener');
    }
  }

  function statusRowHTML(ch){
    if (ch.kind === 'pano'){
      return `<div class="status-row is-pano" data-status="${ch.id}"><span class="dot"></span><span>${t('status.pano')}</span></div>`;
    }
    return `<div class="status-row is-pending" data-status="${ch.id}"><span class="dot"></span><span>${t('status.pending')}</span></div>`;
  }

  // Une seule vignette pour toute la chaîne de rediffusions : elle
  // montre la dernière vidéo publiée (la chaîne en recevra des dizaines
  // au fil de l'évènement — hors de question d'en faire une carte
  // chacune). Un clic ouvre le sélecteur listant toutes les vidéos
  // disponibles (voir openReplayPicker), pas une lecture directe.
  function replaysTileHTML(animate, i){
    if (!latestReplay) return '';
    return `
      <li class="legend-item${animate ? ' is-entering' : ''}" id="item-replays"${animate ? ` style="--i:${i}"` : ''}>
        <button type="button" data-replays-hub aria-pressed="false">
          <span class="legend-thumb">
            <img class="legend-thumb-img${latestReplay.thumb ? ' is-loaded' : ''}" src="${latestReplay.thumb || ''}" alt="" loading="lazy">
            <span class="ph${latestReplay.thumb ? ' is-hidden' : ''}">VOD</span>
            <span class="legend-num">VOD</span>
          </span>
          <span class="legend-meta">
            <span class="t">${escapeHtml(latestReplay.title)}</span>
            <span class="r">${escapeHtml(t('legend.viewAllReplays', { count: replayVideos.length }))}</span>
          </span>
        </button>
      </li>
    `;
  }

  // `animate`: applique une animation d'entrée échelonnée aux cartes —
  // uniquement voulue au chargement initial du site, pas à chaque
  // reconstruction (changement de langue, arrivée de nouvelles
  // rediffusions), sous peine d'agiter l'interface inutilement.
  function buildLegend(animate){
    els.legendList.innerHTML = CONFIG.channels.map((ch, i) => `
      <li class="legend-item${animate ? ' is-entering' : ''}" id="item-${ch.id}"${animate ? ` style="--i:${i}"` : ''}>
        <button type="button" data-id="${ch.id}" aria-pressed="false">
          <span class="legend-thumb" id="thumb-${ch.id}">
            <img class="legend-thumb-img${ch.thumb ? ' is-loaded' : ''}" src="${ch.thumb || ''}" alt="" loading="lazy">
            <span class="ph${ch.thumb ? ' is-hidden' : ''}">${ch.kind === 'pano' ? '360°' : 'CH·' + ch.num}</span>
            <span class="legend-num">${ch.num}</span>
          </span>
          <span class="legend-meta">
            <span class="t">${escapeHtml(channelTitle(ch))}</span>
            ${ch.kind === 'pano' ? '' : `<span class="r">${t('channels.' + ch.id + '.room')}</span>`}
            ${statusRowHTML(ch)}
          </span>
        </button>
      </li>
    `).join('') + replaysTileHTML(animate, CONFIG.channels.length);

    els.legendList.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id === activeId){ selectChannel(null); }
        else { selectChannel(id); }
      });
    });
    const replaysBtn = els.legendList.querySelector('button[data-replays-hub]');
    if (replaysBtn) replaysBtn.addEventListener('click', openReplayPicker);
  }

  // Reconstruit la légende (après un changement de langue) sans perdre
  // l'état déjà connu : sélection active + statuts/miniatures déjà chargés.
  function rebuildLegendPreservingState(){
    buildLegend();
    setActiveLegendItem(activeId);
    Object.keys(metaCache).forEach(id => {
      const ch = CONFIG.channels.find(c => c.id === id);
      if (ch) applyMeta(ch, metaCache[id], /*skipCountRefresh=*/true);
    });
  }

  /* =========================================================================
     MÉTADONNÉES PEERTUBE (statut réel + miniature)
     -----------------------------------------------------------------------
     `isLive` indique seulement que la vidéo est CONFIGURÉE comme un
     direct — il reste vrai même quand le direct est en pause. Pour
     savoir s'il émet VRAIMENT en ce moment, PeerTube expose un champ
     `state` distinct ({ id, label }) avec, entre autres, les valeurs :
       - "Published"          → le direct émet bien en ce moment
       - "Waiting for live"   → créé, mais le flux n'a pas (ou plus) démarré
       - "Live ended"         → le direct s'est terminé
     On se base d'abord sur `state.label` (le plus lisible et le plus
     stable face aux évolutions de version), avec `state.id` en repli.
     ========================================================================= */
  function classifyLiveState(data){
    if (typeof data.isLive !== 'boolean') return 'unknown';
    if (!data.isLive) return 'offline'; // vidéo normale, pas un direct

    const label = String((data.state && data.state.label) || '').toLowerCase();
    const id = data.state && data.state.id;

    if (label.includes('waiting') || label.includes('attente')) return 'standby';
    if (label.includes('ended') || label.includes('end') || label.includes('termin')) return 'standby';
    if (label.includes('publi')) return 'live';

    // Repli sur l'identifiant numérique PeerTube si le libellé ne
    // correspond à aucun des cas ci-dessus (ex. instance traduite
    // dans une langue qu'on n'a pas anticipée).
    if (id === 4 || id === 5) return 'standby';  // WAITING_FOR_LIVE / LIVE_ENDED
    if (id === 1) return 'live';                  // PUBLISHED

    return 'live';
  }

  async function fetchMeta(ch){
    try{
      const res = await fetch(`${CONFIG.peertubeInstance}/api/v1/videos/${ch.uuid}`, { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return {
        thumb: data.thumbnailPath ? CONFIG.peertubeInstance + data.thumbnailPath : null,
        liveState: classifyLiveState(data),
        // Spectateurs simultanés (distinct de `views`, qui est un cumul
        // total depuis le début du direct et donc peu lisible en live).
        viewers: typeof data.viewers === 'number' ? data.viewers : null,
      };
    }catch(err){
      console.warn('[SOTM live] métadonnées indisponibles pour', ch.id, err);
      return { thumb: null, liveState: 'unknown', viewers: null };
    }
  }

  const STATUS_CLASS = {
    live: 'is-live',
    standby: 'is-standby',
    offline: 'is-offline',
    unknown: 'is-pending',
  };
  const STATUS_KEY = {
    live: 'status.live',
    standby: 'status.standby',
    offline: 'status.offline',
    unknown: 'status.unknown',
  };

  function applyMeta(ch, meta, skipCountRefresh){
    metaCache[ch.id] = meta;

    const thumbBox = document.getElementById('thumb-' + ch.id);
    if (thumbBox && meta.thumb){
      const img = thumbBox.querySelector('.legend-thumb-img');
      if (img){ img.src = meta.thumb; img.classList.add('is-loaded'); }
      const ph = thumbBox.querySelector('.ph');
      if (ph) ph.classList.add('is-hidden');
    }

    const row = document.querySelector(`.status-row[data-status="${ch.id}"]`);
    if (row){
      row.classList.remove('is-live','is-standby','is-offline','is-pending');
      row.classList.add(STATUS_CLASS[meta.liveState] || 'is-pending');
      // Le nombre de spectateurs simultanés (champ `viewers` de l'API
      // PeerTube) n'a de sens que si le flux est vraiment en direct —
      // affiché juste à côté du texte "En direct", plutôt que sur la
      // vignette où il faisait une pastille de trop.
      const viewersHTML = (meta.liveState === 'live' && typeof meta.viewers === 'number')
        ? `<span class="viewers"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/></svg>${meta.viewers}</span>`
        : '';
      row.innerHTML = `<span class="dot"></span><span>${t(STATUS_KEY[meta.liveState] || 'status.unknown')}</span>${viewersHTML}`;
    }

    if (!skipCountRefresh) refreshLiveCount();
  }

  function refreshLiveCount(){
    const peertubeChannels = CONFIG.channels.filter(c => c.kind === 'peertube');
    const known = peertubeChannels.filter(c => metaCache[c.id]);
    if (known.length < peertubeChannels.length){
      els.liveCountText.textContent = t('topbar.liveLoading');
      return;
    }
    const liveN = peertubeChannels.filter(c => metaCache[c.id] && metaCache[c.id].liveState === 'live').length;
    els.liveCountText.textContent = t('topbar.liveCount', { live: liveN, total: peertubeChannels.length });
  }

  function loadAllMeta(){
    CONFIG.channels.filter(c => c.kind === 'peertube').forEach(ch => {
      fetchMeta(ch).then(meta => applyMeta(ch, meta));
    });
  }

  // Statut + nombre de spectateurs simultanés évoluent en continu pendant
  // les 3 jours de l'évènement : on rafraîchit périodiquement plutôt
  // qu'une seule fois au chargement (sinon le compteur reste figé pour
  // quiconque garde l'onglet ouvert).
  const META_REFRESH_MS = 30000;
  setInterval(loadAllMeta, META_REFRESH_MS);

  /* =========================================================================
     REDIFFUSIONS (chaîne PeerTube CONFIG.replaysChannel)
     -----------------------------------------------------------------------
     Une fois chaque direct terminé, PeerTube en garde le replay sur la
     chaîne de la conférence — appelée à en recevoir des dizaines au fil
     de l'évènement. Plutôt qu'une vignette par vidéo (la légende serait
     illisible), une seule vignette représente toute la chaîne (la
     dernière vidéo publiée, à titre d'aperçu) ; cliquer dessus ouvre un
     sélecteur listant toutes les vidéos disponibles (voir
     openReplayPicker), pour choisir laquelle regarder.
     ========================================================================= */
  async function loadReplayChannel(){
    if (!CONFIG.replaysChannel) return;
    try{
      const res = await fetch(
        `${CONFIG.peertubeInstance}/api/v1/video-channels/${CONFIG.replaysChannel}/videos?count=100&sort=-publishedAt`,
        { mode: 'cors' }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      // Les 4 directs sont déjà affichés via leurs propres vignettes
      // (avec statut live tenu à jour) : on ne les duplique pas ici, et
      // on ignore aussi tout autre direct en cours pour la même raison —
      // seules les vidéos déjà terminées (replays) nous intéressent.
      const knownUuids = new Set(
        CONFIG.channels.filter(c => c.kind === 'peertube').map(c => c.uuid)
      );
      replayVideos = (data.data || [])
        .filter(v => !v.isLive && !knownUuids.has(v.shortUUID))
        .map(v => ({
          uuid: v.shortUUID,
          title: v.name,
          thumb: v.thumbnailPath ? CONFIG.peertubeInstance + v.thumbnailPath : null,
          views: typeof v.views === 'number' ? v.views : null,
        }));
      latestReplay = replayVideos[0] || null;
      rebuildLegendPreservingState();
    }catch(err){
      console.warn('[SOTM live] rediffusions indisponibles', err);
    }
  }

  const REPLAYS_REFRESH_MS = 60000;
  setInterval(loadReplayChannel, REPLAYS_REFRESH_MS);

  // Sélecteur listant toutes les rediffusions disponibles, affiché dans
  // la scène à la place du lecteur — pas de nouvelle fenêtre modale à
  // gérer, on réutilise l'espace déjà prévu pour ça.
  function openReplayPicker(){
    clearStage();
    activeId = 'replays';
    els.empty.hidden = true;
    els.toolbar.hidden = false;
    els.ttPopout.hidden = true;
    setActiveLegendItem('replays');
    els.ttTag.textContent = 'VOD';
    els.ttTitle.textContent = t('legend.replaysHeading');
    els.ttRoom.textContent = '';
    scrollStageIntoViewOnNarrow();

    const grid = document.createElement('div');
    grid.className = 'replay-picker fill';
    grid.innerHTML = replayVideos.map(v => `
      <button type="button" class="replay-picker-item" data-replay-uuid="${v.uuid}">
        <span class="thumb"><img src="${v.thumb || ''}" alt="" loading="lazy"></span>
        <span class="t">${escapeHtml(v.title)}</span>
        ${typeof v.views === 'number' ? `<span class="views"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/></svg>${v.views}</span>` : ''}
      </button>
    `).join('');
    els.viewport.appendChild(grid);

    grid.querySelectorAll('[data-replay-uuid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = replayVideos.find(x => x.uuid === btn.getAttribute('data-replay-uuid'));
        if (v) playReplay(v);
      });
    });
  }

  function playReplay(v){
    clearStage();
    activeId = 'replays';
    els.empty.hidden = true;
    els.toolbar.hidden = false;
    els.ttPopout.hidden = false;
    setActiveLegendItem('replays');
    els.ttTag.textContent = 'VOD';
    els.ttTitle.textContent = v.title;
    els.ttRoom.textContent = '';
    scrollStageIntoViewOnNarrow();

    const src = `${CONFIG.peertubeInstance}/videos/embed/${v.uuid}?${CONFIG.embedParams}`;
    els.ttPopout.onclick = () => window.open(src, '_blank', 'noopener,width=960,height=540');
    playEmbed(src, v.title);
  }

  /* =========================================================================
     SÉLECTION D'UN FLUX
     ========================================================================= */
  function clearStage(){
    els.viewport.querySelectorAll('.fill').forEach(n => n.remove());
  }

  function setActiveLegendItem(id){
    els.legendList.querySelectorAll('.legend-item').forEach(li => {
      const isActive = li.id === 'item-' + id;
      li.classList.toggle('active', isActive);
      const btn = li.querySelector('button');
      if (btn) btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function updateToolbarTexts(){
    if (!activeId) return;
    const ch = CONFIG.channels.find(c => c.id === activeId);
    if (!ch) return;
    els.ttTag.textContent = ch.num;
    els.ttTitle.textContent = channelTitle(ch);
    els.ttRoom.textContent = t('channels.' + ch.id + '.room');
  }

  // Sur mobile/tablette, la légende est désormais au-dessus de la scène
  // dans le flux normal de la page : après avoir choisi un flux dans la
  // liste, on amène doucement la scène à l'écran plutôt que de laisser
  // la personne chercher où le lecteur est apparu.
  function scrollStageIntoViewOnNarrow(){
    if (window.matchMedia('(max-width: 960px)').matches){
      requestAnimationFrame(() => {
        els.viewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function selectChannel(id){
    clearStage();

    if (!id){
      activeId = null;
      els.empty.hidden = false;
      els.toolbar.hidden = true;
      setActiveLegendItem(null);
      return;
    }

    const ch = CONFIG.channels.find(c => c.id === id);
    if (!ch) return;

    activeId = id;
    els.empty.hidden = true;
    els.toolbar.hidden = false;
    els.ttPopout.hidden = false;
    setActiveLegendItem(id);
    updateToolbarTexts();
    els.ttPopout.onclick = () => openPopout(ch);
    scrollStageIntoViewOnNarrow();

    const allow = ch.kind === 'pano'
      ? 'autoplay; fullscreen; picture-in-picture; gyroscope; accelerometer; magnetometer'
      : DEFAULT_EMBED_ALLOW;
    playEmbed(embedUrl(ch), channelTitle(ch), allow);
  }

  els.ttClose.addEventListener('click', () => selectChannel(null));

  // Repli/dépli animé de la liste des flux disponibles — utile une fois un
  // flux choisi, pour libérer de la place sans perdre la possibilité d'en
  // changer (il suffit de rouvrir la liste). L'animation elle-même est en
  // CSS pur (grid-template-rows, voir style.css) : ici on ne fait que
  // basculer une classe.
  els.legendToggle.addEventListener('click', () => {
    const collapsed = !els.legendCollapse.classList.contains('is-collapsed');
    els.legendCollapse.classList.toggle('is-collapsed', collapsed);
    els.legendToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });

  /* =========================================================================
     INITIALISATION
     ========================================================================= */
  applyStaticI18n();
  buildLangSwitch();
  buildLegend(/*animate=*/true);
  loadAllMeta();
  loadReplayChannel();

  // Lien direct : ?stream=ch2 sélectionne automatiquement ce flux.
  // Utilisé entre autres par les fenêtres ouvertes via le bouton "pop-out".
  const requested = new URLSearchParams(window.location.search).get('stream');
  if (requested && CONFIG.channels.some(c => c.id === requested)){
    selectChannel(requested);
  }

})();
