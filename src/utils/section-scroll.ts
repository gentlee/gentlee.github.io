// Normal reading uses the center; the last viewport shifts the point toward the bottom.
export const getReadingPoint = (scrollTop: number, viewportHeight: number, scrollHeight: number) => {
  const remaining = Math.max(0, scrollHeight - scrollTop - viewportHeight)
  const bottomProgress = 1 - Math.min(1, remaining / Math.max(1, viewportHeight))
  return (viewportHeight / 2) * (1 + bottomProgress)
}

// Invert the same reading-point formula, so a click and subsequent scrolling agree.
export const getSectionScrollTop = (sectionTop: number, viewportHeight: number, scrollHeight: number) => {
  const centered = sectionTop - viewportHeight / 2
  const top =
    centered <= scrollHeight - 2 * viewportHeight
      ? centered
      : (2 * sectionTop + scrollHeight - 3 * viewportHeight) / 3
  return Math.max(0, Math.min(scrollHeight - viewportHeight, top))
}
