from pathlib import Path
import re, json, copy
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT=Path(__file__).resolve().parent
SOURCE=Path('C:/Users/phann/Downloads/BaoCaoDACN_Nhom8_Chuong2.docx')
OUT=ROOT/'BaoCaoDACN_Nhom8_HoanThien.docx'
doc=Document(SOURCE)
original_text=[p.text for p in doc.paragraphs]
original_tables=[[ [c.text for c in r.cells] for r in t.rows] for t in doc.tables]

def style(d,name,size,bold=False,outline=None):
    s=d.styles.add_style(name,WD_STYLE_TYPE.PARAGRAPH) if name not in d.styles else d.styles[name]
    s.base_style=d.styles['Normal']; s.font.name='Times New Roman';s.font.size=Pt(size);s.font.bold=bold;s.font.color.rgb=RGBColor(0,0,0)
    pf=s.paragraph_format;pf.line_spacing=1.3;pf.space_after=Pt(6);pf.space_before=Pt(8 if bold else 0)
    if outline is not None:
        pf.keep_with_next=True
        ol=OxmlElement('w:outlineLvl');ol.set(qn('w:val'),str(outline));s.element.get_or_add_pPr().append(ol)
    return s

for name,size,bold,level in [('BC Chuong',16,True,0),('BC Muc',14,True,1),('BC Tieu muc',13,True,2),('BC Chi tiet',13,True,3),('BC Noi dung',13,False,None),('BC Chu thich',11,False,None)]:
    style(doc,name,size,bold,level)

# Only structural formatting in chapters 1 and 2; retain all original wording.
in_ch2=False; heading_changes=[]
for p in doc.paragraphs:
    if p.text.startswith('CHƯƠNG 2:') and p.style.name!='Normal': in_ch2=True
    if not in_ch2: continue
    if p.text.startswith('CHƯƠNG 2:'): p.style='BC Chuong';heading_changes.append(p.text)
    elif re.match(r'^2\.\d+(?:\.\d+)*\.',p.text):
        prefix=re.match(r'^(2(?:\.\d+)+)\.',p.text)
        depth=len(prefix.group(1).split('.')) if prefix else 2
        p.style={2:'BC Muc',3:'BC Tieu muc'}.get(depth,'BC Chi tiet');heading_changes.append(p.text)
        for r in p.runs:r.font.bold=True;r.font.color.rgb=RGBColor(0,0,0)

def caption(text,after=None,d=doc):
    p=d.add_paragraph(text,'BC Chu thich');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_together=True
    if after is not None:after.addnext(p._p)
    return p

supplement=30; cap_changes=[]
for i,t in enumerate(list(doc.tables)):
    el=t._tbl; prev=el.getprevious(); found=None
    # Source captions are before tables, sometimes separated by an empty paragraph.
    for _ in range(3):
        if prev is None or prev.tag!=qn('w:p'):break
        text=''.join(prev.itertext())
        visible=''.join(prev.xpath('.//w:t/text()'))
        if re.match(r'^Bảng\s+\d',visible):found=prev;break
        if visible.strip():break
        prev=prev.getprevious()
    if found is not None:
        el.addnext(found); cap_changes.append('Moved '+''.join(found.xpath('.//w:t/text()')))
        from docx.text.paragraph import Paragraph
        p=Paragraph(found,doc._body);p.style='BC Chu thich';p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    else:
        if i<3:
            names=['Các thành phần của mô hình Scrumban','Quy trình Scrumban đề xuất','Công nghệ và công cụ sử dụng']
            title=f'Bảng 1.{i+1}. {names[i]}'
        else:
            cells=' '.join(c.text for r in t.rows[:2] for c in r.cells)
            uc=re.search(r'UC\d+\.\d+',cells)
            title=f'Bảng 2.{supplement}. '+('Đặc tả Use Case '+uc.group() if uc else 'Các tác nhân và trách nhiệm trong hệ thống')
            supplement+=1
        caption(title,el);cap_changes.append('Added '+title)

def para(text,d=doc):
    p=d.add_paragraph(text,'BC Noi dung');p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent=Cm(.7)
    return p
def heading(text,level=1,page=False,d=doc):
    p=d.add_paragraph(text,{0:'BC Chuong',1:'BC Muc',2:'BC Tieu muc',3:'BC Chi tiet'}[level]);p.paragraph_format.page_break_before=page
    return p
def figure(filename,title):
    p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
    p.add_run().add_picture(str(ROOT/'screenshots'/filename),width=Cm(15.2))
    caption(title)
def table(headers,rows,title,widths=None,d=doc):
    t=d.add_table(rows=1,cols=len(headers));t.autofit=False
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        e=OxmlElement('w:'+edge);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'808080');borders.append(e)
    t._tbl.tblPr.append(borders)
    if widths is None:widths=[15.2/len(headers)]*len(headers)
    for i,h in enumerate(headers):t.rows[0].cells[i].text=h
    repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in rows:
        for c,text in zip(t.add_row().cells,row):c.text=str(text)
    for ri,row in enumerate(t.rows):
        for ci,c in enumerate(row.cells):
            c.width=Cm(widths[ci])
            for p in c.paragraphs:
                p.paragraph_format.space_after=Pt(4);p.paragraph_format.space_before=Pt(3);p.paragraph_format.line_spacing=1.1
                for r in p.runs:r.font.name='Times New Roman';r.font.size=Pt(10.5);r.font.bold=ri==0;r.font.color.rgb=RGBColor(0,0,0)
            if ri==0:
                shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'EAEAEA');c._tc.get_or_add_tcPr().append(shade)
        no=OxmlElement('w:cantSplit');row._tr.get_or_add_trPr().append(no)
    caption(title,d=d)
    return t

heading('CHƯƠNG 3: CHƯƠNG TRÌNH VÀ KIỂM THỬ',0,True)
para('Chương này trình bày giao diện và kết quả kiểm thử của hệ thống MyTaiga tại thời điểm ngày 02/11/2026. Sản phẩm hỗ trợ quản lý dự án phần mềm theo Scrumban, kết hợp lập kế hoạch bằng Product Backlog và Sprint với theo dõi công việc trên bảng trạng thái. Nội dung được đối chiếu với mã nguồn frontend, backend và các bằng chứng kiểm thử của dự án, nhằm đánh giá mức độ đáp ứng các yêu cầu đã phân tích ở Chương 2.')
para('Ứng dụng gồm giao diện React kết nối ASP.NET Core Web API; dữ liệu nghiệp vụ được truy cập qua Entity Framework Core và SQL Server. Các ảnh trong chương được chụp trực tiếp từ ứng dụng local ở khung nhìn laptop 1440 × 900 pixel. Tài khoản User có thể mang vai trò Manager hoặc Member trong từng dự án; Admin quản trị cấp hệ thống và không cần quản lý dự án. Các bản ghi có tiền tố QA là dữ liệu thử nghiệm được giữ lại trong môi trường dự án.')
heading('3.1. Các hình ảnh của phần mềm')
table(['Thành phần','Cấu hình được đối chiếu'],[
('Frontend','React 19.2.8, TypeScript 6, Vite 8.3.4; React Router, Tailwind CSS 4 và Axios.'),
('Backend','ASP.NET Core Web API trên .NET 9; Entity Framework Core SQL Server 9.0.14; JWT Bearer, BCrypt và SignalR.'),
('Kết nối','FE http://localhost:5173; BE http://localhost:5141; Vite proxy /api và /hubs.'),
('Tổ chức FE','Endpoint, DTO và Axios client tập trung tại src/services/api.ts; feature service ánh xạ dữ liệu sang UI.'),
('Dữ liệu minh họa','Project So 1, mã dự án 1; user1 là Manager. Không tạo, sửa hoặc xóa bản ghi nghiệp vụ trong đợt chụp báo cáo.')], 'Bảng 3.1. Môi trường chương trình và phạm vi minh họa',[3.2,12])

