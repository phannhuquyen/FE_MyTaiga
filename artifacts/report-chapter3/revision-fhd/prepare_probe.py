from pathlib import Path
import re
p=Path(__file__).resolve().parent
s=Path('tests/live/api-update.spec.ts').read_text(encoding='utf8')
helpers=s[:s.index("test('delta directory")]
helpers=re.sub(r'test.afterEach[\s\S]*?(?=async function login)', '', helpers)
chunks=re.split(r'(?=\ntest\()',s)
chosen=[c for c in chunks[1:] if any(t in c.splitlines()[1] for t in ['delta task image:','delta Chat image and reply:','delta Avatar UI:'])]
(p/'cloudinary.spec.ts').write_text(helpers+'\n'.join(chosen),encoding='utf8')
(p/'playwright.config.ts').write_text("""import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'cloudinary.spec.ts',timeout:120000,workers:1,retries:0,
reporter:[['list'],['json',{outputFile:'artifacts/report-chapter3/revision-fhd/cloudinary-results.json'}]],
outputDir:'test-output',use:{baseURL:'http://localhost:5173',browserName:'chromium',viewport:{width:1920,height:1080},trace:'off',screenshot:'off',video:'off'}});
""",encoding='utf8')
assert len(chosen)==3
print('Prepared three focused upload tests; no historical reports overwritten')
