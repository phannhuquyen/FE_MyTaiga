from pathlib import Path
from copy import deepcopy
from hashlib import sha256
import json
from docx import Document
from docx.shared import Cm
from lxml import etree

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT.parent/'BaoCaoDACN_Nhom8_HoanThien.docx'
TARGET=ROOT/'BaoCaoDACN_Nhom8_HoanThien.docx'
d=Document(SOURCE)
chapter=next(p._p for p in d.paragraphs if p.text=='CHƯƠNG 3: CHƯƠNG TRÌNH VÀ KIỂM THỬ')
prefix=[]
for e in d._element.body:
    if e is chapter:break
    prefix.append(etree.tostring(e))

names=['01-login','02-dashboard','03-projects','04-backlog','12-epics','05-sprints','06-kanban','11-metrics','07-task','08-members','09-bugs','10-chat']
assert len(d.inline_shapes)==len(names)==12
for shape,name in zip(d.inline_shapes,names):
    path=ROOT/'screenshots'/(name+'.jpg')
    from PIL import Image
    assert Image.open(path).size==(1920,1080),path
    rid=shape._inline.graphic.graphicData.pic.blipFill.blip.embed
    d.part.related_parts[rid]._blob=path.read_bytes()
    shape.width=Cm(15.2);shape.height=int(shape.width*1080/1920)

def set_text(p,text):
    # Retain paragraph properties and formatting from the first textual run.
    props=deepcopy(p.runs[0]._r.rPr) if p.runs and p.runs[0]._r.rPr is not None else None
    p.clear();r=p.add_run(text)
    if props is not None:r._r.insert(0,props)

changes=[]
for p in d.paragraphs:
    if '1440 × 900' in p.text:
        old=p.text;set_text(p,old.replace('1440 × 900','1920 × 1080'));changes.append(old)