screens=[
('3.1.1. Giao diện đăng nhập','01-login.jpg','Hình 3.1. Giao diện đăng nhập hệ thống MyTaiga',
 'Màn hình đăng nhập cung cấp hai trường email và mật khẩu, nút ẩn hoặc hiện mật khẩu, lựa chọn duy trì đăng nhập và liên kết khôi phục tài khoản. Người dùng phải xác thực trước khi truy cập không gian làm việc. Giao diện được tổ chức tập trung vào biểu mẫu để giảm thao tác tìm kiếm chức năng.',
 'Khi gửi biểu mẫu, FE gọi API đăng nhập, nhận token và tải hồ sơ hiện tại. Yêu cầu tiếp theo được gắn Authorization Bearer qua client dùng chung. Sau đăng nhập, người dùng thông thường đến danh sách dự án; Admin đến khu vực quản trị. Bộ kiểm thử hiện tại đã xác minh ba tài khoản thử nghiệm đăng nhập, đăng xuất và bị chuyển về trang đăng nhập khi mở lại URL được bảo vệ.'),
('3.1.2. Dashboard','02-dashboard.jpg','Hình 3.2. Dashboard của Project So 1',
 'Dashboard tổng hợp thông tin dự án, Sprint đang hoạt động, tỷ lệ hoàn tất và danh sách Task, Story, Bug. Bên phải là ngăn chi tiết công việc; phía dưới cung cấp lịch sử cập nhật. Thành viên có thể chọn một công việc để xem thuộc tính và trao đổi mà không rời màn hình tổng quan.',
 'Service tổng quan ghép dữ liệu từ API dự án, Task, Product Backlog, Bug, Sprint, Epic, thành viên và nhật ký hoạt động. Tỷ lệ hoàn tất trên màn hình là tỷ lệ số hạng mục hoàn thành trong tập Task, Story và Bug đang thống kê; không phải vận tốc Sprint hay tỷ lệ Story Points. DoD và giờ ước lượng chưa có dữ liệu đầy đủ nên giao diện giữ thông báo tương ứng, tránh coi giá trị trống là kết quả nghiệp vụ.'),
('3.1.3. Quản lý dự án','03-projects.jpg','Hình 3.3. Danh sách dự án của tài khoản người dùng',
 'Trang Dự án của tôi trình bày tên dự án, mô tả, thời gian thực hiện, thành viên và trạng thái. Các tab đang thực hiện và đã đóng giúp phân tách vòng đời dự án; ô tìm kiếm hỗ trợ tra cứu. Nút Tạo dự án và menu tùy chọn là các điểm vào cho thao tác quản lý.',
 'Danh sách được tải theo tài khoản đăng nhập. Khi chọn Project So 1, hệ thống chuyển đến URL có projectId và xác minh quyền truy cập trước khi hiển thị nội dung. Vai trò dự án được lấy theo thành viên của dự án, không được suy ra chỉ từ nhãn User cấp hệ thống. Ảnh minh họa gồm cả dự án nghiệp vụ và dự án QA đang có trong cơ sở dữ liệu.'),
('3.1.4. Product Backlog','04-backlog.jpg','Hình 3.4. Product Backlog và khu vực lập kế hoạch Sprint',
 'Product Backlog tập hợp các yêu cầu sản phẩm dưới dạng PBI. Màn hình hỗ trợ tìm kiếm, lọc trạng thái, Epic và độ ưu tiên; đồng thời trình bày danh sách Sprint ở vùng bên phải. PBI được liên kết Epic để thể hiện nhóm sáng kiến và có thể được phân bổ vào Sprint theo kế hoạch.',
 'FE dùng API Product Backlog để tải và lưu PBI; thao tác liên kết Sprint dùng API tương ứng với mã PBI thật. Dữ liệu từ BE được ánh xạ sang nhãn tiếng Việt và trạng thái giao diện. Một số thông tin phụ như loại nghiệp vụ, người báo cáo, DoD hoặc năng lực Sprint chưa có hợp đồng dữ liệu đầy đủ; các vùng này vẫn được giữ trên UI và cần hoàn thiện sau.'),
('3.1.5. Sprint','05-sprints.jpg','Hình 3.6. Giao diện quản lý Sprint',
 'Trang Sprint trình bày các chu kỳ đang chạy, đã lên kế hoạch và đã đóng. Người quản lý có thể mở biểu mẫu tạo hoặc chỉnh sửa, vào màn hình lập kế hoạch và xem tiến độ. Khi tạo Sprint, ngày bắt đầu và kết thúc được nhập theo định dạng ngày; BE quyết định các ràng buộc trùng tên và chồng lịch.',
 'Lỗi nghiệp vụ trả về từ BE được hiển thị bằng thông báo cụ thể; biểu mẫu giữ dữ liệu để người dùng sửa lại. Các chỉ số phụ chưa được đồng bộ hoàn toàn: ví dụ Velocity 21.5 SP trên ảnh là giá trị minh họa còn cố định trong UI. Vì vậy không sử dụng con số này để kết luận năng suất thực tế của nhóm hoặc hiệu quả cải tiến qua Sprint.'),
('3.1.6. Scrumban Board','06-kanban.jpg','Hình 3.7. Bảng Scrumban với các cột trạng thái công việc',
 'Scrumban Board trực quan hóa Task theo bốn cột Cần làm, Đang làm, Đang kiểm tra và Hoàn thành. Mỗi thẻ thể hiện định danh, tiêu đề và một số thuộc tính như hạn hoặc người thực hiện. Thanh công cụ có bộ lọc, chức năng tạo Task và cấu hình WIP; cột không có công việc vẫn được hiển thị để bảo toàn luồng xử lý.',
 'Dữ liệu thẻ và cột được lấy từ API Board; cập nhật di chuyển được gửi qua API move. BE kiểm tra quyền thành viên, trạng thái dự án, Sprint đã đóng, nhiệm vụ con và giới hạn WIP trước khi lưu. Đợt làm báo cáo chỉ xem Board, không kéo thẻ hoặc đổi WIP hiện hữu. Phần banner Sprint 14 và một số lựa chọn bộ lọc trên ảnh còn là nội dung mẫu, khác với danh sách Sprint thật của dự án.'),
('3.1.7. Quản lý Task','07-task.jpg','Hình 3.9. Ngăn chi tiết Task và khu vực trao đổi',
 'Khi chọn một thẻ trên Board, ngăn chi tiết hiển thị tiêu đề, trạng thái, người thực hiện, độ ưu tiên, hạn, mô tả, checklist, tệp đính kèm và bình luận. Cách tổ chức này cho phép xem công việc trong bối cảnh các cột trạng thái; thao tác đóng ngăn đưa người dùng trở lại Board.',
 'FE đọc chi tiết theo mã Task thật và gọi các API chuyên biệt để cập nhật thuộc tính, Subtask, bình luận hoặc tệp. Ảnh không chứng minh toàn bộ trường đã lưu thành công: một số metadata phụ như PBI-142, Sprint 14 và tên Epic thay thế còn được đặt mặc định trong component. Hệ thống cần thay các nhãn mẫu bằng dữ liệu xác thực hoặc thông báo thiếu dữ liệu trước khi nghiệm thu đầy đủ.'),
('3.1.8. Quản lý thành viên','08-members.jpg','Hình 3.10. Thành viên và phòng ban của dự án',
 'Màn hình thành viên kết hợp danh mục phòng ban và bảng người tham gia dự án. Bảng cho biết danh tính, vai trò, phòng ban, vị trí chuyên môn và trạng thái. Người quản lý có các điểm thao tác thêm thành viên, tổ chức phòng ban và lọc danh sách; các quyền này phụ thuộc vai trò trong dự án.',
 'Danh bạ tài khoản được truy vấn từ API users và danh sách thành viên theo projectId. Vai trò Manager/Member quyết định quyền nghiệp vụ, còn vị trí chuyên môn như FE, BE hoặc Tester là thông tin tổ chức. Ảnh cho thấy cả user1 và user2 trong cùng Project So 1; đợt chụp không thêm, loại bỏ, nâng quyền hoặc chuyển phòng ban cho tài khoản nào.'),
('3.1.9. Bug/Issue','09-bugs.jpg','Hình 3.11. Danh sách Bug và bộ lọc xử lý lỗi',
 'Phân hệ Bug ghi nhận lỗi liên quan đến Task, gồm tiêu đề, mức độ nghiêm trọng, trạng thái, người xử lý và ngày tạo. Người dùng có thể tìm kiếm, lọc và mở chi tiết lỗi; chức năng báo cáo Bug tạo đầu vào cho quá trình theo dõi và xử lý sự cố trong dự án.',
 'BE dùng các trạng thái OPEN, IN_PROGRESS, RESOLVED, CLOSED và REOPENED. Mặc dù FE cho phép chọn trực tiếp trạng thái trong chi tiết, BE vẫn kiểm tra các bước chuyển hợp lệ và có thể trả 409. FE chỉ cập nhật sau phản hồi thành công, không tự gọi các trạng thái trung gian để vượt quy tắc. Các lựa chọn người xử lý trong bộ lọc và nội dung SLA trên màn hình vẫn cần đối chiếu thêm trước khi dùng như dữ liệu thực tế.'),
('3.1.10. Cộng tác nhóm em','10-chat.jpg','Hình 3.12. Tin nhắn trong phạm vi Project So 1',
 'Không gian cộng tác cung cấp kênh trao đổi theo dự án và lịch sử tin nhắn của các thành viên. Giao diện gồm danh sách kênh bên trái, nội dung hội thoại bên phải và ô soạn tin phía dưới. Ảnh cho thấy các tin nhắn hiện hữu của user1 và user2; không gửi tin nhắn mới trong đợt lập báo cáo.',
 'Danh sách phòng được giới hạn theo dự án đang mở; FE sử dụng REST cho lịch sử và WebSocket theo giao thức SignalR cho sự kiện Chat. Bình luận và tệp đính kèm còn được truy cập từ chi tiết Task. Việc hiển thị lịch sử không thay thế kiểm thử gửi nhận đồng thời giữa nhiều phiên; chức năng này và các thao tác tệp cần được kiểm tra riêng với dữ liệu chuyên dụng.')]

