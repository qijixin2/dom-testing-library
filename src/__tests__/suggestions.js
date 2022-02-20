import {configure} from '../config'
import {screen, getSuggestedQuery} from '..'
import {renderIntoDocument, render} from './helpers/test-utils'

beforeAll(() => {
  configure({throwSuggestions: true})
})

afterEach(() => {
  configure({testIdAttribute: 'data-testid'})
})

afterAll(() => {
  configure({throwSuggestions: false})
})

test('does not suggest for nested inline style', () => {
  renderIntoDocument(
    `<div data-testid="style"><style>.hsuHs{margin:auto}.wFncld{margin-top:3px;color:#9AA0A6;height:20px;width:20px}</style></div>`,
  )

  expect(() => screen.getByTestId('style')).not.toThrow()
})

test('does not suggest for inline script, style', () => {
  renderIntoDocument(
    `<script data-testid="script">alert('hello')</script><style data-testid="style">.hsuHs{margin:auto}.wFncld{margin-top:3px;color:#9AA0A6;height:20px;width:20px}</style>`,
  )

  expect(() => screen.getByTestId('script')).not.toThrow()
  expect(() => screen.getByTestId('style')).not.toThrow()
})

test('respects ignores', () => {
  renderIntoDocument(`<my-thing>foo</my-thing>`)

  expect(() =>
    screen.queryByText('foo', {ignore: 'my-thing'}),
  ).not.toThrowError()
})

test('does not suggest query that would give a different element', () => {
  renderIntoDocument(`
  <div data-testid="foo"><img src="foo" /></div>
  <div data-testid="bar"><a href="/foo"><div role="figure"><img src="foo" /></div></a></div>
  <a data-testid="baz"><h1>link text</h1></a>
  `)

  expect(() => screen.getByTestId('foo')).not.toThrowError()
  expect(() => screen.getByTestId('bar')).not.toThrowError()
  expect(() => screen.getByTestId('baz')).not.toThrowError()
})

test('does not suggest when using getByRole', () => {
  renderIntoDocument(`<button data-testid="foo">submit</button>`)

  expect(() => screen.getByRole('button', {name: /submit/i})).not.toThrowError()
})

test('should not suggest when nothing available', () => {
  renderIntoDocument(`<span data-testid="foo" />`)

  expect(() => screen.queryByTestId('foo')).not.toThrowError()
})

test(`should not suggest if the suggestion would give different results`, () => {
  renderIntoDocument(`
    <input type="text" data-testid="foo" /><span data-testid="foo" />
  `)

  expect(() =>
    screen.getAllByTestId('foo', {suggest: false}),
  ).not.toThrowError()
})

test('should suggest by label over title', () => {
  renderIntoDocument(`<label><span>bar</span><input title="foo" /></label>`)

  expect(() => screen.getByTitle('foo')).toThrowError(
    /getByLabelText\(\/bar\/i\)/,
  )
})

test('should not suggest if there would be mixed suggestions', () => {
  renderIntoDocument(`
  <button data-testid="foo">submit</button>
  <label for="foo">Username</label><input data-testid="foo" id="foo" />`)

  expect(() => screen.getAllByTestId('foo')).not.toThrowError()
})

test('should not suggest when suggest is turned off for a query', () => {
  renderIntoDocument(`
  <button data-testid="foo">submit</button>
  <button data-testid="foot">another</button>`)

  expect(() => screen.getByTestId('foo', {suggest: false})).not.toThrowError()
  expect(() =>
    screen.getAllByTestId(/foo/, {suggest: false}),
  ).not.toThrowError()
})

test('should suggest getByRole when used with getBy', () => {
  renderIntoDocument(`<button data-testid="foo">submit</button>`)

  expect(() => screen.getByTestId('foo')).toThrowErrorMatchingInlineSnapshot(`
"A better query is available, try this:
getByRole('button', { name: /submit/i })


<body>
  <button
    data-testid="foo"
  >
    submit
  </button>
</body>"
`)
})

