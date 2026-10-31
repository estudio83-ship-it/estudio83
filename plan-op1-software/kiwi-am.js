// KiwiAM: escucha AM "del aire" a través de receptores KiwiSDR públicos de Buenos Aires.
// Uso: const k = KiwiAM.open(ctx, 950, destinoNode, {onState, onSignal}); k.close();
// Protocolo KiwiSDR: WebSocket /kiwi/<ts>/SND, comandos "SET ...", audio PCM 16 bits big-endian.
(function(){
  const RECEIVERS = [
    { name: 'RADIO CLUB ARGENTINO (LU4AA)', host: 'lu4aa.proxy.kiwisdr.com', port: null, tls: true },
    { name: 'RAMOS MEJIA (LU4EEC)',         host: 'lu4eec.ddns.net',         port: 8073, tls: false },
    { name: 'RADIO CLUB ARGENTINO (LU4AA)', host: 'lu4aa.proxy.kiwisdr.com', port: null, tls: false },
  ];
  // Página del receptor ya sintonizada (plan B: se abre en otra pestaña)
  const webLink = (khz, r = RECEIVERS[1]) => `http://${r.host}${r.port ? ':' + r.port : ''}/?f=${khz}am`;

  function open(ctx, khz, dest, cb = {}) {
    const secure = location.protocol === 'https:';
    // desde una página https solo se permiten conexiones wss://
    const list = RECEIVERS.filter(r => secure ? r.tls : true);
    let ws = null, closed = false, idx = 0, keep = null, playAt = 0, rate = 12000, gotAudio = false, timer = null;
    const state = s => cb.onState && cb.onState(s);

    function next() {
      if (closed) return;
      if (idx >= list.length) { state('nosig'); return; }
      const r = list[idx++];
      const url = `${r.tls ? 'wss' : 'ws'}://${r.host}${r.port ? ':' + r.port : ''}/kiwi/${Date.now()}/SND`;
      state('tuning'); gotAudio = false;
      try { ws = new WebSocket(url); } catch (e) { next(); return; }
      ws.binaryType = 'arraybuffer';
      clearTimeout(timer);
      timer = setTimeout(() => { if (!gotAudio) { try { ws.close(); } catch (e) {} } }, 9000);
      ws.onopen = () => {
        const send = m => { try { ws.send(m); } catch (e) {} };
        send('SET auth t=kiwi p=');
        send('SET ident_user=E83-radio');
        send(`SET mod=am low_cut=-4900 high_cut=4900 freq=${khz.toFixed(3)}`);
        send('SET compression=0');
        send('SET agc=1 hang=0 thresh=-100 slope=6 decay=1000 manGain=50');
        send('SET squelch=0 max=0');
        keep = setInterval(() => send('SET keepalive'), 5000);
        ws._send = send;
      };
      ws.onmessage = ev => {
        if (typeof ev.data === 'string') return;
        const u8 = new Uint8Array(ev.data);
        const tag = String.fromCharCode(u8[0], u8[1], u8[2]);
        if (tag === 'MSG') {
          const txt = new TextDecoder().decode(u8.subarray(4));
          const m = txt.match(/audio_rate=(\d+)/);
          if (m) { rate = +m[1]; ws._send && ws._send(`SET AR OK in=${rate} out=${ctx.sampleRate}`); }
          if (/too_busy|badp=1|down=|inactivity_timeout/.test(txt)) { try { ws.close(); } catch (e) {} }
          return;
        }
        if (tag !== 'SND') return;
        // cuerpo: flags(1) seq(4 LE) smeter(2 BE) datos(int16 BE)
        const dv = new DataView(ev.data, 3);
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
        if (closed) return;
        ws.onclose = ws.onerror = null;
        if (gotAudio) { idx = 0; setTimeout(next, 1500); } else next(); // si se cortó, reintenta
      };
    }
    next();
    return { close() { closed = true; clearInterval(keep); clearTimeout(timer); try { ws && ws.close(); } catch (e) {} } };
  }
  window.KiwiAM = { open, webLink, RECEIVERS };
})();