for h,img,cap,a,b in screens:
    heading(h,2,True);para(a);figure(img,cap);para(b)
    if h.startswith('3.1.4.'):
        p=para('Epic là cấp nhóm yêu cầu để quản lý các sáng kiến lớn, thể hiện tiến độ và quan hệ với PBI, Task. Danh sách Epic hiện có được minh họa ở Hình 3.5, bổ sung góc nhìn nhóm công việc cho Product Backlog.');p.paragraph_format.page_break_before=True
        figure('12-epics.jpg','Hình 3.5. Danh sách Epic liên quan đến Product Backlog')
        para('Màn hình trình bày tên sáng kiến, tiến độ, số PBI và Task liên quan, trạng thái, độ ưu tiên và Sprint mục tiêu. Bộ lọc hỗ trợ thu hẹp danh sách để người quản lý tập trung vào từng nhóm yêu cầu. Dữ liệu danh sách được tải theo dự án; các mã định danh được giữ xuyên suốt khi chuyển sang chi tiết hoặc liên kết PBI.')
        para('Quan hệ Epic–PBI giúp nhóm theo dõi phạm vi sản phẩm ở mức tổng quát trước khi chia việc theo Sprint. Việc có một Epic trên danh sách chưa thể hiện toàn bộ yêu cầu thuộc Epic đã hoàn thành; tiến độ phải được hiểu theo cách tính của API. Các giá trị chưa được BE cung cấp cần được phân biệt với dữ liệu đã tổng hợp từ công việc thật.')
    if h.startswith('3.1.6.'):
        p=para('Flow Metrics bổ sung góc nhìn định lượng cho Board bằng các chỉ số WIP, Throughput, Cycle Time và Work Item Age. BE có API cho các chỉ số này, nhưng lịch sử công việc có thể chưa đầy đủ và một số biểu đồ phụ còn minh họa. Do đó cần phân biệt KPI đã nhận từ API với đường xu hướng hoặc ngưỡng chưa được xác minh.');p.paragraph_format.page_break_before=True
        figure('11-metrics.jpg','Hình 3.8. Giao diện theo dõi Flow Metrics của dự án')
        para('WIP phản ánh số công việc đang được xử lý; Throughput phản ánh số công việc hoàn thành trong một khoảng thời gian. Cycle Time dùng cho công việc đã hoàn thành, còn Work Item Age cho biết thời gian đã trôi qua của công việc chưa hoàn thành. Khi so sánh giữa các kỳ, cần giữ nhất quán quy tắc xác định thời điểm bắt đầu, hoàn thành và phạm vi lọc dữ liệu.')
        para('Nếu dữ liệu theo dõi mới được bổ sung giữa vòng đời dự án, thống kê có thể không bao phủ các trạng thái trước thời điểm đó. Các giá trị và biểu đồ trên ảnh chỉ minh họa phiên làm việc đã chụp; đợt báo cáo chưa kiểm chứng toàn bộ công thức, ngưỡng cảnh báo hoặc xu hướng qua nhiều kỳ. Việc đánh giá cải tiến quy trình cần thêm bộ dữ liệu chuẩn và kịch bản kiểm thử Metrics riêng.')

