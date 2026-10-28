# Troquel — soporte plegable para portátil (prototipo v1)

Plancha única de 250 × 180 mm que se pliega en dos modos, como el producto de referencia:

- **Atril**: tienda con cumbrera central; los fuelles laterales (triángulos) se meten hacia adentro.
- **Vertical**: la cumbrera se hunde y forma una ranura en U de 18 mm × 35 mm.

| Archivo | Uso |
|---|---|
| `troquel.svg` | Producción 1:1. Capa `CORTE` en rojo `#FF0000`, capa `HENDIDO` en amarillo `#FFFF00` (subcapas montaña/valle). |
| `troquel.dxf` | Lo mismo en DXF R12 para plotter de corte o troquelista. |
| `plano.pdf` / `plano.png` | Lámina A3 con cotas, leyenda de pliegues y perfiles de los dos modos. |
| `generar.py` | Cambiar medidas (W, H, E, T, P) y ejecutar `python3 generar.py`. |

Notas:
- La geometría está inferida de fotos: probar primero en papel o cartulina.
- En cartón, los pliegues montaña pueden necesitar semicorte (en vez de hendido) por la cara exterior.
