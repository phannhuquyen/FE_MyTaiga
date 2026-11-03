# Cloudinary image presentation integration

## Scope

Branch: `fix/quyenpn-newUI-animation`. Backend inspected read-only at commit
`8fccccb`, including UsersController, AttachmentsController, ChatController and
FRONTEND_RESPONSE_CONTRACT.md. No backend configuration or secrets were accessed.

The existing multipart avatar upload endpoint and response envelope are unchanged.
The FE now preserves optional image URL fields supplied by the BE. The shared
Avatar component uses initials when the URL is absent or the image fails, retaining
the existing avatar containers and layout. Changing the URL retries image delivery.

## Updated surfaces

- Profile image and immediate propagation to the workspace/admin sidebar.
- Members list, member details, candidate picker and department member avatars.
- Kanban cards, task deletion confirmation, task assignee updates and comment authors.
- Dashboard task assignee and activity timeline.
- Chat direct conversations, message senders and member selection.
- Notifications, notification bell and activity page actors.

## Private images

Chat attachments preserve room/message IDs. Opening a preview retrieves the exact
message again with `before=messageId+1&limit=1`, finds the attachment by ID and uses
fresh preview/download links. An open preview refreshes metadata every nine minutes
(BE signed URLs expire after ten minutes). Requests are cancelled logically on
close/change so late results cannot replace another attachment. Missing/deleted
attachments and failed image delivery show an error instead of a stale image.

Task attachment preview reads current metadata on each open, uses the supplied
Cloudinary preview URL, and keeps the existing authenticated blob preview for
non-cloud files. Cloudinary keys remain exclusively on the backend.

## Coverage and limitations

Automated component tests cover initials, failed avatar delivery, URL replacement,
member adapter mapping, fresh chat preview links and unavailable attachments.
Existing suites cover mocked FE service and route regressions.

Live Cloudinary upload, real CDN image delivery and long-running link expiry have
not been verified in this change. Legacy avatars requiring Bearer authentication
fall back to initials until BE migration provides public image URLs. No image URL
is fabricated for fields absent from BE responses; project summary member avatars
remain their existing placeholder because that adapter has no real member image data.
Non-image attachment preview behavior is outside this change.

## Executed verification

- `npm run build`: PASS (TypeScript and production bundle).
- `npm test`: PASS, 225/225 tests; focused image suite: 5/5 PASS.
- `npm run test:e2e`: PASS, 62/62 mocked Playwright scenarios, no flaky tests.
- `npm run lint`: no errors; repository warnings remain, including an unrelated
  unused variable under the existing report artifacts directory.
- `git diff --check`: PASS.

Files added: `src/components/ui/Avatar.tsx`,
`src/features/chat/services/attachmentService.ts`,
`tests/cloudinary-images.test.tsx`, and this report. Existing feature types,
adapters and avatar consumers listed above were updated; optional API response
fields remain centralized in `src/services/api.ts`. Existing untracked report
artifacts were preserved.