replacements={
'Chương này trình bày giao diện và kết quả kiểm thử':
 'Chương này trình bày giao diện và kết quả kiểm thử của hệ thống MyTaiga tại thời điểm ngày 02/11/2026, bao gồm đợt kiểm tra bổ sung Cloudinary sau khi cập nhật cấu hình. Sản phẩm hỗ trợ quản lý dự án phần mềm theo Scrumban, kết hợp lập kế hoạch bằng Product Backlog và Sprint với theo dõi công việc trên bảng trạng thái. Nội dung được đối chiếu với mã nguồn frontend, backend và các bằng chứng kiểm thử của dự án, nhằm đánh giá mức độ đáp ứng các yêu cầu đã phân tích ở Chương 2.',
'Không gian cộng tác cung cấp kênh trao đổi':
 'Không gian cộng tác cung cấp kênh trao đổi theo dự án và lịch sử tin nhắn của các thành viên. Giao diện gồm danh sách kênh bên trái, nội dung hội thoại bên phải và ô soạn tin phía dưới. Ảnh cho thấy các tin nhắn hiện hữu của user1 và user2 trong Project So 1. Các tin nhắn và ảnh mới phục vụ kiểm thử Cloudinary được tạo riêng trong dự án QA, không ghi vào kênh đang minh họa.',
'Các bài kiểm tra tích hợp trong đợt này không tạo':
 'Bộ kiểm thử tích hợp chỉ đọc ban đầu không tạo hoặc xóa dữ liệu nghiệp vụ, không đổi quyền hay mật khẩu. Ở đợt bổ sung Cloudinary, nhóm tạo Task và phòng Chat có nhãn QA trong dự án thử nghiệm số 3; ảnh được tải lên Task, Chat và avatar của tài khoản QA user5. Không xóa dữ liệu hiện hữu, không đổi quyền hoặc mật khẩu và không sửa mã nguồn hay cấu hình BE trong đợt kiểm tra này. Kiểm thử CRUD toàn vòng đời, realtime nhiều phiên và các tình huống ngoài phạm vi vẫn cần được thực hiện riêng.',
'Chín cảnh báo lint nằm ở script':
 'Chín cảnh báo lint được ghi nhận ở đợt kiểm tra nền trước đó, liên quan đến script biểu thức chính quy và setState trong effect hoặc phụ thuộc hook ở AuthContext, Sidebar, Dashboard, Admin, Kanban và Chat. Kết quả build, lint, 221 unit/component, 62 browser mock và 3 live chỉ đọc trong Bảng 3.4 được giữ làm bằng chứng của đợt đó; không phải kết quả tái chạy toàn bộ sau thay đổi cấu hình Cloudinary. Đợt bổ sung tập trung kiểm chứng ba luồng ảnh trên dịch vụ thực và không thay đổi kết luận về các dữ liệu minh họa còn lại.',
'Về vận hành, hệ thống có thể dùng':
 'Về vận hành, hệ thống có thể dùng để trình diễn quy trình quản lý công việc từ dự án, Backlog và Sprint đến Board, Bug và trao đổi nhóm. Ba luồng tải ảnh đã hoạt động trong kiểm thử bổ sung sau cập nhật cấu hình Cloudinary. Trước khi sử dụng rộng rãi, cần tiếp tục thay dữ liệu minh họa còn sót, hoàn thiện kiểm thử các luồng ghi dữ liệu và theo dõi dịch vụ lưu trữ. Chưa có số liệu chi phí hosting, tải đồng thời hoặc khảo sát người dùng đủ để khẳng định hiệu quả kinh tế hay năng suất tăng theo một tỷ lệ cụ thể.',
'Đợt kiểm thử mới chỉ bao phủ Chromium':
 'Các đợt kiểm thử đã nêu chỉ bao phủ Chromium desktop với những kịch bản được chọn; chưa kiểm chứng toàn bộ thao tác CRUD UI, mọi tổ hợp filter/phân trang, kéo thả bằng bàn phím, mobile, Firefox, WebKit hoặc toàn bộ lỗi mạng. Chưa có phép đo tải, pentest, thời gian đồng bộ Board hoặc kiểm thử email đầu cuối. Upload ảnh Task, Chat và avatar đã đạt trên Cloudinary thực trong đợt bổ sung; URL hết hạn, giới hạn quota và upload đồng thời vẫn chưa được kiểm chứng đầy đủ. Những hạn chế này cần được hoàn thiện trước nghiệm thu toàn diện.',
'Kết quả đối chiếu và kiểm thử cho thấy':
 'Đợt kiểm tra nền đã ghi nhận build thành công, 221 test unit/component, 62 test trình duyệt mock và 3 test tích hợp chỉ đọc theo tài khoản đều đạt. Sau khi cập nhật cấu hình Cloudinary, kiểm tra bổ sung xác nhận ba luồng ảnh Task, Chat và avatar hoạt động trên dịch vụ thực; ảnh được mở thành công và avatar hiển thị sau khi tải lại trang. Toàn bộ 12 ảnh giao diện trong chương được chụp lại ở 1920 × 1080, giữ đầy đủ khung ứng dụng và avatar thanh bên. Phạm vi này chưa chứng minh mọi Use Case đã hoàn tất; một số dữ liệu phụ còn mẫu và quy tắc Bug vẫn cần thống nhất.',
'Trong giai đoạn tiếp theo, nhóm ưu tiên xử lý luồng tải ảnh':
 'Trong giai đoạn tiếp theo, nhóm ưu tiên rà soát toàn bộ placeholder, cập nhật tài liệu thiết kế theo mô hình quyền thực tế và duy trì theo dõi các luồng ảnh đã hoạt động. Sau đó mở rộng hồi quy CRUD trên dữ liệu thử riêng, kiểm chứng đồng bộ nhiều phiên, hoàn thiện dữ liệu Metrics và kiểm tra các ràng buộc WIP, Sprint, Task cha/con. Việc đo hiệu năng, bảo mật, khả năng truy cập và đa thiết bị cần thực hiện trước khi triển khai rộng rãi.',
'Hồ sơ thực hiện lưu ảnh chụp gốc':
 'Hồ sơ thực hiện lưu 12 ảnh chụp gốc 1920 × 1080, kết quả kiểm thử nền và bằng chứng bổ sung Cloudinary. Ba luồng ảnh sử dụng duy nhất tệp PNG thử nghiệm Screenshot 2026-06-23 132150.png; kết quả được lưu trong thư mục artifacts/report-chapter3/revision-fhd. Chỉ lưu dữ liệu cần để truy vết; không đính kèm thông tin xác thực, API key, secret hoặc URL ký tạm thời. Kết quả lịch sử và kết quả bổ sung được ghi riêng để tránh suy rộng phạm vi nghiệm thu.'
}
for prefix_text,new in replacements.items():
    matches=[p for p in d.paragraphs if p.text.startswith(prefix_text)]
    assert len(matches)==1,prefix_text
    changes.append(matches[0].text);set_text(matches[0],new)

