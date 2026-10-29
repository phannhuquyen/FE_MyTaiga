import fs from 'node:fs'

const unit = JSON.parse(fs.readFileSync('test-results/unit-results.json', 'utf8'))
const mock = JSON.parse(fs.readFileSync('test-results/browser-results.json', 'utf8'))
const live = JSON.parse(fs.readFileSync('test-results/live-browser-results.json', 'utf8'))
const api = JSON.parse(fs.readFileSync('docs/QA_LIVE_API_EVIDENCE.json', 'utf8'))
const dataset = JSON.parse(fs.readFileSync('docs/QA_TEST_DATASET.json', 'utf8'))
const inventory = JSON.parse(fs.readFileSync('docs/QA_API_EVIDENCE.json', 'utf8'))
function browserCases(report) {
  const cases = []
  function visit(suite) {
    for (const spec of suite.specs || []) for (const test of spec.tests || []) cases.push({ file: spec.file, scenario: spec.title, status: test.status, attempts: test.results.length })
    for (const child of suite.suites || []) visit(child)
  }
  for (const suite of report.suites) visit(suite)
  return cases
}
const unitCases = unit.testResults.flatMap(file => file.assertionResults.map(test => ({ file: file.name.replaceAll('\\', '/').replace(/^.*\/tests\//, 'tests/'), scenario: test.fullName, status: test.status })))
const observed = new Set(api.results.filter(r => r.result === 'PASS').map(r => r.name))
for (const e of dataset.evidence) if (e.result === 'PASS') observed.add(e.operation.replace(/ \(file\)$/, ''))
const summary = {
  generatedAt: new Date().toISOString(),
  automated: { unit: { total: unit.numTotalTests, passed: unit.numPassedTests, failed: unit.numFailedTests }, mockBrowser: mock.stats, liveBrowser: live.stats },
  liveReads: { passed: api.results.filter(r => r.result === 'PASS').length, failed: api.results.filter(r => r.result === 'FAIL').length, blocked: api.results.filter(r => r.result === 'BLOCKED').length },
  endpointInventory: { uniqueDefinitions: 124, observedWrapperNames: observed.size, caveat: 'Names in latest read sweep and latest dataset run, including expected denial. Earlier creation and UI calls are not exhaustively logged. Unobserved means absent from these logs, not necessarily never executed. Observation is not full business coverage.', unobserved: inventory.endpoints.filter(e => !observed.has(e.name)).map(e => ({ name: e.name, method: e.method, url: e.url })) },
  cases: { unit: unitCases, mockBrowser: browserCases(mock), liveBrowser: browserCases(live) },
}
fs.writeFileSync('docs/QA_TEST_RESULTS.json', JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify({ automated: summary.automated, liveReads: summary.liveReads, observedWrapperNames: observed.size, unobserved: summary.endpointInventory.unobserved.length }))
