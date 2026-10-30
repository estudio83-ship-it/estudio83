# Caja tipo galeno · troquel 6463 (+50)

Figura isométrica interactiva armada desde el plano del troquel, ahora en la variante para un frasco 50 mm más largo.

- `troquel-6463.dxf`: plano original (caja 320 × 94 × 276).
- `estirar.mjs`: estira el original para un frasco N mm más largo y escribe `troquel-6463-masN.dxf` (DXF R12, capa *Troquel*, colores 1 corte, 2 hendido, 6 intermitente).
- `troquel-6463-mas50.dxf`: el plano nuevo (caja 370 × 94 × 276).
- `troquel.mjs`: lee el DXF, arma el grafo plano, encuentra paneles y solapas y el árbol de bisagras.
- `build.mjs`: pliega las caras en 7 pasos y escribe `caja-galeno.html` (`--light` para el tema claro, `--mas 0` para el original).

```bash
node estirar.mjs 50
node build.mjs && node build.mjs --light
```

## Qué cambia con +50

El frasco va acostado a lo ancho de la caja, así que crece todo lo que corre en ese sentido:

| | original | +50 |
|---|---|---|
| contrafrente (ancho interior) | 320 | 370 |
| frente | 323 | 373 |
| tapas, pestañas de 10 mm, lengüetas | 321 | 371 |
| contratapas (borde recto) | 185 | 235 |
| panel central del interior | 255 | 305 |
| pieza interior | 268 × 663 | 268 × 713 |
| frasco | 306 | 356 |
| plano total | 1198 | 1298 |

No cambian: profundidad 94, alto 276, costados y solapa de pegado, guardapolvos y orejas, tabiques de 28 mm, agujeros ⌀80, ranuras ⌀31, ranura de traba 86 × 10 y su diente (se corren 50 mm juntos, siguen alineados).