heading('3.2. Kiểm thử các chức năng của phần mềm',1,True)
heading('3.2.1. Phương pháp kiểm thử',2)
para('Nhóm sử dụng kiểm thử nhiều lớp để phân biệt lỗi giao diện, ánh xạ dữ liệu và hành vi tích hợp. Kiểm thử unit/component bằng Vitest và React Testing Library xác minh các service, guard, adapter và phản hồi giao diện; các phản hồi API được mô phỏng nhằm tạo tình huống xác định. Playwright trên Chromium kiểm tra thao tác và điều hướng trong trình duyệt. Với BE thật, bộ authenticated được chạy riêng để kiểm tra đăng nhập, các trang chỉ đọc, phân quyền và đăng xuất của ba tài khoản thử nghiệm.')
para('Các tình huống được chọn dựa trên yêu cầu ở Chương 2, ưu tiên xác thực, phạm vi dự án, tải dữ liệu, dữ liệu rỗng, lỗi API và hành vi sau thao tác. Kỹ thuật phân vùng tương đương và giá trị biên được áp dụng trong những bài kiểm tra có điều kiện đầu vào; kiểm thử hồi quy được dùng cho các lỗi từng xuất hiện. Kết quả một test mock chỉ xác nhận cách FE xử lý tình huống mô phỏng, không xác nhận BE chấp nhận cùng request.')
table(['Lớp kiểm tra','Cách thực hiện','Giới hạn kết luận'],[
('Unit/component','Vitest, RTL, mock transport và dữ liệu thử.','Xác minh logic FE; không chứng minh persistence trên BE.'),
('Trình duyệt mock','Playwright Chromium, intercept API/hub.','Kiểm tra UI, điều hướng và phản hồi có kiểm soát.'),
('Tích hợp chỉ đọc','authenticated.spec.ts trên BE thật, ba tài khoản.','Đăng nhập, xem trang, quyền truy cập, đăng xuất; không phải toàn bộ CRUD.'),
('Kiểm tra biên dịch','TypeScript và Vite production build; oxlint.','Phát hiện lỗi tĩnh; không thay thế kiểm thử nghiệp vụ.'),
('Minh họa giao diện','Chụp 1440 × 900 trên FE kết nối BE thật.','Xác nhận giao diện hiển thị tại thời điểm chụp; không phải benchmark.')], 'Bảng 3.2. Phương pháp kiểm thử và giới hạn bằng chứng',[2.7,5.7,6.8])
para('Các bài kiểm tra tích hợp trong đợt này không tạo hoặc xóa dữ liệu nghiệp vụ, không đổi quyền hay mật khẩu. Thao tác đăng xuất thuộc luồng xác thực. Kiểm thử CRUD toàn vòng đời, upload ảnh, gửi nhận realtime nhiều phiên và các ràng buộc trên dữ liệu đang dùng được ghi nhận từ tài liệu hồi quy trước hoặc đánh dấu chưa chạy lại, thay vì thực thi trực tiếp chỉ để hoàn thiện bảng kết quả.')
heading('3.2.2. Kiểm thử chức năng',2,True)
para('Bảng 3.3 tổng hợp những nhóm tình huống được lựa chọn, gắn với tên file kiểm thử để có thể truy vết. Các dòng có bằng chứng mock và live chỉ đại diện cho phạm vi được mô tả trong dòng; không suy rộng thành mọi thao tác của phân hệ đều đã đạt.')
table(['Mã','Chức năng và tình huống','Kết quả và bằng chứng'],[
('KT01','Admin, user1, user2 đăng nhập; xem trang; đăng xuất; mở lại URL bảo vệ.','Đạt live, 3 test; tests/live/authenticated.spec.ts.'),
('KT02','User mở khu vực Admin; Member xem Metrics bị giới hạn.','Đạt trong bộ live: từ chối quyền đúng màn hình; không thay role.'),
('KT03','Khôi phục phiên và guard khi đang tải hoặc chưa đăng nhập.','Đạt mock; tests/e2e/frontend.spec.ts và unit guards/session.'),
('KT04','Danh sách dự án, hồ sơ, Admin và trang dự án ở trạng thái rỗng/lỗi.','Đạt mock smoke; kiểm tra không có lỗi ứng dụng chưa bắt; không khẳng định đủ thông báo cho mọi API.'),
('KT05','Nút Tạo trên header mở form Backlog, Sprint, Epic, Kanban, Bug.','Đạt mock; tests/e2e/project-create.spec.ts.'),
('KT06','Form Sprint nhận 409 và hiển thị lý do; giữ input.','Đạt mock regression; ui-followup.spec.ts và ui-followup.test.tsx. Không tạo Sprint thật ở đợt này.'),
('KT07','Bug đổi trực tiếp trạng thái; API chấp nhận/từ chối; REOPENED.','Đạt mock; phản hồi lỗi giữ trạng thái cũ. Không kết luận BE cho phép đổi tùy ý.'),
('KT08','Chat theo project: danh sách có dữ liệu, rỗng, lỗi; cập nhật lịch sử.','Đạt mock; api-update.spec.ts và các unit Chat. Ảnh chụp live xác nhận lịch sử hiển thị.'),
('KT09','Transport/DTO, mapping Task, PBI, Sprint, member, notification và lỗi mutation.','Đạt trong bộ 221 unit/component; không quy đổi thành 221 endpoint.'),
('KT10','Menu hồ sơ và các trang cài đặt; điều hướng, tải lại; toast đóng ngay.','Đạt mock regression. Không đổi mật khẩu thật.'),
('KT11','Upload ảnh avatar, Task, Chat trên dịch vụ thực.','Chưa chạy lại. Báo cáo QA_API_UPDATE_REPORT.md ghi nhận 503 trước đó; chưa xác nhận đã khắc phục.'),
('KT12','CRUD xuyên suốt, kéo thả/WIP và persistence giữa user1, user2.','Có bằng chứng lịch sử trong PROJECT_WORKFLOW_REPORT.md; đợt này không tái chạy mutation.'),
('KT13','Hiệu năng tải, bảo mật chuyên sâu, mobile và nhiều trình duyệt.','Chưa đo đầy đủ trong đợt này; không kết luận đạt chỉ từ build hoặc ảnh laptop.')], 'Bảng 3.3. Ma trận tình huống kiểm thử chức năng',[1.3,6.5,7.4])
para('Tại lớp BE, BoardController chặn di chuyển vào cột đã đạt WIP và kiểm tra điều kiện Task cha/con; BugsController kiểm soát các cặp trạng thái hợp lệ. Đây là kết quả đọc mã nguồn, khác với kết quả thực thi một bài kiểm thử mới. Các báo cáo BE trước đây ghi nhận 722 kiểm tra trên 18 bộ với dữ liệu thử và Cloudinary test double; con số này được xem là bằng chứng lịch sử, không cộng vào tổng kết quả chạy FE ngày 02/11/2026.')
heading('3.2.3. Kết quả kiểm thử',2)
para('Đợt kiểm tra phục vụ báo cáo chạy trên mã nguồn hiện có ngày 02/11/2026. Bảng 3.4 ghi kết quả lệnh đã thực thi; số lượng test được giữ riêng theo lớp để tránh đánh đồng test mock với tích hợp thực tế hoặc cộng trùng với các báo cáo cũ.')
table(['Lệnh hoặc bộ kiểm tra','Đạt','Lỗi','Ghi chú'],[
('npm test','221','0','Vitest unit/component; 0 pending.'),
('npm run test:e2e','62','0','Playwright Chromium với API mô phỏng; 0 skipped.'),
('Playwright live authenticated.spec.ts','3','0','Ba tài khoản; live chỉ đọc và luồng xác thực; 0 skipped.'),
('npm run build','Đạt','0','TypeScript và Vite production build thành công.'),
('npm run lint','Exit 0','0 lỗi','Còn 9 cảnh báo; chưa phải trạng thái không cảnh báo.')], 'Bảng 3.4. Kết quả kiểm thử mới phục vụ báo cáo',[7.3,1.4,1.4,5.1])
para('Các bài kiểm tra tự động đã chạy đều đạt trong phạm vi của chúng. Ba test live chứa nhiều bước kiểm tra trang và quyền, nhưng không được quy đổi thành số endpoint độc lập. Kết quả này cho thấy phiên bản hiện tại có thể biên dịch và đáp ứng những kịch bản đã chọn; chưa đủ cơ sở khẳng định toàn bộ 126 Use Case đã được nghiệm thu hoặc toàn bộ dữ liệu trên UI đều đã đồng bộ với BE.')
para('Chín cảnh báo lint nằm ở script biểu thức chính quy và các component liên quan đến setState trong effect hoặc phụ thuộc hook: AuthContext, Sidebar, Dashboard, Admin, Kanban và Chat. Cảnh báo không chặn build nhưng cần được xử lý trong giai đoạn ổn định mã nguồn. Các trường hiển thị mẫu và lỗi upload đã ghi nhận vẫn là vấn đề mở, dù bộ kiểm thử hiện tại không có test thất bại.')
table(['Vấn đề còn lại','Ảnh hưởng','Đánh giá'],[
('Upload ảnh từng trả 503','Avatar, ảnh Task và Chat có thể không lưu được.','Chưa xác minh lại dịch vụ thật; cần test file nhỏ và kiểm tra cấu hình lưu trữ.'),
('Workflow Bug','Chọn trạng thái trên FE có thể bị BE trả 409.','Cần thống nhất yêu cầu chuyển tùy ý với quy tắc BE; không sửa BE trong phạm vi này.'),
('Dữ liệu phụ còn mẫu','Banner Sprint 14, Velocity 21.5 SP, metadata Task và một số filter có thể gây hiểu nhầm.','Cần nối dữ liệu đúng hoặc ghi rõ chưa có dữ liệu.'),
('Lịch sử Metrics và biểu đồ','Không phải toàn bộ lịch sử đã được thu thập; một số đường biểu diễn minh họa.','Cần đánh dấu phạm vi lịch sử và kiểm tra công thức theo dữ liệu chuẩn.'),
('Phạm vi phi chức năng','Chưa đo tải đồng thời, độ trễ đồng bộ, đa trình duyệt và accessibility đầy đủ.','Cần kế hoạch đo riêng trước triển khai sử dụng rộng rãi.')], 'Bảng 3.5. Các vấn đề còn mở sau đợt kiểm thử',[4.2,5.0,6.0])

