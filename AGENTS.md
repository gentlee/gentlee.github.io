# AI contribution documentation

- Use English for code comments and these repository instructions.
- Add `// AI-assisted; not deeply reviewed by a human.` immediately above every top-level function or component created or substantially modified by AI.
- Do not add separate AI markers to nested functions.
- Treat the user's removal of an AI marker as confirmation that they have deeply reviewed the function. Do not restore that marker unless AI subsequently substantially modifies the function. Otherwise, keep the marker until a human confirms a deep review. Automated checks, AI review, and approval to implement a change do not count as deep human review.
- Add a brief JSDoc comment (`/** ... */`) immediately above the function declaration explaining what each new function does, unless its purpose is obvious. Describe its purpose or non-obvious behavior rather than restating its name. Apply this to non-trivial nested helpers and callbacks as well.
