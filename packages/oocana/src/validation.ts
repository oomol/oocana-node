/**
 * Shared validation utilities for oocana package.
 * Eliminates duplicate validation logic across modules.
 */

/**
 * Pattern for validating bind path format.
 * Expected format: src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive]
 */
export const BIND_PATH_PATTERN =
  /^src=([^,]+),dst=([^,]+)(?:,(?:ro|rw))?(?:,(?:nonrecursive|recursive))?$/;

/**
 * Validates a single bind path string.
 * @throws Error if the path format is invalid
 */
export function validateBindPath(path: string): void {
  if (!BIND_PATH_PATTERN.test(path)) {
    throw new Error(
      `Invalid bind path format: ${path}. Expected format: src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive]`
    );
  }
}

/**
 * Validates an array of bind paths.
 * @throws Error if any path format is invalid
 */
export function validateBindPaths(paths: string[]): void {
  for (const path of paths) {
    validateBindPath(path);
  }
}
