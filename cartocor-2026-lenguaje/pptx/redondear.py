# Puntas y uniones redondeadas en los trazos dibujados (formas libres con contorno)
import sys, zipfile, shutil, re
from lxml import etree
A='{http://schemas.openxmlformats.org/drawingml/2006/main}'
P='{http://schemas.openxmlformats.org/presentationml/2006/main}'
src=sys.argv[1]; tmp=src+'.tmp'; n=0
zin=zipfile.ZipFile(src); zout=zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED)
ORDER=['noFill','solidFill','gradFill','pattFill','prstDash','custDash','round','bevel','miter','headEnd','tailEnd','extLst']
for it in zin.infolist():
    d=zin.read(it.filename)
    if re.match(r'ppt/slides/slide\d+\.xml$',it.filename):
        root=etree.fromstring(d)
        for sp in root.iter(P+'sp'):
            sppr=sp.find(P+'spPr')
            if sppr is None or sppr.find(A+'custGeom') is None: continue
            ln=sppr.find(A+'ln')
            if ln is None or ln.find(A+'solidFill') is None: continue
            ln.set('cap','rnd')
            for j in ('round','bevel','miter'):
                for e in ln.findall(A+j): ln.remove(e)
            r=etree.Element(A+'round')
            idx=0
            for i,ch in enumerate(list(ln)):
                tag=ch.tag.replace(A,'')
                if tag in ORDER and ORDER.index(tag)<ORDER.index('round'): idx=i+1
            ln.insert(idx,r); n+=1
        d=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
    zout.writestr(it,d)
zout.close(); shutil.move(tmp,src); print('trazos redondeados',n)
