export type SectionBounds = {id: string; top: number; end: number}

const EDGE_GAP = 16

// AI-assisted; not deeply reviewed by a human.
/** Invert the reading point: viewport center, moving toward its bottom near page end. */
export const getSectionSelectionTop = (headingTop: number, viewportHeight: number, scrollHeight: number) => {
  const centered = headingTop - viewportHeight / 2
  const top =
    centered <= scrollHeight - 2 * viewportHeight
      ? centered
      : (2 * headingTop + scrollHeight - 3 * viewportHeight) / 3
  return Math.max(0, Math.min(Math.max(0, scrollHeight - viewportHeight), top))
}

// AI-assisted; not deeply reviewed by a human.
/** Choose a clamped destination from section bounds, viewport size, and page-end constraints. */
export const getSectionScrollTop = (
  section: SectionBounds,
  index: number,
  count: number,
  viewportHeight: number,
  scrollHeight: number,
  allowBottomAlignment = true,
) => {
  const maxScroll = Math.max(0, scrollHeight - viewportHeight)
  if (index === 0) {
    return 0
  }
  if (index === count - 1) {
    return Math.min(maxScroll, section.top)
  }

  const fits = section.end - section.top <= viewportHeight - 2 * EDGE_GAP
  const cannotAlignHeading = section.top - EDGE_GAP > maxScroll
  const top =
    allowBottomAlignment && fits && cannotAlignHeading
      ? section.end + EDGE_GAP - viewportHeight
      : section.top - EDGE_GAP
  return Math.max(0, Math.min(maxScroll, top))
}

// AI-assisted; not deeply reviewed by a human.
/** Selection thresholds depend only on heading geometry, never on previous clicks. */
export const getCurrentSection = (positions: number[], scrollTop: number, maxScroll: number) => {
  if (scrollTop <= 1) {
    return 0
  }
  if (scrollTop >= maxScroll - 1) {
    return positions.length - 1
  }
  let current = 0
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] <= scrollTop + 1) {
      current = i
    }
  }
  return current
}

// AI-assisted; not deeply reviewed by a human.
/** Keep clicks inside the selected interval; use its last safe position near page end. */
export const getSectionClickScrollTop = (
  positions: number[],
  index: number,
  maxScroll: number,
  nearEnd: boolean,
  normalTop = positions[index],
) => {
  if (index === 0) {
    return 0
  }
  if (index === positions.length - 1) {
    return maxScroll
  }
  // Selection switches one pixel before the next anchor (see getCurrentSection).
  const nextBoundary = Math.min(positions[index + 1] - 1, maxScroll - 1)
  const target = Math.max(
    positions[index],
    Math.min(nearEnd ? nextBoundary - 2 : normalTop, nextBoundary - 2),
  )
  return getCurrentSection(positions, target, maxScroll) === index ? target : positions[index]
}