test('should suggest getAllByRole when used with getAllByTestId', () => {
  renderIntoDocument(`
    <button data-testid="foo">submit</button>
    <button data-testid="foo">submit</button>`)

  expect(() => screen.getAllByTestId('foo'))
    .toThrowErrorMatchingInlineSnapshot(`
"A better query is available, try this:
getAllByRole('button', { name: /submit/i })


<body>
  
    
  <button
    data-testid="foo"
  >
    submit
  </button>
  
    
  <button
    data-testid="foo"
  >
    submit
  </button>
</body>"
`)
})
test('should suggest findByRole when used with findByTestId', async () => {
  renderIntoDocument(`
  <button data-testid="foo">submit</button>
  <button data-testid="foot">submit</button>
  `)

  await expect(screen.findByTestId('foo')).rejects.toThrowError(
    /findByRole\('button', \{ name: \/submit\/i \}\)/,
  )
  await expect(screen.findAllByTestId(/foo/)).rejects.toThrowError(
    /findAllByRole\('button', \{ name: \/submit\/i \}\)/,
  )
})

test('should suggest img role w/ alt text', () => {
  renderIntoDocument(`<img data-testid="img" alt="Incredibles 2 Poster"  />`)

  expect(() => screen.getByAltText('Incredibles 2 Poster')).toThrowError(
    /getByRole\('img', \{ name: \/incredibles 2 poster\/i \}\)/,
  )
})

test('escapes regular expressions in suggestion', () => {
  renderIntoDocument(
    `<img src="foo.png" alt="The Problem (picture of a question mark)" data-testid="foo" />`,
  )

  expect(() => screen.getByTestId('foo')).toThrowError(
    /getByRole\('img', \{ name: \/the problem \\\(picture of a question mark\\\)\/i \}\)/,
  )
})

test('should suggest getByLabelText when no role available', () => {
  renderIntoDocument(
    `<label for="foo">Username</label><input data-testid="foo" id="foo" />`,
  )
  expect(() => screen.getByTestId('foo')).toThrowError(
    /getByLabelText\(\/username\/i\)/,
  )
})

test(`should suggest getByLabel on non form elements`, () => {
  renderIntoDocument(`
  <div data-testid="foo" aria-labelledby="section-one-header">
    <span id="section-one-header">Section One</span>
    <p>some content</p>
  </div>
  `)

  expect(() => screen.getByTestId('foo')).toThrowError(
    /getByLabelText\(\/section one\/i\)/,
  )
})

test.each([
  `<label id="username-label">Username</label><input aria-labelledby="username-label" type="text" />`,
  `<label><span>Username</span><input type="text" /></label>`,
  `<label for="foo">Username</label><input id="foo" type="text" />`,
])('%s\nshould suggest getByRole over', async html => {
  renderIntoDocument(html)

  expect(() => screen.getByLabelText('Username')).toThrowError(
    /getByRole\('textbox', \{ name: \/username\/i \}\)/,
  )
  expect(() => screen.getAllByLabelText('Username')).toThrowError(
    /getAllByRole\('textbox', \{ name: \/username\/i \}\)/,
  )

  expect(() => screen.queryByLabelText('Username')).toThrowError(
    /queryByRole\('textbox', \{ name: \/username\/i \}\)/,
  )
  expect(() => screen.queryAllByLabelText('Username')).toThrowError(
    /queryAllByRole\('textbox', \{ name: \/username\/i \}\)/,
  )

  await expect(screen.findByLabelText('Username')).rejects.toThrowError(
    /findByRole\('textbox', \{ name: \/username\/i \}\)/,
  )
  await expect(screen.findAllByLabelText(/Username/)).rejects.toThrowError(
    /findAllByRole\('textbox', \{ name: \/username\/i \}\)/,
  )
})

