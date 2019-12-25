import {prettyDOM} from '../pretty-dom'
import {render} from './helpers/test-utils'

test('it prints out the given DOM element tree', () => {
  const {container} = render('<div>Hello World!</div>')
  expect(prettyDOM(container)).toMatchSnapshot()
})

test('it supports truncating the output length', () => {
  const {container} = render('<div>Hello World!</div>')
  expect(prettyDOM(container, 5)).toMatch(/\.\.\./)
})
