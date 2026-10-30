# Caja FEFCO 201 paramétrica

La caja americana (FEFCO 0201, solapas que se tocan al centro) armada con la plantilla de troqueles (`../troqueles/`), igual que la Caja tipo Galeno, pero sin botellas: sólo la caja y el cartón.

| Archivo | Para qué |
|---|---|
| `diseno.mjs` | El diseño: variables, geometría (`generar201`), cotas con fórmulas, resumen y descargas. |
| `dibujos.mjs` | Dibujos del panel: la caja armada en isométrico con L, A y H, y el cartón con su onda. |
| `pagina.mjs` | Escribe `caja-fefco-201.html` (verifica antes que cada fórmula dé lo que mide el plano). |
| `check.mjs` | Cientos de combinaciones sin líneas sueltas, cruzadas ni superpuestas, y 13 piezas en cada caja. |

```bash
node caja-fefco-201/check.mjs
node caja-fefco-201/pagina.mjs
TROQUEL_CLAVE='la-clave' node caja-fefco-201/pagina.mjs --proteger --out caja-fefco-201.html
```

## Variables

| Grupo | Var | Qué es | Rango | Inicial |
|---|---|---|---|---|
| Caja | `L` | Largo interior | 100 a 800 | 300 |
| Caja | `A` | Ancho interior | 80 a 600 | 200 |
| Caja | `H` | Alto interior | 50 a 800 | 250 |
| Caja | `g` | Solapa de pegado | 25 a 50 | 35 |
| Cartón | `e` | Espesor del cartón (simples E 2 · B 3 · C 4; dobles EB 5 · BC 7) | 1 a 7 | 3 |

## Fórmulas del plano

| Cota | Fórmula |
|---|---|
| Paneles de largo (entre hendidos) | `L + e` |
| Paneles de ancho | `A + e` |
| Alto entre hendidos de las solapas | `H + 2e` (arriba y abajo van dos solapas, una sobre otra) |
| Solapas | `(A + e)/2`, se tocan al centro |
| Ranuras entre solapas | `e + 2` |
| Solapa de pegado | `g`, con biseles de 10 |
| Plancha | `2L + 2A + 4e + g` × `H + 2e + 2 × solapa` |

Con onda B coincide con las tablas habituales (L + 3, A + 3, H + 6). Medidas externas aproximadas: `L + 2e`, `A + 2e`, `H + 4e`.
