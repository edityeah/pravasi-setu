// Runtime favicon setter — falls back to the hosted NSDC URL if the local
// public/favicon.png is missing or blocked by the host.
export function setFavicon(url) {
  if (typeof document === 'undefined') return
  let icon = document.querySelector("link[rel='icon']")
  if (!icon) {
    icon = document.createElement('link')
    icon.rel = 'icon'
    document.head.appendChild(icon)
  }
  icon.type = 'image/png'
  icon.href = url

  let apple = document.querySelector("link[rel='apple-touch-icon']")
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href = url
}
