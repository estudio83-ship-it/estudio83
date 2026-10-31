// KiwiAM: plan B para escuchar una AM (el 950) cuando su señal online oficial no responde.
// Uso: const h = KiwiAM.open(ctx, 950, destinoNode, {onState(state, h)}); h.volume = 0.5; h.close();
// Prueba en orden:
//   1. YouTube: el video en vivo que publica la web oficial de StreAM 950 (/api/live-stream).
//   2. YouTube: el vivo del canal "Origen AM950".
//      (YouTube funciona desde páginas https; el audio sale del reproductor, no pasa por el filtro AM.)
//   3. Receptores KiwiSDR de Buenos Aires / Montevideo: la onda AM real, del aire.
//      Solo hablan ws:// (sin TLS): el navegador lo permite si la página se abre desde la compu
//      (file://) o desde http://, y lo bloquea desde páginas https://.
// h.kind indica la fuente que quedó sonando: 'yt' o 'kiwi'.
(function(){
  const RECEIVERS = [
    { name: 'RAMOS MEJIA (LU4EEC)',          host: 'lu4eec.ddns.net',          port: 8073 },
    { name: 'RADIO CLUB ARGENTINO (LU4AA)',  host: 'lu4aa.proxy.kiwisdr.com',  port: null },
    { name: 'MONTEVIDEO (CX8BIT)',           host: 'cx8bit.proxy.kiwisdr.com', port: null },
  ];
  const YT_CHANNELS = ['UCrVXrl6-YV40UD9cNI5nsgA'];          // Origen AM950
  const OFFICIAL_API = 'https://stream950.com.ar/api/live-stream';
  const base = r => `${r.host}${r.port ? ':' + r.port : ''}`;
  // Página del receptor ya sintonizada (se abre aparte cuando no se puede conectar desde acá)
  const webLink = (khz, r = RECEIVERS[0]) => `http://${base(r)}/?f=${khz}am`;
  const canConnect = () => location.protocol !== 'https:';

  // ---------- YouTube ----------
  let ytReady = null;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(res => {
      if (window.YT && YT.Player) return res(true);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev && prev(); res(true); };
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => res(false); document.head.appendChild(s);
      setTimeout(() => res(!!(window.YT && YT.Player)), 8000);
    });
    return ytReady;
  }
  async function officialVideoId() {
    // la API oficial no permite consultas desde otras webs: se pasa por un proxy público de lectura
    const urls = [OFFICIAL_API,
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(OFFICIAL_API + '?t=' + Date.now()),
      'https://corsproxy.io/?url=' + encodeURIComponent(OFFICIAL_API)];
    for (const u of urls) {
      try {
        const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 5000);
        const r = await fetch(u, { signal: ac.signal, cache: 'no-store' }); clearTimeout(t);
        const j = await r.json(); if (j && j.videoId) return j.videoId;
        if (j && 'videoId' in j) return null;            // respondió: no hay vivo ahora
      } catch (e) {}
    }
    return null;
  }
  function ytPlay(opts, vol) {   // opts: {videoId} o {channel}
    return new Promise(async resolve => {
      if (!(await loadYT())) return resolve(null);
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:0;bottom:0;width:200px;height:113px;opacity:.01;pointer-events:none;z-index:-1';
      const inner = document.createElement('div'); host.appendChild(inner); document.body.appendChild(host);
      let done = false;
      const finish = p => { if (done) return; done = true; clearTimeout(t); if (!p) { try { player.destroy(); } catch (e) {} host.remove(); } resolve(p ? { player, host } : null); };
      const player = new YT.Player(inner, {
        width: 200, height: 113,
        videoId: opts.videoId || 'live_stream',
        playerVars: Object.assign({ autoplay: 1, controls: 0, playsinline: 1, rel: 0 }, opts.channel ? { channel: opts.channel } : {}),
        events: {
          onReady: e => { try { e.target.unMute(); e.target.setVolume(Math.round(vol() * 100)); e.target.playVideo(); } catch (x) {} },
          onStateChange: e => { if (e.data === 1) finish(true); if (e.data === 0) finish(false); },
          onError: () => finish(false),
        },
      });
      const t = setTimeout(() => finish(false), 12000);
    });
  }

  // ---------- receptores KiwiSDR (AM del aire) ----------
  function kiwi(ctx, khz, dest, h, state) {
    let ws = null, idx = 0, keep = null, playAt = 0, rate = 12000, gotAudio = false, timer = null;
    h._closers.push(() => { clearInterval(keep); clearTimeout(timer); try { ws && ws.close(); } catch (e) {} });
    function next() {
      if (h.closed) return;
      if (idx >= RECEIVERS.length) { state('nosig'); return; }
      const r = RECEIVERS[idx++];
      state('tuning'); gotAudio = false;
      try { ws = new WebSocket(`ws://${base(r)}/${Date.now()}/SND`); } catch (e) { next(); return; }
      ws.binaryType = 'arraybuffer';
      const send = m => { try { ws.send(m); } catch (e) {} };
      const setup = () => {
        send(`SET mod=am low_cut=-4900 high_cut=4900 freq=${khz.toFixed(3)}`);
        send('SET agc=1 hang=0 thresh=-100 slope=6 decay=1000 manGain=50');
        send('SET squelch=0 max=0');
        send('SET keepalive');
      };
      clearTimeout(timer);
      timer = setTimeout(() => { if (!gotAudio) { try { ws.close(); } catch (e) {} } }, 10000);
      ws.onopen = () => {
        send('SET auth t=kiwi p=');
        send('SET ident_user=E83-radio');
        send('SET compression=0');
        setup();
        keep = setInterval(() => send('SET keepalive'), 4000);
      };
      ws.onmessage = ev => {
        if (typeof ev.data === 'string') return;
        const u8 = new Uint8Array(ev.data);
        const tag = String.fromCharCode(u8[0], u8[1], u8[2]);
        if (tag === 'MSG') {
          const txt = new TextDecoder().decode(u8.subarray(4));
          const ar = txt.match(/audio_rate=(\d+)/);
          if (ar) { rate = +ar[1]; send(`SET AR OK in=${rate} out=44100`); }
          if (/sample_rate=/.test(txt)) { send('SET compression=0'); setup(); }   // el receptor ya está listo
          if (/too_busy|badp=1|down|inactivity_timeout/.test(txt)) { try { ws.close(); } catch (e) {} }
          return;
        }
        if (tag !== 'SND') return;
        // cuerpo: flags(1) seq(4, LE) smeter(2, BE) datos(int16 BE)
        const dv = new DataView(ev.data, 3);
        if (dv.getUint8(0) & 0x10) return;              // llegó comprimido (no debería): se descarta
        const n = (dv.byteLength - 7) >> 1;
        if (n <= 0) return;
        const buf = ctx.createBuffer(1, n, rate), ch = buf.getChannelData(0);
        for (let i = 0; i < n; i++) ch[i] = dv.getInt16(7 + i * 2, false) / 32768;
        const src = ctx.createBufferSource(); src.buffer = buf; src.connect(dest);
        const now = ctx.currentTime;
        if (playAt < now + 0.05 || playAt > now + 1.5) playAt = now + 0.35; // colchón anti-cortes
        src.start(playAt); playAt += buf.duration;
        if (!gotAudio) { gotAudio = true; clearTimeout(timer); h.kind = 'kiwi'; state('ok'); }
      };
      ws.onclose = ws.onerror = () => {
        clearInterval(keep); clearTimeout(timer);
        ws.onclose = ws.onerror = null;
        if (h.closed) return;
        if (gotAudio) { idx = 0; setTimeout(next, 1500); } else next(); // si se cortó, reintenta
      };
    }
    next();
  }

  function open(ctx, khz, dest, cb = {}) {
    let vol = 1, yt = null;
    const h = {
      kind: null, closed: false, _closers: [],
      set volume(v) { vol = v; if (yt) { try { yt.player.setVolume(Math.round(v * 100)); } catch (e) {} } },
      get volume() { return vol; },
      close() { h.closed = true; h._closers.forEach(f => f()); if (yt) { try { yt.player.destroy(); } catch (e) {} yt.host.remove(); yt = null; } },
    };
    const state = s => { if (!h.closed) cb.onState && cb.onState(s, h); };
    (async () => {
      state('tuning');
      if (khz === 950) {
        const vid = await officialVideoId();
        const tries = (vid ? [{ videoId: vid }] : []).concat(YT_CHANNELS.map(channel => ({ channel })));
        for (const t of tries) {
          if (h.closed) return;
          const p = await ytPlay(t, () => vol);
          if (h.closed) { if (p) { try { p.player.destroy(); } catch (e) {} p.host.remove(); } return; }
          if (p) { yt = p; h.kind = 'yt'; state('ok'); return; }
        }
      }
      if (h.closed) return;
      if (canConnect()) kiwi(ctx, khz, dest, h, state); else state('nosig');
    })();
    return h;
  }
  window.KiwiAM = { open, webLink, canConnect, RECEIVERS, _ytPlay: ytPlay };
})();
