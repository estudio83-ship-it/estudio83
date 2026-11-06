# recorte centrado exacto a una proporción (para fotos en círculos y marcos)
import sys
from PIL import Image
src, w, h, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
im = Image.open(src); r = w / h
if im.width / im.height > r:
    nw = int(im.height * r); l = (im.width - nw) // 2; im = im.crop((l, 0, l + nw, im.height))
else:
    nh = int(im.width / r); t = (im.height - nh) // 2; im = im.crop((0, t, im.width, t + nh))
mx = 1400
if max(im.size) > mx: im.thumbnail((mx, mx), Image.LANCZOS)
(im.convert('RGB').save(out, quality=84) if out.endswith('.jpg') else im.save(out))