test(`should suggest label over placeholder text`, () => {
  renderIntoDocument(
    `<label for="foo">Username</label><input id="foo" data-testid="foo" placeholder="Username" />`,
  )

  expect(() => screen.getByPlaceholderText('Username')).toThrowError(
    /getByLabelText\(\/username\/i\)/,
  )
})

test(`should suggest getByPlaceholderText`, () => {
  renderIntoDocument(`<input data-testid="foo" placeholder="Username" />`)

  expect(() => screen.getByTestId('foo')).toThrowError(
    /getByPlaceholderText\(\/username\/i\)/,
  )
})

test(`should suggest getByText for simple elements`, () => {
  renderIntoDocument(`<div data-testid="foo">hello there</div>`)

  expect(() => screen.getByTestId('foo')).toThrowError(
    /getByText\(\/hello there\/i\)/,
  )
})

test(`should suggest getByDisplayValue`, () => {
  renderIntoDocument(`<input id="lastName" data-testid="lastName" />`)

  document.getElementById('lastName').value = 'Prine' // RIP John Prine

  expect(() => screen.getByTestId('lastName')).toThrowError(
    /getByDisplayValue\(\/prine\/i\)/,
  )
})

test(`should suggest getByAltText`, () => {
  renderIntoDocument(`
    <input data-testid="input" alt="last name" />
    <map name="workmap">
      <area data-testid="area" shape="rect" coords="34,44,270,350" alt="Computer">
    </map>
    `)

  expect(() => screen.getByTestId('input')).toThrowError(
    /getByAltText\(\/last name\/i\)/,
  )
  expect(() => screen.getByTestId('area')).toThrowError(
    /getByAltText\(\/computer\/i\)/,
  )
})

test(`should suggest getByTitle`, () => {
  renderIntoDocument(`
  <span title="Delete" data-testid="delete"></span>
  <svg>
    <title data-testid="svg">Close</title>
    <g><path /></g>
  </svg>`)

  expect(() => screen.getByTestId('delete')).toThrowError(
    /getByTitle\(\/delete\/i\)/,
  )
  expect(() => screen.getAllByTestId('delete')).toThrowError(
    /getAllByTitle\(\/delete\/i\)/,
  )
  expect(() => screen.queryByTestId('delete')).toThrowError(
    /queryByTitle\(\/delete\/i\)/,
  )
  expect(() => screen.queryAllByTestId('delete')).toThrowError(
    /queryAllByTitle\(\/delete\/i\)/,
  )
  expect(() => screen.queryAllByTestId('delete')).toThrowError(
    /queryAllByTitle\(\/delete\/i\)/,
  )
  expect(() => screen.queryAllByTestId('delete')).toThrowError(
    /queryAllByTitle\(\/delete\/i\)/,
  )

  // Since `ByTitle` and `ByText` will both return the <title> element
  // `getByText` will always be the suggested query as it is higher up the list.
  expect(() => screen.getByTestId('svg')).toThrowError(
    /getByText\(\/close\/i\)/,
  )
})

test('getSuggestedQuery handles `variant` and defaults to `get`', () => {
  const button = render(`<button>submit</button>`).container.firstChild

  expect(getSuggestedQuery(button).toString()).toMatch(/getByRole/)
  expect(getSuggestedQuery(button, 'get').toString()).toMatch(/getByRole/)
  expect(getSuggestedQuery(button, 'getAll').toString()).toMatch(/getAllByRole/)
  expect(getSuggestedQuery(button, 'query').toString()).toMatch(/queryByRole/)
  expect(getSuggestedQuery(button, 'queryAll').toString()).toMatch(
    /queryAllByRole/,
  )
  expect(getSuggestedQuery(button, 'find').toString()).toMatch(/findByRole/)
  expect(getSuggestedQuery(button, 'findAll').toString()).toMatch(
    /findAllByRole/,
  )
})