for t in d.tables[48:]:
    for row in t.rows:
        for c in row.cells:
            for p in c.paragraphs:
                if '1440 × 900' in p.text:set_text(p,p.text.replace('1440 × 900','1920 × 1080'))
    for row in t.rows:
        if row.cells[0].text=='KT11':
            set_text(row.cells[2].paragraphs[0],'Đạt trong đợt bổ sung Cloudinary: ảnh Task, Chat và avatar tải lên thành công; metadata và ảnh mở được, avatar tồn tại sau tải lại. Dùng API thật, không dùng test double.')
        if row.cells[0].text=='Upload ảnh từng trả 503':
            set_text(row.cells[0].paragraphs[0],'Phạm vi kiểm thử dịch vụ ảnh')
            set_text(row.cells[1].paragraphs[0],'Lỗi 503 trước đây không còn tái hiện trong ba luồng đã thử sau cập nhật cấu hình.')
            set_text(row.cells[2].paragraphs[0],'Tiếp tục kiểm tra URL hết hạn, quota, upload đồng thời và xử lý lỗi mạng; chưa kết luận mọi tình huống lưu trữ đều đạt.')
        if row.cells[0].text=='Kỹ thuật' and len(row.cells)==3 and 'FE build' in row.cells[1].text:
            set_text(row.cells[2].paragraphs[0],'Hoàn thiện dữ liệu phụ, kiểm thử CRUD và các tình huống lưu trữ ngoài phạm vi đã thử.')

results=d.tables[51]
for cells in [
 ('Cloudinary Task — bổ sung','Đạt','0','Upload PNG; metadata tên, MIME, dung lượng khớp; preview và download mở được ảnh.'),
 ('Cloudinary Chat — bổ sung','Đạt','0','Gửi ảnh vào phòng QA; metadata, preview và lịch sử ảnh hiện trên FE.'),
 ('Cloudinary avatar — bổ sung','Đạt','0','Upload qua UI trả 200; CDN mở được ảnh; avatar hiển thị sau tải lại trang.')]:
    row=results.add_row()
    for i,value in enumerate(cells):
        donor=results.rows[1].cells[i]
        if row.cells[i]._tc.tcPr is not None:row.cells[i]._tc.remove(row.cells[i]._tc.tcPr)
        row.cells[i]._tc.insert(0,deepcopy(donor._tc.tcPr))
        row.cells[i].text=value
        p=row.cells[i].paragraphs[0]
        if donor.paragraphs[0]._p.pPr is not None:p._p.insert(0,deepcopy(donor.paragraphs[0]._p.pPr))
        if donor.paragraphs[0].runs[0]._r.rPr is not None:p.runs[0]._r.insert(0,deepcopy(donor.paragraphs[0].runs[0]._r.rPr))

anchor=next(p for p in d.paragraphs if p.text=='Bảng 3.4. Kết quả kiểm thử mới phục vụ báo cáo')
p=d.add_paragraph(style='BC Noi dung')
p.paragraph_format.first_line_indent=Cm(.7)
p.add_run('Kiểm tra bổ sung Cloudinary ngày 02/11/2026 sử dụng ảnh PNG 1.958.133 byte trên môi trường đang chạy, sau khi chủ dự án cập nhật cấu hình. Luồng Task xác minh upload, tên tệp, MIME, dung lượng, preview và download; luồng Chat xác minh ảnh đính kèm, lịch sử và hiển thị FE; luồng avatar xác minh lưu qua UI, mở ảnh CDN và hiển thị sau tải lại. Các kiểm tra cuối của ba luồng đều đạt. URL ảnh riêng tư được BE cấp theo quyền truy cập; chưa kiểm thử hết hạn sau 10 phút hoặc tải đồng thời. Không ghi key, secret hoặc URL ký vào báo cáo.')
anchor._p.addnext(p._p)

for t in d.tables[48:]:
    for c in t.rows[0].cells:
        for p in c.paragraphs:p.paragraph_format.keep_with_next=True

d.save(TARGET)
# Chapters 1 and 2 and all earlier formatting are outside this revision.
out=Document(TARGET);out_prefix=[]
for e in out._element.body:
    if ''.join(e.xpath('.//w:t/text()'))=='CHƯƠNG 3: CHƯƠNG TRÌNH VÀ KIỂM THỬ':break
    out_prefix.append(etree.tostring(e))
assert prefix==out_prefix,'Changes before chapter 3'
assert len(out.inline_shapes)==12
assert all('1440 × 900' not in p.text for p in out.paragraphs)
assert not any('1234567890' in p.text for p in out.paragraphs)
audit={'output':str(TARGET),'screenshots':{n: {'pixels':[1920,1080],'sha256':sha256((ROOT/'screenshots'/(n+'.jpg')).read_bytes()).hexdigest()} for n in names},'before_chapter3_unchanged':True,'cloudinary_final':{'task':'PASS','chat':'PASS','avatar':'PASS'},'note':'Initial avatar assertion ran during profile loading; final poll verifies actual decoded image after reload.'}
(ROOT/'revision-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf8')
print('Updated',TARGET)
