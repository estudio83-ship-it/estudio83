# Plan: un sintetizador/estudio portátil estilo OP-1 en software

Para usar en el **celular** (Android, o iPhone con limitaciones) y en la **Lenovo ThinkPad T14** (Windows o Linux).

> Nota legal: "OP-1" y "Teenage Engineering" son marcas registradas, y el diseño visual del aparato está protegido. Copiar el **concepto** (flujo de trabajo, tipo de instrumento) está bien. **No** uses el nombre, el logo, los gráficos de pantalla ni los samples originales. Ponele nombre propio al proyecto (por ejemplo "E83-1" o el que quieras) y diseñá una estética propia. Inspirarse está permitido; clonar la marca no.

---

## 1. Qué hace el OP-1 (lo que hay que recrear)

El OP-1 (2011) y el OP-1 field (2022) son "estudios de bolsillo". Sus cinco partes principales:

| Módulo | Qué hace | Detalle |
|---|---|---|
| **Synth** | Motores de síntesis intercambiables | Unos 10 motores en el original (FM, Pulse, String, Cluster, Digital, DNA, Phase, Voltage, DSynth, Sampler). El field suma Dimension, Vocoder y más |
| **Drum** | Batería por samples o sintetizada | Drum sampler (un kit en un solo sample cortado en "slices"), D-Box, DSynth |
| **Tape** | Grabador multipista "de cinta" | 4 pistas, tiempo limitado, se puede cambiar la velocidad, reproducir al revés, cortar y pegar, hacer loops |
| **Mixer / Master** | Mezcla y efectos de salida | Volumen y paneo por pista, EQ, compresor/drive |
| **Album** | Bounce final | Dos "caras" (A y B), como un vinilo |

Lo que tiene cada sonido:
- **Efectos** (uno por sonido): Delay, Spring (reverb de resorte), Grid, Nitro (filtro), Phone, Punch, CWO, Mother (reverb grande).
- **LFO** (uno por sonido): Element (usa el micrófono o el acelerómetro), Random, Tremolo, Value, Bend.
- **Envolvente** ADSR y "play mode" (poly, mono, legato, portamento).

**Secuenciadores**: Pattern (grilla por pasos), Endless, Tombola (física: notas que rebotan dentro de un cilindro), Finger, Sketch y Arpeggio.

**Interfaz**: 4 encoders de colores (azul, verde, blanco y naranja), que siempre controlan los 4 parámetros que se ven en pantalla. Un teclado de 2 octavas. Una pantalla OLED chica con gráficos animados y juguetones. Todo se maneja sin menús profundos. **Esta es la clave del encanto: hay pocos controles y cada pantalla es una "ilustración" que se puede tocar.**

---

## 2. Decisión de plataforma (recomendación)

### Opciones evaluadas

| Opción | Celular | T14 | Latencia | Esfuerzo | Comentario |
|---|---|---|---|---|---|
| **A. Web app / PWA** (Web Audio + AudioWorklet + WASM) | ✅ Android (Chrome) · ⚠️ iPhone (Safari, sin Web MIDI) | ✅ Chrome/Edge | Media: ~20–40 ms en Android, ~10–20 ms en laptop | **Bajo** | Un solo código para todo. Se instala desde el navegador |
| **B. JUCE (C++)** nativo | ✅ Android/iOS | ✅ Windows (ASIO/WASAPI) / Linux | **La mejor** | Alto | Estándar de la industria. También sale como VST3 para usarlo en un DAW |
| **C. Flutter/React Native + motor C++** | ✅ | ⚠️ | Buena | Alto | Dos mundos que hay que unir. No lo recomiendo |
| **D. Patch en Pure Data / Max** | ⚠️ | ✅ | Buena | Bajo | Sirve para prototipar sonidos, no para un producto |

### Recomendación: **híbrido en etapas**

1. **Motor de audio en Rust (o C++)** compilado a **WebAssembly** y ejecutado dentro de un **AudioWorklet**. Con eso el DSP es portable.
2. **UI web** (Canvas 2D / SVG, sin frameworks pesados) instalable como **PWA**. Funciona en el celu y en la T14 desde el día 1.
3. **Más adelante**, si la latencia en el celu molesta: se envuelve el **mismo motor** en una app nativa (Tauri para la laptop, y Android nativo con **Oboe/AAudio**, que en Android 8.1+ da ~20 ms de ida y vuelta en buenos equipos). Como el DSP ya está en Rust/C++, no se reescribe.

¿Por qué no arrancar directo con JUCE? Porque con la web ves y tocás algo en semanas en los dos dispositivos, sin tiendas de apps ni compiladores para Android. JUCE queda como el "plan B pro" si querés plugin VST o la mínima latencia posible.

---

## 3. Arquitectura

