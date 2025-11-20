/**
 * Reveal.js version configuration
 * Update this file when upgrading reveal.js to a new version
 *
 * To upgrade reveal.js:
 * 1. Download the desired reveal.js version from https://github.com/hakimel/reveal.js/releases
 * 2. Extract it to libs/reveal.js/{VERSION}/
 * 3. Download highlight.js from https://cdnjs.cloudflare.com/ajax/libs/highlight.js/{VERSION}/
 * 4. Extract it to libs/highlight.js/{VERSION}/
 * 5. Update the version constants below
 * 6. Run `npm run build` to rebuild
 * 7. Test your presentations
 *
 * Note: Major version upgrades (e.g., 3.x to 5.x) may require template updates
 * in the views/ directory due to API changes.
 */

export const REVEALJS_VERSION = '3.8.0';
export const HIGHLIGHT_VERSION = '9.15.10';
export const FONT_AWESOME_VERSION = 'font-awesome-4.7.0';

/**
 * Get the base path for reveal.js assets
 */
export const getRevealJSPath = () => `libs/reveal.js/${REVEALJS_VERSION}`;

/**
 * Get the base path for highlight.js assets
 */
export const getHighlightJSPath = () => `libs/highlight.js/${HIGHLIGHT_VERSION}`;

/**
 * Get the base path for font-awesome assets
 */
export const getFontAwesomePath = () => `libs/reveal.js/${FONT_AWESOME_VERSION}`;

