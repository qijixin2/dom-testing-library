import '@testing-library/jest-dom/extend-expect'
import jestSerializerAnsi from 'jest-serializer-ansi'

expect.addSnapshotSerializer(jestSerializerAnsi)
// add serializer for MutationRecord
expect.addSnapshotSerializer({
  print: (record, serialize) => {
    return serialize({
      addedNodes: record.addedNodes,
      attributeName: record.attributeName,
      attributeNamespace: record.attributeNamespace,
      nextSibling: record.nextSibling,
      oldValue: record.oldValue,
      previousSibling: record.previousSibling,
      removedNodes: record.removedNodes,
      target: record.target,
      type: record.type,
    })
  },
  test: value => {
    // list of records will stringify to the same value
    return (
      Array.isArray(value) === false &&
      String(value) === '[object MutationRecord]'
    )
  },
})
