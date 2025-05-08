export const handleScrollToTop = () => {
  const sessionsElement = document.getElementById('sessions')
  if (sessionsElement) {
    sessionsElement.scrollTo({ top: 0 })
  }
}
