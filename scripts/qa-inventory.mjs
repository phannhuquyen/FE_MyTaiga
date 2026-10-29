import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const beSchema = process.env.QA_OPENAPI_PATH || 'D:/personal/be_taiga/BE-MyTaiga/docs/openapi.json'
const schema = JSON.parse(fs.readFileSync(beSchema, 'utf8'))
const sourceText = fs.readFileSync('src/services/api.ts', 'utf8')
const source = ts.createSourceFile('api.ts', sourceText, ts.ScriptTarget.Latest, true)
const files = fs.readdirSync('src', { recursive: true }).filter(f => /\.(ts|tsx)$/.test(f)).map(f => ({ path: `src/${f.replaceAll('\\', '/')}`, text: fs.readFileSync(path.join('src', f), 'utf8') }))
const normalize = p => p.replace(/\$\{[^}]+\}/g, '{}').replace(/\{[^}]+\}/g, '{}')
const specs = Object.entries(schema.paths).flatMap(([url, methods]) => Object.keys(methods).filter(m => ['get', 'post', 'put', 'patch', 'delete'].includes(m)).map(method => ({ method: method.toUpperCase(), url })))
const endpoints = []
const dtos = []
function visit(node) {
  if (ts.isInterfaceDeclaration(node)) dtos.push({ name: node.name.text, fields: node.members.map(m => m.getText(source).replace(/\s+/g, ' ')) })
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(source) === 'httpClient') {
    const method = node.expression.name.text.toUpperCase()
    const arg = node.arguments[0]
    const url = arg.getText(source).slice(1, -1)
    let ancestor = node.parent
    while (ancestor && !ts.isPropertyAssignment(ancestor)) ancestor = ancestor.parent
    const functionName = ancestor?.name.getText(source)
    let group = ancestor?.parent?.parent
    const groupName = group && ts.isPropertyAssignment(group) ? group.name.getText(source) : ''
    const name = `${groupName}.${functionName}`
    const consumers = files.filter(f => f.path !== 'src/services/api.ts' && f.text.includes(`api.${name}`)).map(f => f.path)
    endpoints.push({ name, method, url: `/api/v1${url}`, contract: specs.some(s => s.method === method && normalize(s.url) === normalize(`/api/v1${url}`)), line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1, responseType: node.typeArguments?.map(t => t.getText(source)).join('') || 'Blob', consumers })
  }
  ts.forEachChild(node, visit)
}
visit(source)
const unique = [...new Map(endpoints.map(e => [`${e.method} ${normalize(e.url)}`, e])).values()]
const live = []
for (const e of unique.filter(e => e.method === 'GET')) {
  const url = e.url.replace(/\$\{[^}]+\}/g, '1')
  try {
    const response = await fetch(`http://localhost:5141${url}`, { signal: AbortSignal.timeout(5000), redirect: 'manual' })
    live.push({ method: 'GET', url, status: response.status, scope: 'anonymous authorization boundary only', result: response.status === 401 ? 'PASS' : 'REVIEW' })
    await response.body?.cancel()
  } catch { live.push({ method: 'GET', url, status: null, result: 'BLOCKED' }) }
}
const lines = ['# API endpoint and response DTO inventory', '', `Generated ${new Date().toISOString()}. ${unique.length} unique endpoint definitions; ${specs.length} checked-in OpenAPI operations. This is not runtime data coverage.`, '', '| FE method | HTTP | URL | Contract path | Response type | Consumers | Live anonymous |', '|---|---|---|---|---|---|---|']
for (const e of endpoints) {
  const l = live.find(l => normalize(l.url) === normalize(e.url.replace(/\$\{[^}]+\}/g, '1')) && e.method === 'GET')
  lines.push(`| ${e.name} | ${e.method} | ${e.url} | ${e.contract ? 'MATCH' : 'MISMATCH'} | ${e.responseType.replaceAll('|', '\\|')} | ${e.consumers.join(', ') || 'No direct consumer found'} | ${l ? `${l.status ?? 'unreachable'}; ${l.result} auth boundary only` : 'NOT TESTED'} |`)
}
lines.push('', '## Declared response/request fields', '', 'Declared FE fields below are an inventory, not proof that the server supplied them. Nullable fields, envelope shapes and UI mappings still require scenario verification.')
for (const d of dtos) lines.push('', `### ${d.name}`, '', ...d.fields.map(f => `- \`${f}\``))
fs.writeFileSync('docs/QA_API_INVENTORY.md', lines.join('\n') + '\n')
fs.writeFileSync('docs/QA_API_EVIDENCE.json', JSON.stringify({ generatedAt: new Date().toISOString(), endpoints, live }, null, 2) + '\n')
console.log(JSON.stringify({ uniqueDefinitions: unique.length, schemaOperations: specs.length, mismatches: endpoints.filter(e => !e.contract).length, anonymousGets: live.length, authorizationPass: live.filter(e => e.result === 'PASS').length, blocked: live.filter(e => e.result === 'BLOCKED').length, review: live.filter(e => e.result === 'REVIEW').length }))
