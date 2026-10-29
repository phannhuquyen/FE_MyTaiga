# Coverage delta API/UI — 28/10/2026

| Route / chức năng | API | Trường tiêu thụ | Scenario | Evidence | Status | Bước tiếp |
|---|---|---|---|---|---|---|
| Members | GET /users | data.items[].userId/fullName/email/avatarUrl; total/page/pageSize | USER lookup, empty, trim, pagination, 400/401, privacy | API+RUNTIME | PASS | Hơn100 tài khoản chưa test runtime |
| Members | POST /projects/{id}/members | userId; data member | Chọn user thật → thêm → refresh, duplicate | API+RUNTIME+TEST | PASS | User5 qua modal;201; reload MEMBER; duplicate disabled |
| Project Chat | GET /chat/rooms | projectId, roomType, participantsCount, lastMessage | Không lẫn phòng project/PRIVATE; legacy redirect | TEST+RUNTIME | PARTIAL | Mock isolation PASS, real create/load PASS; chưa dual-user/cross-project live đầy đủ |
| Project Chat | POST rooms/messages; PUT messages | sender.*, replyToMessageId, content | Create/send/edit/reply/reload | API+RUNTIME+TEST | PASS | PUT200 trước reload; quyền sửa khác tác giả chưa test delta |
| Task/Board | POST/GET tasks; GET board | assignee.*, epic.*, tags, storyPoints, updatedAtFormatted | Create/read dữ liệu mới | API+RUNTIME | PASS | Happy path fields đã assert; mọi optional/PUT field chưa đủ |
| Epic | POST/GET epics | color | Roundtrip #RRGGBB | API+RUNTIME | PASS | Chưa mọi invalid color/UI picker |
| Comment | POST/GET comments | author.fullName, isEditable | Tác giả thật và quyền tác giả | API+RUNTIME | PASS | Cross-user edit còn NOT TESTED delta |
| Attachment | POST/GET attachments | originalFileName, mimeType, fileSizeBytes, previewUrl/downloadUrl | Ảnh chỉ định → metadata → delivery | API | BLOCKED | Upload503; downstream chưa chạy |
| Avatar | PUT /users/me/avatar; GET /users/me | avatar URL tuyệt đối | Upload → reload → img decode | API+RUNTIME | BLOCKED | Upload503; demo false success có regression/sửa riêng |
| Chat image | POST messages multipart | attachments[].url/previewUrl/downloadUrl | Ảnh chỉ định → preview/download | API+TEST | BLOCKED | Upload503; mapper/preview UI dùng mock PASS, cloud chưa xác minh |
| Notifications | GET notifications | actor.*, actorUnknown, message/reference aliases | Đối chiếu shape/aliases | API+RUNTIME | PARTIAL | Shape checks PASS, chưa mọi navigation/actor semantics |
| Activity | GET activity-logs | userName; DTO fields còn lại | Populated response và shape sweep | API+RUNTIME | PARTIAL | Chưa kiểm changes whitelist/giá trị mọi action |
| Realtime | message.new / notification.new | messageId/actor fields | Upsert/reconnect/multiple contexts | STATIC+TEST | PARTIAL | Mapper/dedup regression PASS; live dual-context/reconnect NOT TESTED |
| Media migration | POST admin/media/migrate-images | operational | Ngoài phạm vi an toàn | STATIC | BLOCKED | Không được phép chạy migration |
