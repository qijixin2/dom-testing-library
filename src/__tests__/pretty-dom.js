import {prettyDOM, logDOM} from '../pretty-dom'
import {render, renderIntoDocument} from './helpers/test-utils'

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})

test('prettyDOM prints out the given DOM element tree', () => {
  const {container} = render('<div>Hello World!</div>')
  expect(prettyDOM(container)).toMatchInlineSnapshot(`
    "<div>
      <div>
        Hello World!
      </div>
    </div>"
  `)
})

test('prettyDOM supports truncating the output length', () => {
  const {container} = render('<div>Hello World!</div>')
  expect(prettyDOM(container, 5)).toMatch(/\.\.\./)
})

test('prettyDOM defaults to document.body', () => {
  const defaultInlineSnapshot = `
  "<body>
    <div>
      Hello World!
    </div>
  </body>"
`
  renderIntoDocument('<div>Hello World!</div>')
  expect(prettyDOM()).toMatchInlineSnapshot(defaultInlineSnapshot)
  expect(prettyDOM(null)).toMatchInlineSnapshot(defaultInlineSnapshot)
})

test('prettyDOM supports receiving the document element', () => {
  expect(prettyDOM(document)).toMatchInlineSnapshot(`
    "<html>
      <head />
      <body />
    </html>"
  `)
})

test('logDOM logs prettyDOM to the console', () => {
  const {container} = render('<div>Hello World!</div>')
  logDOM(container)
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log.mock.calls[0][0]).toMatchInlineSnapshot(`
    "<div>
      <div>
        Hello World!
      </div>
    </div>"
  `)
})

describe('prettyDOM fails with first parameter without outerHTML field', () => {
  test('with array', () => {
    expect(() => prettyDOM(['outerHTML'])).toThrowErrorMatchingInlineSnapshot(
      `"Expected an element or document but got Array"`,
    )
  })
  test('with number', () => {
    expect(() => prettyDOM(1)).toThrowErrorMatchingInlineSnapshot(
      `"Expected an element or document but got number"`,
    )
  })
  test('with object', () => {
    expect(() => prettyDOM({})).toThrowErrorMatchingInlineSnapshot(
      `"Expected an element or document but got Object"`,
    )
  })
})

/* eslint no-console:0 */
