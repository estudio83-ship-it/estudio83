# Agrupa piezas consecutivas con objectName "G·<grupo>·<pieza>" en un grupo de PowerPoint
import sys, zipfile, shutil, re, os
from lxml import etree
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
P='{%s}'%NS['p']; A='{%s}'%NS['a']
src=sys.argv[1]; tmp=src+'.tmp'
zin=zipfile.ZipFile(src); zout=zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED)
def name_el(el):
    c=el.find('.//p:cNvPr',NS); return c
def bbox(el):
    if el.tag==P+'graphicFrame': x=el.find('p:xfrm',NS)
    elif el.tag==P+'grpSp': x=el.find('p:grpSpPr/a:xfrm',NS)
    else: x=el.find('p:spPr/a:xfrm',NS)
    if x is None: return None
    o=x.find('a:off',NS); e=x.find('a:ext',NS)
    X,Y,W,H=int(o.get('x')),int(o.get('y')),int(e.get('cx')),int(e.get('cy'))
    return X,Y,X+W,Y+H
def sanitize(name, data):
    if not (name.endswith('.xml') or name.endswith('.rels')): return data
    t=data.decode('utf-8')
    # rotaciones negativas -> rango canónico [0, 21600000)
    t=re.sub(r'rot="(-\d+)"', lambda m: 'rot="%d"' % (int(m.group(1)) % 21600000), t)
    t=t.replace('<a:ln/>','<a:ln><a:noFill/></a:ln>').replace('<a:ln></a:ln>','<a:ln><a:noFill/></a:ln>')
    t=re.sub(r'<a:srcRect l="0" r="0" t="0" b="0"\s*/>','',t)
    t=t.replace('<a:stretch/>','<a:stretch><a:fillRect/></a:stretch>')
    t=re.sub(r'descr="/[^"]*/([^"/]*)"', lambda m: 'descr="%s"' % m.group(1), t)
    if name=='[Content_Types].xml': t=t.replace('ContentType="image/jpg"','ContentType="image/jpeg"')
    return t.encode('utf-8')
total=0
for item in zin.infolist():
    data=zin.read(item.filename)
    if re.match(r'ppt/slides/slide\d+\.xml$',item.filename):
        root=etree.fromstring(data); tree=root.find('.//p:cSld/p:spTree',NS)
        maxid=max([int(c.get('id')) for c in root.iter(P+'cNvPr')]+[1])
        kids=list(tree); i=0
        while i<len(kids):
            c=name_el(kids[i]) if kids[i].tag in (P+'sp',P+'pic',P+'graphicFrame',P+'cxnSp') else None
            nm=c.get('name') if c is not None else ''
            if nm.startswith('G·'):
                key=nm.split('·')[1]; j=i
                while j<len(kids):
                    cj=name_el(kids[j]) if kids[j].tag in (P+'sp',P+'pic',P+'graphicFrame',P+'cxnSp') else None
                    if cj is None or not cj.get('name','').startswith('G·'+key+'·'): break
                    j+=1
                members=kids[i:j]
                for m in members:
                    cm=name_el(m); cm.set('name',cm.get('name').split('·',2)[2])
                if len(members)>1:
                    bbs=[b for b in map(bbox,members) if b]
                    x0=min(b[0] for b in bbs); y0=min(b[1] for b in bbs); x1=max(b[2] for b in bbs); y1=max(b[3] for b in bbs)
                    maxid+=1
                    g=etree.Element(P+'grpSp')
                    nv=etree.SubElement(g,P+'nvGrpSpPr'); cp=etree.SubElement(nv,P+'cNvPr'); cp.set('id',str(maxid)); cp.set('name',key)
                    etree.SubElement(nv,P+'cNvGrpSpPr'); etree.SubElement(nv,P+'nvPr')
                    gp=etree.SubElement(g,P+'grpSpPr'); xf=etree.SubElement(gp,A+'xfrm')
                    for tag,(a,b) in (('off',(x0,y0)),('ext',(x1-x0,y1-y0)),('chOff',(x0,y0)),('chExt',(x1-x0,y1-y0))):
                        e=etree.SubElement(xf,A+tag)
                        if tag in('off','chOff'): e.set('x',str(a)); e.set('y',str(b))
                        else: e.set('cx',str(a)); e.set('cy',str(b))
                    tree.insert(tree.index(members[0]),g)
                    for m in members: g.append(m)
                    total+=1
                i=j
            else: i+=1
        data=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
    zout.writestr(item,sanitize(item.filename,data))
zout.close(); shutil.move(tmp,src); print('grupos',total)