```
┌───────────────────────── UI (hilo principal) ─────────────────────────┐
│  Pantalla tipo OLED (Canvas)  ·  4 encoders virtuales  ·  teclado     │
│  Entrada: touch / mouse / teclado de la PC / MIDI (Web MIDI) / gamepad │
└──────────────┬────────────────────────────────────────▲──────────────┘
               │ mensajes (parámetros, notas)           │ medidores, posición de cinta
               ▼                                        │
┌──────────── AudioWorklet (hilo de audio en tiempo real) ──────────────┐
│  Motor WASM (Rust):                                                   │
│   Voces de synth (motor elegido) ─► FX ─┐                             │
│   Drum (sampler con slices)  ─► FX ─────┼─► Tape (4 pistas) ─► Mixer ─► Master FX ─► salida
│   LFO / envolventes / secuenciador / reloj (BPM)                      │
└───────────────────────────────────────────────────────────────────────┘
               │
               ▼
   Almacenamiento: IndexedDB / OPFS (cintas, samples, presets)
   Exportación: WAV de cada pista y del álbum
```

Reglas de oro del audio en tiempo real:
- En el hilo de audio **no se reserva memoria, no hay locks y no hay I/O**. Todo se preasigna.
- Parámetros con **suavizado** (para que no haya clicks al girar un encoder).
- La comunicación UI↔audio va por `SharedArrayBuffer` + ring buffer (lock-free), o por `port.postMessage` en el MVP.
- La cinta es un buffer preasignado: 4 pistas estéreo × N minutos a 48 kHz. Por ejemplo, 6 min × 4 pistas × 2 canales × 4 bytes ≈ 550 MB. Conviene usar **mono o 16 bits**, o limitar el tiempo en el celu.

### Stack concreto
- **DSP**: Rust + `wasm-bindgen`. Opcionalmente las crates `fundsp` (bloques DSP) o `dasp`. Alternativa en C++: **Faust**, que compila a WASM, a JUCE y a Android desde el mismo código, y es ideal para prototipar efectos.
- **UI**: TypeScript + Vite + Canvas 2D. Fuente monoespaciada o pixel, y paleta propia.
- **PWA**: Service Worker para usarla offline, manifest y modo pantalla completa horizontal.
- **Controles externos**: Web MIDI API (Chrome/Edge en Android y Windows/Linux) y Gamepad API.
- **Tests**: tests unitarios del DSP en Rust (nativo, rápidos) y Playwright para la UI.

---

## 4. Controles en cada dispositivo

### Laptop T14
- **Teclado QWERTY como teclado musical**: fila `A S D F G H J K L` para las blancas y `W E T Y U O P` para las negras. `Z`/`X` cambian de octava.
- **Encoders**: teclas `1–8` (subir/bajar cada encoder) o la rueda del mouse sobre cada parámetro. El TrackPoint rojo de la ThinkPad sirve como "encoder" fino.
- **Mejor opción**: un **controlador MIDI USB chico con 4+ knobs** (por ejemplo, un Akai MPK Mini, un Arturia MiniLab o un Korg nanoKONTROL). Se mapean 4 knobs a los 4 colores.
- **Audio**:
  - **Windows**: Chrome usa WASAPI. Para la versión nativa futura, usar ASIO (ASIO4ALL o FlexASIO) o una placa USB.
  - **Linux**: PipeWire con buffer de 128–256 muestras.
  - Con auriculares o una interfaz USB la latencia mejora un montón respecto del Realtek interno.

### Celular
- Pantalla horizontal: la pantalla OLED arriba, los 4 encoders como **diales táctiles grandes** (se arrastra vertical para girar) y un teclado de 2 octavas abajo.
- Multitouch para acordes. Vibración corta como "click" de encoder (Vibration API en Android).
- **Acelerómetro** como fuente de LFO (como el "Element" del OP-1) y **micrófono** para samplear (getUserMedia).
- **iPhone**: Safari no tiene Web MIDI y el audio arranca recién con un toque. Funciona, pero con más latencia. Si es prioridad, se pasa a la versión nativa (JUCE/AUv3).
- Android: un teclado MIDI por USB-C OTG funciona con Chrome.

---

## 5. Roadmap por fases

Las estimaciones son para 1 persona con dedicación parcial (~10 h/semana).

### Fase 0 — Preparación (1 semana)
- [ ] Elegir nombre e identidad visual propia (moodboard: minimalismo, colores planos, gráficos juguetones).
- [ ] Armar el repo: `engine/` (Rust), `web/` (TS + Vite) y el script de build WASM.
- [ ] "Hola mundo" de audio: una senoidal desde WASM en un AudioWorklet que suene en la T14 y en el celu.
- [ ] Medir la latencia real en ambos equipos (test de loopback o app de medición) y anotarla.