heading('3.3. Đánh giá và tính khả thi của đề tài',1)
heading('3.3.1. Thuận lợi',2)
para('Hệ thống có sự phân chia tương đối rõ giữa giao diện, lớp dịch vụ API và tầng xử lý BE. Endpoint và DTO được tập trung giúp truy vết dữ liệu, giảm tình trạng nhiều client gọi cùng nghiệp vụ theo hợp đồng khác nhau. Các component dùng chung như modal, button, badge và toast hỗ trợ xây dựng nhiều phân hệ với cách tương tác nhất quán.')
para('Các chức năng nền tảng đã có giao diện và API tương ứng, bao gồm dự án, thành viên, Epic, Backlog, Sprint, Task, Board, Bug và Chat. Bộ kiểm thử unit/component và trình duyệt đã được tổ chức trong repository, tạo điều kiện phát hiện hồi quy khi sửa adapter, quyền truy cập hoặc xử lý lỗi. Sự phân biệt giữa quyền hệ thống và quyền dự án phù hợp với việc một người tham gia nhiều dự án ở các trách nhiệm khác nhau.')
heading('3.3.2. Khó khăn',2)
para('Khó khăn chủ yếu nằm ở việc duy trì tính nhất quán giữa thiết kế, DTO và dữ liệu thực. Một màn hình có thể cần ghép nhiều API; khi BE thiếu một trường, các giá trị mặc định dễ bị hiểu là dữ liệu thật nếu không được đánh dấu. Những thông tin như DoD, năng lực Sprint, metadata Task hoặc biểu đồ lịch sử cần được thống nhất trước khi hoàn thiện tích hợp.')
para('Ngoài ra, quy tắc nghiệp vụ phải được kiểm tra ở cả FE và BE. Ví dụ, Sprint có thể bị từ chối vì chồng lịch hoặc trùng tên; Bug không được chuyển qua mọi cặp trạng thái; Board phải giữ WIP và quan hệ cha/con. Các dịch vụ ngoài như lưu ảnh và email tạo thêm phụ thuộc môi trường. Việc kiểm thử không được làm thay đổi dữ liệu hiện hữu cũng hạn chế khả năng tái chạy các thao tác phá hủy trong môi trường chung.')
heading('3.3.3. Tính khả thi',2)
para('Về kỹ thuật, kết quả build, test và các màn hình kết nối BE thật cho thấy kiến trúc hiện tại có thể tiếp tục phát triển để phục vụ nhóm dự án nhỏ. FE không truy cập trực tiếp SQL Server; các kiểm tra quyền và toàn vẹn nghiệp vụ tập trung ở BE. Đây là nền tảng phù hợp cho việc mở rộng theo từng chức năng và triển khai thử có kiểm soát.')
para('Về vận hành, hệ thống có thể dùng để trình diễn quy trình quản lý công việc từ dự án, Backlog và Sprint đến Board, Bug và trao đổi nhóm. Trước khi sử dụng rộng rãi, cần xử lý lỗi dịch vụ ảnh, thay dữ liệu minh họa còn sót và hoàn thiện kiểm thử các luồng ghi dữ liệu. Chưa có số liệu chi phí hosting, tải đồng thời hoặc khảo sát người dùng đủ để khẳng định hiệu quả kinh tế hay năng suất tăng theo một tỷ lệ cụ thể.')
table(['Khía cạnh','Cơ sở đánh giá','Điều kiện tiếp tục'],[
('Kỹ thuật','FE build thành công; unit, browser mock và live đã chọn đều đạt.','Hoàn thiện dữ liệu phụ, lỗi tệp và kiểm thử CRUD đầy đủ.'),
('Nghiệp vụ','Có các phân hệ cốt lõi và hai cấp quyền.','Thống nhất workflow Bug, quy tắc đóng Sprint và dữ liệu thiếu.'),
('Vận hành','Có thể chạy và minh họa trên môi trường local.','Cấu hình triển khai, HTTPS, lưu trữ, sao lưu và giám sát.'),
('Nguồn lực','Công nghệ và cấu trúc feature đã có trong dự án.','Duy trì hồi quy, tài liệu contract và phân công kiểm thử.')], 'Bảng 3.6. Đánh giá tính khả thi và điều kiện hoàn thiện',[2.6,6.2,6.4])
heading('3.3.4. Hạn chế của hệ thống',2)
para('Phiên bản hiện tại chưa đồng bộ toàn bộ thông tin phụ trên các màn hình; một số giá trị vẫn mang tính minh họa. Các biểu đồ và chỉ số không có lịch sử đầy đủ chưa nên được dùng làm căn cứ đánh giá hiệu suất cá nhân hoặc cam kết tiến độ. Các trường thiếu phải được giữ trên UI theo thiết kế, nhưng cần được nhận diện rõ để người dùng không hiểu nhầm.')
para('Đợt kiểm thử mới chỉ bao phủ Chromium desktop với những kịch bản đã nêu; chưa kiểm chứng toàn bộ thao tác CRUD UI, mọi tổ hợp filter/phân trang, kéo thả bằng bàn phím, mobile, Firefox, WebKit hoặc toàn bộ lỗi mạng. Chưa có phép đo tải, pentest, thời gian đồng bộ Board hoặc kiểm thử email đầu cuối. Hệ thống cũng cần kiểm tra lại upload ảnh trên dịch vụ thật. Những hạn chế này là điều kiện cần hoàn thiện trước nghiệm thu toàn diện, không bị loại bỏ chỉ vì các test hiện tại đều đạt.')

