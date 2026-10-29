import fs from 'node:fs'
import ts from 'typescript'
import { expect, it } from 'vitest'
import { api, httpClient } from '../src/services/api'

const source = ts.createSourceFile('api.ts', fs.readFileSync('src/services/api.ts', 'utf8'), ts.ScriptTarget.Latest, true)
const schemaPath = process.env.QA_OPENAPI_PATH || 'D:/personal/be_taiga/BE-MyTaiga/docs/openapi.json'
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const normalize = (p: string) => p.replace(/\{[^}]+\}/g, '{}')
const cases: { group: string; name: string; args: unknown[] }[] = []
function argument(name: string): unknown {
  if (name === 'file') return new File(['QA'], 'qa.png', { type: 'image/png' })
  if (name === 'files') return [new File(['QA'], 'qa.png', { type: 'image/png' })]
  if (name === 'fileName') return 'qa.png'
  if (name === 'role') return 'USER'
  if (name === 'values') return { MAX_FILE_SIZE_MB: '25' }
  if (name === 'query') return { projectId: 1, page: 2, pageSize: 5, keyword: 'qa' }
  if (name === 'payload') return { content: 'QA', title: 'QA', epicId: 1, pbiIds: [1], wipLimit: 5 }
  return 1
}
function visit(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'api' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    for (const group of node.initializer.properties) {
      if (!ts.isPropertyAssignment(group) || !ts.isObjectLiteralExpression(group.initializer)) continue
      for (const fn of group.initializer.properties) {
        if (!ts.isPropertyAssignment(fn) || !ts.isArrowFunction(fn.initializer)) continue
        cases.push({ group: group.name.getText(source), name: fn.name.getText(source), args: fn.initializer.parameters.map(p => argument(p.name.getText(source))) })
      }
    }
  }
  ts.forEachChild(node, visit)
}
visit(source)
it('discovers every API wrapper for transport contract checks', () => expect(cases.length).toBe(126))
for (const scenario of cases) {
  it(`mock transport contract: ${scenario.group}.${scenario.name}`, async () => {
    let calls = 0
    httpClient.defaults.adapter = async config => {
      calls++
      const method = config.method!.toLowerCase()
      const url = `/api/v1${config.url}`
      expect(Object.entries(schema.paths).some(([p, methods]) => {
        const expression = new RegExp(`^${normalize(p).replaceAll('{}', '[^/]+')}$`)
        return expression.test(url) && !!(methods as Record<string, unknown>)[method]
      }), `${method} ${url} must exist in checked-in OpenAPI`).toBe(true)
      return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, message: 'QA', data: {} } }
    }
    const group = (api as unknown as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>)[scenario.group]
    await group[scenario.name](...scenario.args)
    expect(calls).toBe(1)
  })
}