test('getSuggestedQuery returns rich data for tooling', () => {
  const button = render(`<button>submit</button>`).container.firstChild

  expect(getSuggestedQuery(button)).toMatchObject({
    queryName: 'Role',
    queryMethod: 'getByRole',
    queryArgs: ['button', {name: /submit/i}],
    variant: 'get',
  })

  expect(getSuggestedQuery(button).toString()).toEqual(
    `getByRole('button', { name: /submit/i })`,
  )

  const div = render(`<a>cancel</a>`).container.firstChild

  expect(getSuggestedQuery(div)).toMatchObject({
    queryName: 'Text',
    queryMethod: 'getByText',
    queryArgs: [/cancel/i],
    variant: 'get',
  })

  expect(getSuggestedQuery(div).toString()).toEqual(`getByText(/cancel/i)`)
})

test('getSuggestedQuery can return specified methods in addition to the best', () => {
  const {container} = render(`
    <label for="username">label</label>
    <input
      id="username"
      name="name"
      placeholder="placeholder"
      data-testid="testid"
      title="title"
      alt="alt"
      value="value"
      type="text"
    />
    <button>button</button>
  `)

  const input = container.querySelector('input')
  const button = container.querySelector('button')

  // this function should be insensitive for the method param.
  // Role and role should work the same
  expect(getSuggestedQuery(input, 'get', 'role')).toMatchObject({
    queryName: 'Role',
    queryMethod: 'getByRole',
    queryArgs: ['textbox', {name: /label/i}],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'LabelText')).toMatchObject({
    queryName: 'LabelText',
    queryMethod: 'getByLabelText',
    queryArgs: [/label/i],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'PlaceholderText')).toMatchObject({
    queryName: 'PlaceholderText',
    queryMethod: 'getByPlaceholderText',
    queryArgs: [/placeholder/i],
    variant: 'get',
  })

  expect(getSuggestedQuery(button, 'get', 'Text')).toMatchObject({
    queryName: 'Text',
    queryMethod: 'getByText',
    queryArgs: [/button/],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'DisplayValue')).toMatchObject({
    queryName: 'DisplayValue',
    queryMethod: 'getByDisplayValue',
    queryArgs: [/value/i],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'AltText')).toMatchObject({
    queryName: 'AltText',
    queryMethod: 'getByAltText',
    queryArgs: [/alt/],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'Title')).toMatchObject({
    queryName: 'Title',
    queryMethod: 'getByTitle',
    queryArgs: [/title/i],
    variant: 'get',
  })

  expect(getSuggestedQuery(input, 'get', 'TestId')).toMatchObject({
    queryName: 'TestId',
    queryMethod: 'getByTestId',
    queryArgs: ['testid'],
    variant: 'get',
  })

  // return undefined if requested query can't be made
  expect(getSuggestedQuery(button, 'get', 'TestId')).toBeUndefined()
})

test('getSuggestedQuery works with custom testIdAttribute', () => {
  configure({testIdAttribute: 'data-test'})

  const {container} = render(`
    <label for="username">label</label>
    <input
      id="username"
      name="name"
      placeholder="placeholder"
      data-test="testid"
      title="title"
      alt="alt"
      value="value"
      type="text"
    />
    <button>button</button>
  `)

  const input = container.querySelector('input')

  expect(getSuggestedQuery(input, 'get', 'TestId')).toMatchObject({
    queryName: 'TestId',
    queryMethod: 'getByTestId',
    queryArgs: ['testid'],
    variant: 'get',
  })
})

test('getSuggestedQuery does not create suggestions for script and style elements', () => {
  const {container} = render(`
    <script data-testid="script"></script>
    <style data-testid="style"></style>
  `)

  const script = container.querySelector('script')
  const style = container.querySelector('style')

  expect(getSuggestedQuery(script, 'get', 'TestId')).toBeUndefined()
  expect(getSuggestedQuery(style, 'get', 'TestId')).toBeUndefined()
})
