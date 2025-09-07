/**
 * Minimal implementation of a debounce function in TypeScript.
 * The function delays the invocation of the provided function until a specified time has elapsed since the last call.
 *
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns A new debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
