import fs from 'node:fs'

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'))
function cases(report) {
  const result = []
  function visit(suites) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        const test = spec.tests[0]
        const latest = test.results.at(-1)
        const errorText = [latest?.error?.message, ...(latest?.errors || []).map(error => error.message)].join(' ').replace(/\x1b\[[0-9;]*m/g, '')
        result.push({ title: spec.title, status: latest?.status || 'not-run', http503: /503/.test(errorText) })
      }
      visit(suite.suites)
    }
  }
  visit(report.suites)
  return result
}
const unit = read('test-results/update-unit-results.json')
const mock = cases(read('test-results/browser-results.json'))
const live = new Map(cases(read('test-results/live-browser-results.json')).map(item => [item.title, item]))
for (const item of cases(read('test-results/update-final-live-results.json'))) live.set(item.title, item)
const liveCases = [...live.values()].map(item => ({ ...item, result: item.status === 'passed' ? 'PASS' : /task image|Chat image and reply|Avatar UI/.test(item.title) && item.status === 'failed' && item.http503 ? 'BLOCKED' : 'FAIL' }))
const result = {
  generatedAt: new Date().toISOString(), overall: 'BLOCKED',
  counting: 'Latest result per live scenario; combines full run and focused rerun. Cloud upload runner failures are classified BLOCKED after observed HTTP 503. Historical failed attempts are retained in logs, not added to latest counts.',
  unit: { total: unit.numTotalTests, pass: unit.numPassedTests, fail: unit.numFailedTests },
  mock: { total: mock.length, pass: mock.filter(item => item.status === 'passed').length, fail: mock.filter(item => item.status !== 'passed').length },
  live: { total: liveCases.length, pass: liveCases.filter(item => item.result === 'PASS').length, fail: liveCases.filter(item => item.result === 'FAIL').length, blocked: liveCases.filter(item => item.result === 'BLOCKED').length, cases: liveCases },
}
fs.writeFileSync('docs/QA_API_UPDATE_RESULTS.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ unit: result.unit, mock: result.mock, live: { total: result.live.total, pass: result.live.pass, fail: result.live.fail, blocked: result.live.blocked } }))
