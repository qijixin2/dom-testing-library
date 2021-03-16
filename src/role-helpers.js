import {elementRoles} from 'aria-query'
import {debugDOM} from './query-helpers'

const elementRoleList = buildElementRoleList(elementRoles)

function getImplicitAriaRoles(currentNode) {
  for (const {selector, roles} of elementRoleList) {
    if (currentNode.matches(selector)) {
      return [...roles]
    }
  }

  return []
}

function buildElementRoleList(elementRolesMap) {
  function makeElementSelector({name, attributes = []}) {
    return `${name}${attributes
      .map(({name: attributeName, value}) => `[${attributeName}=${value}]`)
      .join('')}`
  }

  function getSelectorSpecificity({attributes = []}) {
    return attributes.length
  }

  function bySelectorSpecificity(
    {specificity: leftSpecificity},
    {specificity: rightSpecificity},
  ) {
    return rightSpecificity - leftSpecificity
  }

  let result = []

  for (const [element, roles] of elementRolesMap.entries()) {
    result = [
      ...result,
      {
        selector: makeElementSelector(element),
        roles: Array.from(roles),
        specificity: getSelectorSpecificity(element),
      },
    ]
  }

  return result.sort(bySelectorSpecificity)
}

function getRoles(container) {
  function flattenDOM(node) {
    return [
      node,
      ...Array.from(node.children).reduce(
        (acc, child) => [...acc, ...flattenDOM(child)],
        [],
      ),
    ]
  }

  return flattenDOM(container).reduce((acc, node) => {
    const roles = getImplicitAriaRoles(node)

    return roles.reduce(
      (rolesAcc, role) =>
        Array.isArray(rolesAcc[role])
          ? {...rolesAcc, [role]: [...rolesAcc[role], node]}
          : {...rolesAcc, [role]: [node]},
      acc,
    )
  }, {})
}

function logRoles(container) {
  const roles = getRoles(container)

  const rolesStr = Object.entries(roles)
    .map(([role, elements]) => {
      const delimiterBar = '-'.repeat(50)
      const elementsString = elements
        .map(el => debugDOM(el.cloneNode(false)))
        .join('\n\n')

      return `${role}:\n\n${elementsString}\n\n${delimiterBar}`
    })
    .join('\n')

  // eslint-disable-next-line no-console
  console.log(rolesStr)
}

export {getRoles, logRoles, getImplicitAriaRoles}
