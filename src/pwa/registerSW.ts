export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL
      await navigator.serviceWorker.register(`${baseUrl}sw.js`, { scope: baseUrl })
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  })
}
