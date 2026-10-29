import fs from 'node:fs'

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'))
function cases(report) {
  const result = []
  const visit = suites => {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) result.push({ title: spec.title, status: spec.tests[0].results.at(-1)?.status || 'not-run' })
      visit(suite.suites)
    }
  }
  visit(report.suites)
  return result
}
const unit = read('test-results/project-workflow-unit.json')
const mock = cases(read('test-results/browser-results.json'))
const live = new Map()
for (const path of ['test-results/project-workflow-browser.json', 'test-results/project-workflow-planning-browser.json', 'test-results/project-workflow-column-browser.json', 'test-results/project-workflow-assignee-browser.json']) {
  for (const item of cases(read(path))) live.set(item.title, item)
}
const count = items => ({ total: items.length, pass: items.filter(item => item.status === 'passed').length, fail: items.filter(item => item.status !== 'passed').length })
const result = {
  generatedAt: new Date().toISOString(),
  scope: 'Executed Project So 1 FE create/update/read/comment/planning and independent user2 visibility; not an application-wide signoff',
  projectId: 1,
  unit: { total: unit.numTotalTests, pass: unit.numPassedTests, fail: unit.numFailedTests },
  mock: count(mock), live: { ...count([...live.values()]), cases: [...live.values()] },
  counting: 'Latest per scenario; full live run 9 passed/1 locator failure, corrected focused planning test passed; column/deadline and Bug assignment add two separate scenarios. No assertion removed or weakened.',
}
fs.writeFileSync('docs/PROJECT_WORKFLOW_TEST_RESULTS.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ unit: result.unit, mock: result.mock, live: count([...live.values()]) }))
