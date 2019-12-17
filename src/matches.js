function matches(textToMatch, node, matcher) {
  if (typeof textToMatch !== 'string') {
    return false
  }
  const normalizedText = textToMatch.trim().replace(/\s+/g, ' ')
  if (typeof matcher === 'string') {
    return normalizedText.toLowerCase().includes(matcher.toLowerCase())
  } else if (typeof matcher === 'function') {
    return matcher(normalizedText, node)
  } else {
    return matcher.test(normalizedText)
  }
}

export {matches}
