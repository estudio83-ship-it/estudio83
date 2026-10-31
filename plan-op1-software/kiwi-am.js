// KiwiAM: escucha AM "del aire" a través de receptores KiwiSDR públicos cercanos a Buenos Aires.
// Uso: const k = KiwiAM.open(ctx, 950, destinoNode, {onState, onSignal}); k.close();
// Protocolo KiwiSDR (igual que kiwiclient): WebSocket /<ts>/SND, comandos "SET ...",
// audio PCM 16 bits big-endian sin comprimir.
// Los receptores solo hablan ws:// (sin TLS): el navegador lo permite si la página se abre
// desde la compu (file://) o desde http://, y lo bloquea desde páginas https://.
(function(){
  const RECEIVERS = [
    { name: 'RAMOS MEJIA (LU4EEC)',          host: 'lu4eec.ddns.net',         port: 8073 },
    { name: 'RADIO CLUB ARGENTINO (LU4AA)',  host: 'lu4aa.proxy.kiwisdr.com', port: null },
    { name: 'MONTEVIDEO (CX8BIT)',           host: 'cx8bit.proxy.kiwisdr.com',port: null },
  ];
  const base = r => `${r.host}${r.port ? ':' + r.port : ''}`;
  // Página del receptor ya sintonizada (se abre aparte cuando no se puede conectar desde acá)
  const webLink = (khz, r = RECEIVERS[0]) => `http://${base(r)}/?f=${khz}am`;
  const canConnect = () => location.protocol !== 'https:';

  function open(ctx, khz, dest, cb = {}) {
    let ws = null, closed = false, idx = 0, keep = null, playAt = 0, rate = 12000, gotAudio = false, timer = null;
    const state = s => cb.onState && cb.onState(s);
    if (!canConnect()) { setTimeout(() => state('nosig'), 0); return { close() {} }; }

    function next() {
      if (closed) return;
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
        const smeter = dv.getUint16(5, false);
        cb.onSignal && cb.onSignal(Math.max(0, Math.min(1, ((smeter * 0.1 - 127) + 110) / 70)));
        const n = (dv.byteLength - 7) >> 1;
        if (n <= 0) return;
        const buf = ctx.createBuffer(1, n, rate), ch = buf.getChannelData(0);
        for (let i = 0; i < n; i++) ch[i] = dv.getInt16(7 + i * 2, false) / 32768;
        const src = ctx.createBufferSource(); src.buffer = buf; src.connect(dest);
        const now = ctx.currentTime;
        if (playAt < now + 0.05 || playAt > now + 1.5) playAt = now + 0.35; // colchón anti-cortes
        src.start(playAt); playAt += buf.duration;
        if (!gotAudio) { gotAudio = true; clearTimeout(timer); state('ok'); }
      };
      ws.onclose = ws.onerror = () => {
        clearInterval(keep); clearTimeout(timer);
        ws.onclose = ws.onerror = null;
        if (closed) return;
        if (gotAudio) { idx = 0; setTimeout(next, 1500); } else next(); // si se cortó, reintenta
      };
    }
    next();
    return { close() { closed = true; clearInterval(keep); clearTimeout(timer); try { ws && ws.close(); } catch (e) {} } };
  }
  window.KiwiAM = { open, webLink, canConnect, RECEIVERS };
})();
