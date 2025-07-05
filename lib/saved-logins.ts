// Saved logins management
export interface SavedLogin {
  id: string
  email: string
  name: string
  country: string
  lastUsed: string
  avatar?: string
}

export function getSavedLogins(): SavedLogin[] {
  try {
    const saved = localStorage.getItem("savedLogins")
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Error getting saved logins:", error)
    return []
  }
}

export function saveLogin(email: string, name: string, country: string): void {
  try {
    const savedLogins = getSavedLogins()

    // Remove existing login for this email
    const filteredLogins = savedLogins.filter((login) => login.email !== email)

    // Add new login at the beginning
    const newLogin: SavedLogin = {
      id: Date.now().toString(),
      email,
      name,
      country,
      lastUsed: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f9a826&color=000`,
    }

    filteredLogins.unshift(newLogin)

    // Keep only last 5 logins
    const limitedLogins = filteredLogins.slice(0, 5)

    localStorage.setItem("savedLogins", JSON.stringify(limitedLogins))
  } catch (error) {
    console.error("Error saving login:", error)
  }
}

export function removeSavedLogin(email: string): void {
  try {
    const savedLogins = getSavedLogins()
    const filteredLogins = savedLogins.filter((login) => login.email !== email)
    localStorage.setItem("savedLogins", JSON.stringify(filteredLogins))
  } catch (error) {
    console.error("Error removing saved login:", error)
  }
}

export function updateLastUsed(email: string): void {
  try {
    const savedLogins = getSavedLogins()
    const updatedLogins = savedLogins.map((login) =>
      login.email === email ? { ...login, lastUsed: new Date().toISOString() } : login,
    )
    localStorage.setItem("savedLogins", JSON.stringify(updatedLogins))
  } catch (error) {
    console.error("Error updating last used:", error)
  }
}