heading('KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN',0,True)
para('Đề tài đã xây dựng được hệ thống hỗ trợ quản lý và cộng tác trong dự án phần mềm theo mô hình Scrumban với frontend React và backend ASP.NET Core Web API. Sản phẩm cung cấp không gian dự án, tổ chức thành viên, quản lý Epic, Product Backlog, Sprint, Task, Board, Bug và trao đổi theo dự án. Việc kết hợp lập kế hoạch theo chu kỳ với trực quan hóa trạng thái công việc tạo cơ sở để nhóm theo dõi tiến độ và nhận biết tình trạng quá tải.')
para('Kết quả đối chiếu và kiểm thử cho thấy phiên bản hiện tại biên dịch thành công, đạt 221 test unit/component, 62 test trình duyệt mock và 3 test tích hợp chỉ đọc theo tài khoản. Các ảnh laptop minh họa giao diện thực tế và dữ liệu hiện hữu. Tuy nhiên, phạm vi này chưa chứng minh mọi Use Case đã hoàn tất; một số dữ liệu phụ còn mẫu, quy tắc Bug cần thống nhất và upload ảnh cần kiểm tra lại.')
para('Trong giai đoạn tiếp theo, nhóm ưu tiên xử lý luồng tải ảnh, rà soát toàn bộ placeholder và cập nhật tài liệu thiết kế theo mô hình quyền thực tế. Sau đó mở rộng hồi quy CRUD trên dữ liệu thử riêng, kiểm chứng đồng bộ nhiều phiên, hoàn thiện dữ liệu Metrics và kiểm tra các ràng buộc WIP, Sprint, Task cha/con. Việc đo hiệu năng, bảo mật, khả năng truy cập và đa thiết bị cần thực hiện trước khi triển khai rộng rãi.')
para('Về lâu dài, hệ thống có thể bổ sung tiêu chí hoàn thành, năng lực Sprint và báo cáo lịch sử dựa trên hợp đồng dữ liệu thống nhất; cải thiện tìm kiếm, lọc và theo dõi sự kiện; đồng thời hoàn thiện giám sát, sao lưu và phục hồi. Các hướng phát triển này cần được ưu tiên theo nhu cầu sử dụng thực tế và có bằng chứng kiểm thử sau mỗi thay đổi.')

heading('TÀI LIỆU THAM KHẢO',0,True)
refs=[
 '[1] Ken Schwaber và Jeff Sutherland. The Scrum Guide. 2020. https://scrumguides.org/scrum-guide.html (truy cập 02/11/2026).',
 '[2] Kanban Guides. The Kanban Guide, May 2025. https://kanbanguides.org/the-kanban-guide/ (truy cập 02/11/2026).',
 '[3] React. Quick Start, tài liệu chính thức. https://react.dev/learn (truy cập 02/11/2026).',
 '[4] Microsoft. ASP.NET Core documentation, phiên bản .NET 9. https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0 (truy cập 02/11/2026).',
 '[5] Nhóm 8. Mã nguồn frontend MyTaiga: package.json, vite.config.ts, src/app/router, src/services/api.ts và các feature service. Bản làm việc đối chiếu ngày 02/11/2026.',
 '[6] Nhóm 8. Mã nguồn BE-MyTaiga: MyTaigaAPI.csproj, Program.cs, Controllers, DTOs, Entities và ScrumbanDbContext. Commit đối chiếu 8fccccb; ngày 02/11/2026.',
 '[7] Nhóm 8. PROJECT_WORKFLOW_REPORT.md, QA_API_UPDATE_REPORT.md và UI_FOLLOWUP_2026-11-01.md. Báo cáo tích hợp và hồi quy nội bộ tháng 10–11/2026.',
 '[8] Nhóm 8. BACKEND_PROGRESS.md và FRONTEND_RESPONSE_CONTRACT.md trong BE-MyTaiga. Tài liệu tiến độ và hợp đồng dữ liệu nội bộ.',
 '[9] Nhóm 8. Kết quả kiểm thử ngày 02/11/2026: artifacts/report-chapter3/unit-results.json, test-results/browser-results.json và test-results/live-browser-results.json. Lưu cùng hồ sơ bằng chứng thực hiện báo cáo.'
]
for r in refs:para(r)

heading('PHỤ LỤC',0,True)
heading('A. Hướng dẫn chạy và tái hiện',1)
para('Chuẩn bị môi trường FE theo package-lock.json và môi trường BE theo .NET 9. BE cần cấu hình kết nối SQL Server, JWT và dịch vụ lưu trữ hợp lệ bằng cơ chế cấu hình riêng; không đưa giá trị bí mật vào báo cáo. Khởi động BE tại cổng 5141 và FE bằng npm run dev tại cổng 5173. OpenAPI Development của ứng dụng nằm tại /openapi/v1.json.')
para('Đăng nhập bằng tài khoản thử nghiệm do nhóm quản lý; chọn Project So 1 để xem Tổng quan, Backlog, Sprint, Epic, Board, Bug, Metrics, Thành viên và Tin nhắn. Không dùng tài khoản Admin để suy ra quyền nghiệp vụ dự án. Các thao tác tạo, sửa, xóa, upload hoặc thay đổi workflow nên thực hiện trên bộ dữ liệu kiểm thử riêng.')
para('Tái chạy unit bằng npm test; kiểm thử browser mock bằng npm run test:e2e; build bằng npm run build; kiểm tra tĩnh bằng npm run lint. Để chạy bộ live chỉ đọc, cung cấp QA_TEST_PASSWORD tạm thời rồi chạy npx playwright test -c playwright.live.config.ts tests/live/authenticated.spec.ts. Không lưu mật khẩu hoặc token vào lệnh minh họa, log hoặc file báo cáo.')
heading('B. Danh mục ảnh minh họa',1)
table(['Hình','Nội dung','Màn hình'],[(cap.split('. ',1)[0],cap.split('. ',1)[1],h.split('. ',1)[0]) for h,img,cap,a,b in screens]+[('Hình 3.5','Danh sách Epic','3.1.4'),('Hình 3.8','Flow Metrics','3.1.6')], 'Bảng PL.1. Ánh xạ ảnh chụp với các mục chương 3',[2.0,10.7,2.5])
heading('C. Quy ước kết quả và hồ sơ bằng chứng',1)
para('Đạt nghĩa là assertion của tình huống đã chạy được đáp ứng. Chưa chạy lại nghĩa là có vấn đề hoặc bằng chứng lịch sử nhưng chưa tái xác minh ở đợt hiện tại. Chưa kiểm thử nghĩa là chưa đủ bằng chứng thực thi để đánh giá. Không lấy số lượng endpoint, số Use Case thiết kế hoặc ảnh chụp làm số ca kiểm thử độc lập.')
para('Hồ sơ thực hiện lưu ảnh chụp gốc 1440 × 900, kết quả unit mới và bản sao kết quả browser mock/live. Chỉ lưu dữ liệu cần để truy vết; không đính kèm thông tin xác thực. Các tài liệu nội bộ được ghi rõ tên và thời điểm để phân biệt với kết quả chạy mới, tránh sử dụng kết quả kiểm thử của phiên bản cũ như bằng chứng nghiệm thu hiện tại.')
doc.save(OUT)

