import fs from 'node:fs'
import ts from 'typescript'

const password = process.env.QA_TEST_PASSWORD
if (!password) throw new Error('QA_TEST_PASSWORD must be supplied without logging it')
const host = process.env.QA_API_URL || 'http://localhost:5141'
const inventory = JSON.parse(fs.readFileSync('docs/QA_API_EVIDENCE.json', 'utf8'))
const source = ts.createSourceFile('api.ts', fs.readFileSync('src/services/api.ts', 'utf8'), ts.ScriptTarget.Latest, true)
const interfaces = new Map()
const aliases = new Map()
ts.forEachChild(source, n => { if (ts.isInterfaceDeclaration(n)) interfaces.set(n.name.text, n) })
ts.forEachChild(source, n => { if (ts.isTypeAliasDeclaration(n)) aliases.set(n.name.text, n.type) })
function validate(type, value, field = '$', generics = {}, depth = 0) {
  if (!type || depth > 12 || type.kind === ts.SyntaxKind.UnknownKeyword || type.kind === ts.SyntaxKind.AnyKeyword) return []
  const fail = () => [`${field}: expected ${typeof type.getText === 'function' ? type.getText(source) : 'object'}`]
  if (ts.isUnionTypeNode(type)) return type.types.some(t => validate(t, value, field, generics, depth + 1).length === 0) ? [] : fail()
  if (ts.isLiteralTypeNode(type)) {
    const literal = type.literal.getText(source)
    const expected = literal === 'null' ? null : literal === 'true' ? true : literal === 'false' ? false : ts.isStringLiteral(type.literal) ? type.literal.text : Number(literal)
    return value === expected ? [] : fail()
  }
  const primitive = new Map([[ts.SyntaxKind.StringKeyword, 'string'], [ts.SyntaxKind.NumberKeyword, 'number'], [ts.SyntaxKind.BooleanKeyword, 'boolean']])
  if (primitive.has(type.kind)) return typeof value === primitive.get(type.kind) ? [] : fail()
  if (ts.isArrayTypeNode(type)) return Array.isArray(value) ? value.slice(0, 30).flatMap((v, i) => validate(type.elementType, v, `${field}[${i}]`, generics, depth + 1)) : fail()
  let members
  if (ts.isTypeLiteralNode(type)) members = type.members
  if (ts.isTypeReferenceNode(type)) {
    const name = type.typeName.getText(source)
    if (generics[name]) return validate(generics[name], value, field, {}, depth + 1)
    if (name === 'Record') return value && typeof value === 'object' ? [] : fail()
    const declaration = interfaces.get(name)
    if (!declaration) return []
    const next = { ...generics }
    declaration.typeParameters?.forEach((p, i) => { next[p.name.text] = type.typeArguments?.[i] })
    members = declaration.members
    generics = next
  }
  if (members) {
    if (value === null || typeof value !== 'object') return fail()
    return members.flatMap(p => {
      const key = p.name?.getText(source)
      if (!key) return []
      if (!(key in value)) return p.questionToken ? [] : [`${field}.${key}: missing required field`]
      return validate(p.type, value[key], `${field}.${key}`, generics, depth + 1)
    })
  }
  return []
}
function checkResponse(e, data) {
  const match = e.responseType.match(/^ApiResponse<(.*)>$/)
  if (!match) return []
  const name = match[1]
  if (aliases.has(name)) return validate(aliases.get(name), data.data, '$.data')
  const declaration = interfaces.get(name)
  if (declaration) return validate({ ...declaration, kind: ts.SyntaxKind.TypeLiteral, members: declaration.members }, data.data, '$.data')
  const paged = name.match(/^PaginatedData<(.*)>$/)
  if (paged) {
    const errors = ['items', 'total', 'page', 'pageSize'].filter(k => !(k in (data.data || {}))).map(k => `$.data.${k}: missing required field`)
    if (data.data && !Array.isArray(data.data.items)) errors.push('$.data.items: expected array')
    const item = interfaces.get(paged[1])
    if (item && Array.isArray(data.data?.items)) data.data.items.slice(0, 30).forEach((v, i) => errors.push(...validate({ ...item, kind: ts.SyntaxKind.TypeLiteral, members: item.members }, v, `$.data.items[${i}]`)))
    return errors
  }
  if (name.endsWith('[]')) {
    if (!Array.isArray(data.data)) return ['$.data: expected array']
    const item = interfaces.get(name.slice(0, -2))
    return item ? data.data.slice(0, 30).flatMap((v, i) => validate({ ...item, kind: ts.SyntaxKind.TypeLiteral, members: item.members }, v, `$.data[${i}]`)) : []
  }
  return []
}
const results = []
const accounts = []
const dataset = fs.existsSync('docs/QA_TEST_DATASET.json') ? JSON.parse(fs.readFileSync('docs/QA_TEST_DATASET.json', 'utf8')) : null
for (const [account, email] of [['admin', 'admin@scrumban.local'], ['user1', 'user1@gmail.com'], ['user2', 'user2@gmail.com']]) {
  const login = await fetch(`${host}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  if (login.status !== 200) { results.push({ account, name: 'auth.login', status: login.status, result: 'FAIL' }); continue }
  const loginBody = await login.json()
  const token = loginBody.data?.accessToken
  if (!token) { results.push({ account, name: 'auth.login', result: 'FAIL', reason: 'missing token' }); continue }
  results.push({ account, name: 'auth.login', status: 200, result: 'PASS' })
  const headers = { Authorization: `Bearer ${token}` }
  const ids = { userId: loginBody.data.user.userId, projectId: null, taskId: null, epicId: null, sprintId: null, pbiId: null, bugId: null, roomId: null, attachmentId: null, commentId: null, fileName: null, columnId: null }
  const projectResponse = await fetch(`${host}/api/v1/projects?pageSize=100`, { headers })
  const projects = projectResponse.ok ? (await projectResponse.json()).data?.items || [] : []
  ids.projectId = projects[0]?.projectId ?? null
  if (dataset && projects.some(p => p.projectId === dataset.projectId)) {
    ids.projectId = dataset.projectId
    for (const key of Object.keys(ids)) if (key !== 'userId' && dataset.created?.[key]) ids[key] = dataset.created[key]
  }
  accounts.push({ account, systemRole: loginBody.data.user.systemRole, projectCount: projects.length, projectRoles: [...new Set(projects.map(p => p.projectRole))] })
  const reads = inventory.endpoints.filter(e => e.method === 'GET')
  for (const e of reads) {
    const placeholders = [...e.url.matchAll(/\$\{([^}]+)\}/g)].map(m => m[1])
    if (placeholders.some(p => !ids[p])) { results.push({ account, name: e.name, result: 'BLOCKED', reason: 'No available scoped test record', fields: e.responseType }); continue }
    let url = e.url.replace(/\$\{([^}]+)\}/g, (_, key) => String(ids[key]))
    if (e.name === 'productBacklog.list' || e.name === 'sprints.list') {
      if (!ids.projectId) { results.push({ account, name: e.name, result: 'BLOCKED', reason: 'No project' }); continue }
      url += `?projectId=${ids.projectId}`
    }
    const response = await fetch(`${host}${url}`, { headers, signal: AbortSignal.timeout(10000) })
    const managerOnly = e.name.startsWith('flowMetrics.') || ['tasks.getOverdue', 'tasks.getDeadlineAlerts'].includes(e.name)
    if (managerOnly && account === 'user2' && projects[0]?.projectRole === 'MEMBER') {
      results.push({ account, name: e.name, status: response.status, result: response.status === 403 ? 'PASS' : 'FAIL', scope: 'MEMBER denied manager-only read; verified controller requirement' })
      await response.body?.cancel(); continue
    }
    if (e.name.startsWith('admin.') && account !== 'admin') {
      results.push({ account, name: e.name, status: response.status, result: response.status === 403 ? 'PASS' : 'FAIL', scope: 'non-admin denial' })
      await response.body?.cancel(); continue
    }
    if (response.status !== 200) { results.push({ account, name: e.name, status: response.status, result: 'FAIL', scope: 'read-only' }); await response.body?.cancel(); continue }
    if (e.responseType === 'Blob') {
      const bytes = (await response.arrayBuffer()).byteLength
      results.push({ account, name: e.name, status: 200, result: bytes > 0 ? 'PASS' : 'FAIL', scope: 'authenticated binary read', byteLength: bytes })
      continue
    }
    const body = await response.json()
    const errors = checkResponse(e, body)
    if (body.success !== true) errors.push('$.success: expected true')
    results.push({ account, name: e.name, status: 200, result: errors.length ? 'FAIL' : 'PASS', scope: 'read-only response shape, not UI workflow', errors })
    const items = body.data?.items || (Array.isArray(body.data) ? body.data : [])
    const first = items[0]
    if (first) for (const key of Object.keys(ids)) if (!ids[key] && first[key] && key !== 'userId' && key !== 'projectId') ids[key] = first[key]
    if (e.name === 'chat.listRooms') ids.roomId = first?.chatRoomId ?? null
    if (e.name === 'chat.listMessages') ids.attachmentId = first?.attachments?.[0]?.messageAttachmentId ?? null
    if (e.name === 'board.get' && !ids.taskId) ids.taskId = body.data.columns?.flatMap(c => c.tasks || [])[0]?.taskId ?? null
  }
}
const output = { generatedAt: new Date().toISOString(), scope: 'Live authenticated read-only; credentials and response bodies excluded', accounts, results }
fs.writeFileSync('docs/QA_LIVE_API_EVIDENCE.json', JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ accounts, pass: results.filter(r => r.result === 'PASS').length, fail: results.filter(r => r.result === 'FAIL').length, blocked: results.filter(r => r.result === 'BLOCKED').length, failures: results.filter(r => r.result === 'FAIL') }))
