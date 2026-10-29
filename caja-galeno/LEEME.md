# Caja tipo galeno · troquel 6463

Figura isométrica interactiva armada a partir del plano `troquel-6463.dxf`.

- `troquel.mjs` lee el DXF (capa *Troquel*: rojo = corte, amarillo = hendido, magenta = intermitente 5×5), arma el grafo plano, encuentra cada panel y solapa y el árbol de bisagras.
- `build.mjs` pliega esas caras en 7 pasos y escribe `caja-galeno.html` (y `caja-galeno-light.html` con `--light`).

```bash
node build.mjs && node build.mjs --light
```

Lectura del plano: tubo de 320 × 94 mm, 276 mm de alto (frente 323, costados 94, solapa de pegado 91).
Cada extremo cierra con contratapa, guardapolvos y tapa de pared doble (pestaña de 10 mm) cuya lengüeta traba en la ranura de 86 × 10 mm del fondo.
El interior (268 × 663) forma dos tabiques huecos de 28 mm que sostienen tres frascos alternados: cuerpo en agujero ⌀80, cuello en ranura ⌀31.