# Separate review document; no proposed prose is inserted into chapters 1 and 2.
review=Document()
sec=review.sections[0];sec.page_width=Cm(21);sec.page_height=Cm(29.7);sec.top_margin=sec.bottom_margin=Cm(2);sec.left_margin=Cm(2.5);sec.right_margin=Cm(2)
for name,size,bold,level in [('BC Chuong',16,True,0),('BC Muc',14,True,1),('BC Tieu muc',13,True,2),('BC Chi tiet',13,True,3),('BC Noi dung',13,False,None),('BC Chu thich',11,False,None)]:style(review,name,size,bold,level)
title=review.add_paragraph('Góp ý chương 1 và chương 2 của báo cáo MyTaiga','Title');title.runs[0].font.color.rgb=RGBColor(0,0,0);title.runs[0].font.name='Times New Roman'
for st in review.styles:
    for border in list(st.element.xpath('.//w:pBdr')):border.getparent().remove(border)
for border in list(title._p.xpath('.//w:pBdr')):border.getparent().remove(border)
para('Tài liệu này tổng hợp các điểm cần cải thiện sau khi đối chiếu báo cáo nhóm 8 với frontend và backend ngày 02/11/2026. Ưu tiên cao nhất là thống nhất mô hình vai trò, mô tả cơ chế xác thực đúng mã nguồn, cập nhật trạng thái thiết kế cơ sở dữ liệu và phân biệt tính năng đã tích hợp với phần còn minh họa. Nội dung đề xuất dưới đây chưa được thay vào chương 1 hoặc chương 2 của báo cáo chính.',review)
heading('1. Phạm vi chỉnh sửa đã thực hiện',1,d=review)
para('Bản báo cáo chính giữ nguyên toàn bộ câu chữ, dữ liệu bảng và hình ảnh có sẵn của chương 1–2. Chương 2 chỉ được chuẩn hóa cấp heading theo số mục; tên mục không đổi. Theo yêu cầu chú thích hình/bảng, các nhãn bảng có sẵn được chuyển xuống dưới bảng và các bảng thiếu nhãn được bổ sung. Hình có sẵn giữ chú thích gốc. Không sửa mã nguồn FE hoặc BE.',review)
para('Ba bảng của chương 1 được bổ sung nhãn Bảng 1.1–1.3. Các bảng chương 2 chưa có nhãn dùng số bổ sung từ 2.30 để không đổi các tham chiếu 2.1–2.29 đang có trong nội dung; vì vậy số bổ sung chưa đi theo thứ tự xuất hiện. Khi nhóm cho phép biên tập nội dung hai chương đầu, nên đánh lại toàn bộ thứ tự bảng và cập nhật tham chiếu đồng thời.',review)
heading('2. Những điểm cần cải thiện ở chương 1',1,d=review)
items=[
('Cao','Vai trò tại Mở đầu và 1.2.1','Báo cáo nêu 5 vai trò Admin, PM/PO, Scrum Master, Developer, Tester; chương 2 và mã nguồn dùng ADMIN/USER cấp hệ thống, MANAGER/MEMBER cấp dự án.','Thống nhất bốn tên vai trò theo hai phạm vi; PO, Scrum Master, Developer, Tester có thể được mô tả là trách nhiệm hoặc vị trí chuyên môn nếu đúng quyết định nhóm.'),
('Cao','Bảng công nghệ mục 1.1.5','Dòng ASP.NET Core Identity/JWT chưa khớp triển khai. csproj không có Identity; Program.cs dùng JwtBearer, AuthService và BCrypt.','Đổi mô tả sang JWT Bearer, băm mật khẩu BCrypt và kiểm tra TokenVersion; không gọi JWT là cơ chế mã hóa mật khẩu.'),
('Cao','Cam kết đồng bộ Board dưới 2 giây','Bảng công nghệ nêu SignalR giúp Board đồng bộ dưới 2 giây, nhưng chưa có phép đo hoặc luồng FE chứng minh yêu cầu này.','Đưa thành mục tiêu cần đo; tách Chat realtime khỏi đồng bộ Board. Bổ sung kịch bản hai client và đo độ trễ trước khi kết luận đạt.'),
('Vừa','Hiệu năng, bảo mật và toàn vẹn tại 1.2.2','Các từ 100%, tuyệt đối và đảm bảo đầy đủ vượt bằng chứng hiện có; đợt này chỉ Chromium desktop và các test đã chọn.','Viết thành tiêu chí kiểm chứng, định nghĩa ngưỡng tải/độ trễ, vai trò và lỗi; báo cáo phạm vi thực nghiệm thay cho bảo đảm tuyệt đối.'),
('Vừa','Phân tích lựa chọn công nghệ','Các lập luận React nhanh hơn jQuery, EF tự ngăn SQL Injection và async xử lý Flow Metrics chưa có phép so sánh trong dự án.','Nêu lợi ích thiết kế cụ thể; tránh quy kết hiệu năng hoặc an toàn tuyệt đối cho framework. Phân biệt truy vấn tham số hóa với raw SQL và chi phí tính toán.'),
('Vừa','Thuật ngữ và diễn đạt','Cụm nhóm em xuất hiện cả trong khái niệm chung; một số dấu câu và khoảng trắng chưa thống nhất.','Dùng nhóm phát triển hoặc đội ngũ ở nội dung lý thuyết; chỉ dùng nhóm em khi nói về tác giả. Rà chính tả sau khi được phép sửa nội dung.'),
('Vừa','Nguồn lý thuyết','Có nhắc Ladas và Alqudah/Razali nhưng bản gốc chưa có danh mục tài liệu tham khảo hoàn chỉnh.','Bổ sung đầy đủ thông tin ấn phẩm sau khi kiểm tra bản gốc; không tự gán DOI, trang hoặc nhà xuất bản khi chưa xác minh.')]
for priority,where,fact,rec in items:
    heading(where,2,d=review);para('Mức ưu tiên: '+priority+'. '+fact,review);para('Đề xuất: '+rec,review)
