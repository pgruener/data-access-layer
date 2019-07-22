/**
 * Determines whether filtering of a {@link DataCollection} should be
 * (normal = done, if needed)
 * (skip = skipped in any case, i.e. to avoid circular infinite filtering)
 * (force = done in any case)
 * 
 * @type ApplyFilterMode
 * @see DataCollection
 */
export type ApplyFilterMode = 'normal'|'skip'|'force'