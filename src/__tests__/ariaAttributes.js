import {render, renderIntoDocument} from './helpers/test-utils'

test('`selected` throws on unsupported roles', () => {
  const {getByRole} = render(`<input aria-selected="true" type="text">`)
  expect(() =>
    getByRole('textbox', {selected: true}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"\\"aria-selected\\" is not supported on role \\"textbox\\"."`,
  )
})

test('`checked` throws on unsupported roles', () => {
  const {getByRole} = render(`<input aria-checked="true" type="text">`)
  expect(() =>
    getByRole('textbox', {checked: true}),
  ).toThrowErrorMatchingInlineSnapshot(
    `"\\"aria-checked\\" is not supported on role \\"textbox\\"."`,
  )
})

test('`checked: true|false` matches `checked` checkboxes', () => {
  const {getByRole} = renderIntoDocument(
    `<div>
      <input type="checkbox" checked />
      <input type="checkbox" />
    </div>`,
  )
  expect(getByRole('checkbox', {checked: true})).toBeInTheDocument()
  expect(getByRole('checkbox', {checked: false})).toBeInTheDocument()
})

test('`checked: true|false` matches `checked` elements with proper role', () => {
  const {getByRole} = renderIntoDocument(
    `<div>
      <span role="checkbox" aria-checked="true">✔</span>
      <span role="checkbox" aria-checked="false">𝒙</span>
    </div>`,
  )
  expect(getByRole('checkbox', {checked: true})).toBeInTheDocument()
  expect(getByRole('checkbox', {checked: false})).toBeInTheDocument()
})

test('`checked: true|false` does not match element in `indeterminate` state', () => {
  const {queryByRole, getByLabelText} = renderIntoDocument(
    `<div>
      <span role="checkbox" aria-checked="mixed">not so much</span>
      <input type="checkbox" checked aria-label="indeteminate yes" />
      <input type="checkbox" aria-label="indeteminate no" />
    </div>`,
  )
  getByLabelText(/indeteminate yes/i).indeterminate = true
  getByLabelText(/indeteminate no/i).indeterminate = true

  expect(
    queryByRole('checkbox', {checked: true, name: /indeteminate yes/i}),
  ).toBeNull()
  expect(
    queryByRole('checkbox', {checked: false, name: /indeteminate no/i}),
  ).toBeNull()
  expect(
    queryByRole('checkbox', {checked: true, name: /not so much/i}),
  ).toBeNull()
})

test('`selected: true` matches `aria-selected="true"` on supported roles', () => {
  const {getAllByRole} = render(`
<select>
  <option selected id="selected-native-option" />
  <option id="unselected-native-option" />
</select>
<div role="listbox">
  <div role="option" aria-selected="true" id="selected-listbox-option" />
  <div role="option" aria-selected="false" id="unselected-listbox-option" />
  <div role="option" id="not-selectable-listbox-option" />
</div>
<div role="tree">
  <div role="treeitem" aria-selected="true" id="selected-treeitem" />
  <div role="treeitem" aria-selected="false" id="unselected-treeitem" />
  <div role="treeitem" id="not-selectable-treeitem" />
</div>
<table>
  <thead>
    <tr>
      <th scope="col" aria-selected="true" id="selected-native-columnheader" />
      <div role="columnheader" aria-selected="true" id="selected-columnheader" />
      <th scope="col" id="unselected-native-columnheader" />
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" aria-selected="true" id="selected-native-rowheader" />
      <td />
      <td />
    </tr>
    <tr>
      <div role="rowheader" aria-selected="true" id="selected-rowheader" />
      <td />
      <td />
    </tr>
  </tbody>
</table>
<div role="grid">
  <div role="gridcell" aria-selected="true" id="selected-gridcell" />
  <div role="gridcell" aria-selected="false" id="unselected-gridcell" />
  <div role="gridcell" id="not-selectable-gridcell" />
</div>
<div role="tablist">
  <div role="tab" aria-selected="true" id="selected-tab" />
  <div role="tab" aria-selected="false" id= "unselected-tab" />
  <div role="tab" id="unselectable-tab" />
</div>
`)

  expect(
    getAllByRole('columnheader', {selected: true}).map(({id}) => id),
  ).toEqual(['selected-native-columnheader', 'selected-columnheader'])

  expect(getAllByRole('gridcell', {selected: true}).map(({id}) => id)).toEqual([
    'selected-gridcell',
  ])

  expect(getAllByRole('option', {selected: true}).map(({id}) => id)).toEqual([
    'selected-native-option',
    'selected-listbox-option',
  ])

  expect(
    getAllByRole('rowheader', {selected: true}).map(({id}) => id),
  ).toEqual(['selected-rowheader', 'selected-native-rowheader'])

  expect(getAllByRole('treeitem', {selected: true}).map(({id}) => id)).toEqual([
    'selected-treeitem',
  ])

  expect(getAllByRole('tab', {selected: true}).map(({id}) => id)).toEqual([
    'selected-tab',
  ])
})
