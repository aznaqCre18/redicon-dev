export function promise(callback: () => void, delay?: number) {
  new Promise(() => {
    setTimeout(() => {
      callback()
    }, delay ?? 0)
  })
}