heading('3. Những điểm cần cải thiện ở chương 2',1,page=True,d=review)
items2=[
('Cao','Mục 2.1.10 chưa khớp mục lục','Mục lục ghi Danh sách UseCase tổng quan, nhưng nội dung ghi Thiết kế giao diện và chưa có nội dung theo sau. Danh sách UC đã có ở Bảng 2.4.','Nhóm cần chốt một tên mục; tránh lặp danh sách UC. Nếu giữ mục lục hiện tại, đưa nội dung tổng quan UC đúng mục; nếu muốn thiết kế UI, cập nhật mục lục và bổ sung nguồn thiết kế.'),
('Cao','Cơ sở dữ liệu còn mô tả là đề xuất','Mục 2.1.9 gọi Department, Position, ProjectMemberPosition và Role.Scope là đề xuất. DbContext hiện đã khai báo các entity tương ứng; có TaskCompletionHistory ngoài danh sách 28 bảng gốc.','Đối chiếu entity, OnModelCreating và SQL script để cập nhật ERD/từ điển. Không đồng nhất sự tồn tại của entity với xác nhận schema DB runtime; cần kiểm kê schema khi được cấp quyền.'),
('Cao','Kiến trúc dự kiến và cấu trúc thực','Mục 2.3.2 dự kiến Repositories, Migrations, store chung. Thực tế nhiều controller dùng trực tiếp DbContext; FE tổ chức features, service, hooks và context.','Mô tả đúng cấu trúc đã triển khai; chỉ giữ các thành phần chưa có trong phần hướng phát triển. CSDL được quản lý bằng script cần được mô tả theo bằng chứng thực tế.'),
('Cao','API và DTO chưa là hợp đồng đầy đủ','Các bảng REST chọn lọc chưa thể hiện rõ payload, envelope, phân trang, enum và quyền cho từng trường hợp. Có route phải phân biệt alias và route chính.','Đối chiếu từng dòng với Controllers/DTOs và OpenAPI runtime. Ví dụ Board GET theo project và move PATCH theo Task; danh bạ user GET /api/v1/users. Giữ tài liệu API tập trung theo mã nguồn.'),
('Cao','Chat cá nhân tổng và Chat dự án','Chương 2 đặc tả chat cá nhân, cặp người dùng duy nhất; FE hiện đặt Tin nhắn trong project và /chat chuyển về danh sách dự án.','Tách yêu cầu tương lai về DM toàn hệ thống khỏi phạm vi UI đã triển khai. Cập nhật UC, sơ đồ và quy tắc phòng theo quyết định chỉ phát triển Chat dự án.'),
('Cao','Workflow Bug và WIP','Đặc tả và giao diện phải thống nhất với BE: Bug bị kiểm tra theo cặp trạng thái; WIP chặn khi cột đích đã đạt giới hạn, không chỉ cảnh báo màu.','Bổ sung bảng trạng thái hợp lệ, điều kiện tiền/hậu và mã lỗi 409. Nếu đổi nghiệp vụ cho chuyển Bug tùy ý, cần quyết định riêng và BE thực hiện trước nghiệm thu.'),
('Vừa','126 Use Case và mức độ hoàn thành','Tổng UC là phạm vi thiết kế, không phải số chức năng đã kiểm thử. Chỉ một số UC có đặc tả chi tiết và bằng chứng UI/API.','Thêm ma trận UC → màn hình → endpoint → testcase → trạng thái. Phân biệt đã cài đặt, demo, thiếu dữ liệu, chưa kiểm thử; không đánh dấu đủ chỉ từ tên controller.'),
('Vừa','Yêu cầu phi chức năng chưa đo được','Bảng 2.3 nêu thời gian thực, nhiều người dùng và tương thích nhưng chưa có ngưỡng và môi trường nghiệm thu.','Định nghĩa tải đồng thời, độ trễ, kích thước dữ liệu, trình duyệt và chuẩn accessibility; gắn từng tiêu chí với phương pháp đo.'),
('Vừa','Kế hoạch phân công và Sprint','Các bảng ở 2.2 ghi dự kiến; chưa có căn cứ để xác nhận lịch sử đóng góp của từng thành viên.','Nhóm tự xác nhận phân công thực tế, thời gian và kết quả; đối chiếu commit hoặc biên bản. Không tự suy ra phần việc cá nhân từ mã nguồn.'),
('Vừa','Ký pháp biểu đồ và tham chiếu','Cần kiểm tra liên kết Actor–Use Case, kế thừa, tiền điều kiện và sơ đồ có còn mô tả công nghệ hoặc role cũ.','Rà đồng thời sơ đồ và đặc tả; liên kết Actor–Use Case thường là association, include/extend chỉ dùng khi có ngữ nghĩa tương ứng. Không thay hình gốc khi chưa được phép sửa nội dung.')]
for priority,where,fact,rec in items2:
    heading(where,2,d=review);para('Mức ưu tiên: '+priority+'. '+fact,review);para('Đề xuất: '+rec,review)
heading('4. Đối chiếu dữ liệu giao diện với phần mềm',1,page=True,d=review)
table(['Vị trí','Quan sát','Hướng hoàn thiện'],[
('Kanban banner','Sprint 14 và mục tiêu/ngày cố định khác Sprint thật.','Lấy Sprint theo dự án; thiếu thì ghi rõ chưa có Sprint phù hợp.'),
('Sprint KPI','Velocity 21.5 SP cố định tại SprintsPage.tsx.','Tính từ lịch sử hợp lệ hoặc ghi nhãn minh họa.'),
('Task drawer','PBI-142, IAM & Gateway Flow, Sprint 14 và thời gian cập nhật có fallback mẫu.','Dùng dữ liệu quan hệ thật; placeholder phải nêu thiếu dữ liệu.'),
('Backlog/Dashboard','DoD, capacity và một số metadata chưa đủ contract.','Giữ UI, ghi rõ trường thiếu và thống nhất DTO trước tích hợp.'),
('Bug','Workflow có ràng buộc; một số filter/SLA còn mẫu.','Không ghi phần mềm cho đổi mọi trạng thái hoặc SLA tự động nếu chưa xác minh.'),
('Upload','Báo cáo QA trước ghi lỗi 503 cho ảnh.','Test lại lưu trữ thực; không dùng kết quả test double để kết luận cloud đã hoạt động.')], 'Bảng 1. Các điểm cần phản ánh trung thực trong báo cáo',[3.0,6.0,6.2],review)
heading('5. Kiểm chứng và tài liệu đối chiếu',1,d=review)
para('Đã chạy lại: 221 unit/component đạt, 62 browser mock đạt, 3 test live authenticated đạt; build đạt; lint exit 0 với 9 cảnh báo. Đã đăng nhập và chụp 12 màn hình 1440 × 900 từ FE kết nối BE thật. Không chạy lại CRUD phá hủy, upload cloud, đổi mật khẩu hay benchmark; không sửa mã FE/BE.',review)
para('Nguồn đối chiếu gồm báo cáo gốc; package.json, router, API client và các feature FE; Program.cs, csproj, Controllers, DTOs và DbContext BE; các báo cáo PROJECT_WORKFLOW_REPORT.md, QA_API_UPDATE_REPORT.md, UI_FOLLOWUP_2026-11-01.md và BACKEND_PROGRESS.md. Hai tài liệu Scrum Guide và Kanban Guide chính thức được dùng để kiểm tra nguồn tham khảo; các đề xuất công nghệ dựa chủ yếu trên triển khai trong repository.',review)
para('Thứ tự ưu tiên chỉnh sửa sau khi nhóm duyệt: thống nhất vai trò và xác thực; chốt mục 2.1.10; cập nhật mô hình dữ liệu và phạm vi Chat; đối chiếu API/workflow; hoàn thiện tiêu chí phi chức năng và ma trận truy vết; cuối cùng rà diễn đạt, đánh số bảng/hình và cập nhật mục lục. Không cần sửa chương 1–2 chỉ để làm cho nội dung khớp các giá trị mẫu đang hiển thị trên FE.',review)
review.save(ROOT/'GopY_Chuong1_Chuong2.docx')

# Assert no existing text or table cell was lost or rewritten.
new=Document(OUT);current=[p.text for p in new.paragraphs]
from collections import Counter
assert not (Counter(original_text)-Counter(current)), 'Original paragraph text missing'
assert original_tables==[[[c.text for c in r.cells] for r in t.rows] for t in new.tables[:len(original_tables)]], 'Original table text changed'
(ROOT/'edit-audit.json').write_text(json.dumps({'original_paragraphs':len(original_text),'original_tables':len(original_tables),'original_text_retained':True,'heading_changes':heading_changes,'caption_changes':cap_changes,'screenshots':12},ensure_ascii=False,indent=2),encoding='utf8')
print('Created',OUT,'and separate review; original text and tables retained')
