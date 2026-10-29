import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { httpClient } from '../src/services/api'

const blockNetwork = async () => { throw new Error('Unmocked network disabled in unit tests') }
httpClient.defaults.adapter = blockNetwork

beforeEach(() => {
  httpClient.defaults.adapter = blockNetwork
  localStorage.clear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(cleanup)
