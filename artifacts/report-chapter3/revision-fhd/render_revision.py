from pathlib import Path
import pypdfium2 as pdf
from pypdf import PdfReader
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
source=root/'BaoCaoDACN_Nhom8_HoanThien.pdf'
pages=root/'render';pages.mkdir(exist_ok=True)
d=pdf.PdfDocument(source);r=PdfReader(source)
for i,p in enumerate(d):p.render(scale=1.35).to_pil().save(pages/f'page-{i+1:03}.png')
for start in range(0,len(d),12):
    sheet=Image.new('RGB',(1800,1760),'#dddddd');draw=ImageDraw.Draw(sheet)
    for j in range(start,min(start+12,len(d))):
        im=Image.open(pages/f'page-{j+1:03}.png');im.thumbnail((430,550));x=(j-start)%4*450;y=(j-start)//4*585
        sheet.paste(im,(x,y));draw.text((x+5,y+550),str(j+1),fill='black')
    sheet.save(pages/f'contact-{start+1:03}.jpg')
print('Rendered',len(d),'pages')
for i,p in enumerate(r.pages):
    if i>=123:print(i+1,p.extract_text()[:90].replace('\n',' '))
