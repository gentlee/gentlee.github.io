# Table of contents: regression notes — 2026-10-17

This records issues reported during the table-of-contents work and scenarios to cover with future E2E tests. It is not an automated test suite or a claim that every historical issue has been independently reproduced. The checklist describes the intended behavior after the latest changes; earlier scroll and spacing experiments were superseded.

## Test pages and environments

- `/en/articles` and `/ru/articles`: homepage navigation.
- `/en/articles/immutable-performance-zustand-redux-react`: nested headings, long titles, and adjacent sections near the page end. Include its Russian version to exercise different wrapping.
- `/en/articles/oop`: a long outline, including Advice and Summary.
- `/en/articles/serial-queues`: long headings, including “What About Concurrent Collections and ReaderWriterLock?”.
- `/en/articles/react-native-styles-and-adaptive-ui`: a short outline with nested headings.
- Run in Chromium and WebKit. Layout problems were specifically reported in Safari; also check actual Safari when possible.
- Test wide/tall, wide/medium-height, wide/short, and narrow windows. Include transitions between them without reloading.
- Wait for fonts and the initial outline measurement before checking settled geometry. Separately capture initial loading to detect flashes.

## Reported selection and scrolling regressions

- [ ] **The final section did not become active.** Scroll through the end of an article and verify that Summary becomes selected at the page bottom, including the footer.
- [ ] **Clicking the penultimate section selected the last section.** On OOP, click Advice; on the immutable-performance article, click the section immediately before Summary. After scrolling settles, the intended section must remain selected.
- [ ] **Clicking Summary changed selection to another item.** Click the final entry from several starting positions and check the settled selection.
- [ ] **Clicking and manual scrolling disagreed about selection.** Reach the same document scroll position by both methods. Selection must depend on document geometry, not a remembered click or a temporary selection lock.
- [ ] **Scrolling jumped away and then returned.** After clicking a near-end entry, scroll in both directions. Neither the page nor the outline may snap back to a previous position.
- [ ] **The wrong adjacent section stayed selected.** A report identified Mutable collections as active when Persistence was expected. Exercise their transition with slow scrolling in both directions and verify selection against the current reading-point rule.
- [ ] **Bottom alignment was applied too broadly.** The homepage RRC entry and the queues article's Concurrent Collections / ReaderWriterLock entry were examples. When a normal heading-aligned destination is valid, the click must not unnecessarily align the section's end with the viewport bottom.
- [ ] **Near-end proportional selection and click destinations disagreed.** For entries that use the near-end rule, land inside that entry's activation interval, near its last safe position, without activating the following entry.
- [ ] **Page-end calculations excluded the footer.** Use the complete document scroll range, including the footer, for bottom detection and proportional selection.

Boundary contracts to retain alongside these regressions:

- [ ] The first entry scrolls to document position `0`.
- [ ] The last entry scrolls to the full document bottom under the currently accepted behavior.
- [ ] Test just before and after selection thresholds, not only large scroll jumps. Allow the throttled update to settle before asserting.
- [ ] In the outline mode that hides subheadings, scrolling through a hidden subsection selects its visible parent.

## Reported layout and styling regressions

- [ ] **Subheading indentation broke the layout, especially in Safari.** Nested entries remain inside the fixed panel width and do not disturb neighboring entries.
- [ ] **The last entry overlapped the miniature footer.** The final visible row ends above the footer; the footer never covers clickable text.
- [ ] **A footer fix introduced extra space below it in Safari.** Check the panel's bottom edge, shadow, and document overflow, not just individual row bounds.
- [ ] **Selection changed wrapping and row heights.** Selecting a long title may shift its first line to make room for `>`, but must not change the established line breaks or move the other rows.
- [ ] **The selection marker disappeared.** The active entry has exactly one visible `>` marker.
- [ ] **Adding a space after the marker pushed it outside the screen or panel.** Retain a visible gap after `>` while keeping both marker and text within bounds.
- [ ] **Space reservation created an extra blank line or an unexplained gap.** Long entries, particularly the penultimate one, must reserve horizontal marker space without adding an empty row.
- [ ] **An unwanted blue highlight appeared.** Clicking or hovering the outline must not introduce the previously reported blue selection/focus background.
- [ ] **Removing subheading separators left excessive vertical gaps.** Within a heading/subheading group, retain the agreed 8 px padding gap between text line boxes. There are no separator lines before subheadings.
- [ ] **Compact spacing also reduced the gap before the next separator.** Keep 8 px below the final subheading before the next main-heading separator.
- [ ] **The gap before the first subheading was larger than the others.** Do not stack extra top padding on the first subheading. Main headings retain their padding next to separator lines.

## Initial loading and height-dependent visibility

- [ ] **The outline flashed during page opening.** With cold caches and delayed font loading, do not briefly show an unmeasured full list before collapsing or hiding it.
- [ ] If the full outline fits, show headings and subheadings.
- [ ] If only main headings fit, hide subheadings and their occupied height.
- [ ] If main headings do not fit either, hide the entire outline.
- [ ] Increasing the viewport height restores the appropriate mode without reloading or oscillating between modes.
- [ ] Crossing the width breakpoint in both directions restores correctly measured titles, spacing, and selection.

## Related safeguards for future tests

These are accepted constraints or review follow-ups, rather than additional claims of reproduced bugs:

- [ ] The outline remains excluded from the accessibility tree and sequential keyboard focus, as requested. The article's own headings remain available to assistive technology.
- [ ] Emphasis in heading titles survives into the outline and across fixed line breaks. It must not introduce duplicate IDs or nested links.
- [ ] Resizing only the viewport height does not rerun title-word measurements. Fonts are awaited initially; there is no permanent font-loading subscription.
- [ ] A completely hidden outline does not keep processing scroll events or pending selection timers. Showing it again refreshes selection from the current position.
- [ ] Repeated navigation and mounting/unmounting do not accumulate listeners, observers, or timers. Use instrumentation where a visual E2E assertion cannot establish this.
- [ ] Production build still exports static HTML for both languages. Test the exported site as well as the development server.

For geometry assertions, allow a small subpixel tolerance. Prefer relationships such as stable row heights, in-bounds text, and non-overlapping footer bounds over exact whole-page screenshot matches. Initial-load flashing and Safari-specific layout issues also need visual checks.
