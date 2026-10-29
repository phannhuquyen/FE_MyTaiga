import { expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProjectLayout from '../src/features/projects/ProjectLayout'
import { api } from '../src/services/api'
import { projectService } from '../src/features/projects/services/projectService'

function Child() { return <div>child project {projectService.getActiveProjectId()}</div> }
function mount(id: string) {
  render(<MemoryRouter initialEntries={[`/projects/${id}`]}><Routes>
    <Route path="/projects" element={<div>project list</div>} />
    <Route path="/projects/:projectId" element={<ProjectLayout />}><Route index element={<Child />} /></Route>
  </Routes></MemoryRouter>)
}
it('waits for project authorization before rendering child and publishes correct project', async () => {
  projectService.setActiveProjectId(99)
  let resolve!: (value: never) => void
  vi.spyOn(api.projects, 'get').mockReturnValue(new Promise(r => { resolve = r }))
  mount('1')
  expect(screen.queryByText(/child project/)).toBeNull()
  resolve({ success: true, data: { projectId: 1 } } as never)
  await waitFor(() => expect(screen.getByText('child project 1')).toBeTruthy())
})
it.each([403, 404, 500])('withholds project content on HTTP %i', async status => {
  vi.spyOn(api.projects, 'get').mockRejectedValue({ response: { status } })
  mount('1')
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
  expect(screen.queryByText(/child project/)).toBeNull()
})
it.each(['1garbage', '-1', '0'])('rejects malformed project id %s', id => {
  const get = vi.spyOn(api.projects, 'get')
  mount(id)
  expect(screen.getByText('project list')).toBeTruthy()
  expect(get).not.toHaveBeenCalled()
})