### Fase 1 — MVP "se puede tocar" (3–4 semanas)
- [ ] 1 motor de synth: **substractivo/Pulse** (2 osciladores, filtro, ADSR) con polifonía de 6–8 voces.
- [ ] 4 encoders virtuales → 4 parámetros por pantalla.
- [ ] Teclado táctil + QWERTY + MIDI.
- [ ] 1 efecto (Delay) y 1 LFO (Tremolo/Value).
- [ ] Presets guardados en IndexedDB.
- [ ] PWA instalable y usable offline.

**Criterio de éxito**: lo abrís en el celu en el colectivo, tocás 5 minutos y te divierte.

### Fase 2 — Drum + secuenciador (3 semanas)
- [ ] Drum sampler: un archivo WAV dividido en 24 slices (uno por tecla), con pitch y dirección por slice.
- [ ] Grabar samples con el micrófono (máximo 12 s, como en el OP-1).
- [ ] Secuenciador **Pattern** (16 pasos, varias páginas) + reloj BPM global.
- [ ] Segundo motor de synth: **FM** de 4 operadores.

### Fase 3 — Tape (el corazón) (4 semanas)
- [ ] 4 pistas, grabar/overdub con punch-in, un medidor visual que gira como carretes.
- [ ] Velocidad variable (½×, 1×, 2×), reversa y "tape stop".
- [ ] Loop de una región, lift/drop (cortar y pegar), y split.
- [ ] Mixer: volumen y paneo por pista, EQ y compresor master.
- [ ] Exportar pistas sueltas y el mix en WAV.

### Fase 4 — Personalidad (4+ semanas)
- [ ] Más motores: **String** (Karplus-Strong), **Cluster** (supersaw), **Digital** (bitcrush/wavefolding), **Sampler** cromático.
- [ ] Efectos: Spring, reverb grande, Phone (filtro de banda + distorsión), Punch, Grid.
- [ ] Secuenciadores creativos: **Tombola** (física 2D simple), Endless y Arpeggio.
- [ ] LFO por acelerómetro y por micrófono.
- [ ] Modo Album (bounce A/B).
- [ ] Animaciones de pantalla propias para cada motor: **acá está la magia, dale tiempo**.

### Fase 5 — Nativo / pro (opcional)
- [ ] Envolver el motor con **Tauri** (Windows/Linux) para usar audio de baja latencia.
- [ ] App Android con **Oboe/AAudio** (modo LowLatency + Exclusive) y el mismo motor Rust vía JNI.
- [ ] Versión plugin VST3/CLAP (JUCE o `nih-plug` en Rust) para usarlo dentro de un DAW.
- [ ] Sync: MIDI clock y Ableton Link.

---

## 6. Riesgos y cómo mitigarlos

| Riesgo | Mitigación |
|---|---|
| Latencia alta en el celu (Bluetooth agrega 150–300 ms) | Usar auriculares con cable o USB-C. Si no alcanza, pasar a la Fase 5 nativa |
| Memoria de la cinta en el celu | Pistas mono a 16 bits, 3–6 min como máximo y guardado incremental en OPFS |
| CPU con mucha polifonía + FX | Límite de voces por motor, *voice stealing*, procesar en bloques de 128 muestras y SIMD en WASM |
| Safari/iPhone | Tratarlo como "funciona, pero no es el objetivo". Desarrollar primero en Android |
| El proyecto se hace eterno | Respetar el MVP de la Fase 1 y no sumar motores antes de que la cinta funcione |
| Problemas de marca/diseño | Nombre, gráficos y sonidos propios. No usar assets de TE |

---

## 7. Recursos para aprender / referencia

- **Manual oficial del OP-1 / OP-1 field** (teenage.engineering/guides): la mejor referencia de cómo funciona cada motor, efecto y secuenciador.
- **DSP**: *The Audio Programmer* (YouTube y Discord), *Designing Software Synthesizer Plug-Ins in C++* (Will Pirkle) y el blog de Nigel Redmon (EarLevel Engineering) sobre osciladores y filtros.
- **Web Audio**: la documentación de AudioWorklet en MDN y los ejemplos de Google Chrome Labs ("web-audio-samples", con WASM + AudioWorklet).
- **Rust audio**: `fundsp`, `nih-plug` (plugins) y `cpal` (audio nativo para la Fase 5).
- **Faust** (faust.grame.fr): para prototipar filtros y efectos que exporta a WASM, JUCE y Android.
- **Android**: la guía oficial de baja latencia con Oboe (developer.android.com/games/sdk/oboe/low-latency-audio).
- **Inspiración de UX**: ver cómo resuelven las pantallas otras apps "de bolsillo" (Koala Sampler, Fieldscaper, etc.) sin copiar su diseño.

---

## 8. Próximo paso concreto

Arrancar la **Fase 0**: crear la estructura `engine/` + `web/` y hacer sonar una senoidal en la T14 y en el celular, con la latencia medida. Con eso se valida toda la cadena antes de invertir en sonidos y gráficos.
