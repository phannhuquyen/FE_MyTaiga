from pathlib import Path
from PIL import Image,ImageDraw
import pypdfium2 as pdf
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent
for name in ['BaoCaoDACN_Nhom8_HoanThien','GopY_Chuong1_Chuong2']:
    out=ROOT/(name+'-pages');out.mkdir(exist_ok=True)
    d=pdf.PdfDocument(ROOT/(name+'.pdf'))
    r=PdfReader(ROOT/(name+'.pdf'))
    print(name,len(d))
    for i,p in enumerate(d):
        p.render(scale=1.35).to_pil().save(out/f'page-{i+1:03}.png')
        if name.startswith('GopY') or i>98:print(i+1,r.pages[i].extract_text()[:120].replace('\n',' '))
    for start in range(0,len(d),12):
        sheet=Image.new('RGB',(1800,1760),'#dddddd');draw=ImageDraw.Draw(sheet)
        for j in range(start,min(start+12,len(d))):
            im=Image.open(out/f'page-{j+1:03}.png');im.thumbnail((430,550))
            x=(j-start)%4*450;y=(j-start)//4*585
            sheet.paste(im,(x,y));draw.text((x+5,y+550),str(j+1),fill='black')
        sheet.save(out/f'contact-{start+1:03}.jpg')
print('Rendered all pages')
