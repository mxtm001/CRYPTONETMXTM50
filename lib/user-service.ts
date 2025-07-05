// User service to handle user data operations
export interface User {
  email: string
  name: string
  password: string
  balance: number
  currency: string
  status: string
  joined: string
  isVerified?: boolean
  transactions?: Transaction[]
  investments?: Investment[]
  verifications?: VerificationRequest[]
  country?: string
  phone?: string
  timezone?: string
}

export interface Transaction {
  id: string
  userEmail: string
  userName?: string
  type: "deposit" | "withdrawal"
  amount: number
  currency: string
  status: "pending" | "completed" | "rejected" | "processing"
  date: string
  method: string
  bankDetails?: {
    accountName: string
    bankName: string
    accountNumber: string
    swiftCode?: string
    routingNumber?: string
    bankCountry: string
  }
  walletAddress?: string
}

export interface Investment {
  id: string
  userEmail: string
  userName?: string
  plan: string
  amount: number
  profit: number
  duration: string
  startDate: string
  endDate: string
  status: "active" | "completed"
}

export interface VerificationRequest {
  id: string
  userEmail: string
  userName: string
  documentType: string
  documentNumber?: string
  country?: string
  frontImage: string
  backImage?: string
  selfieImage: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  approvedDate?: string
  rejectedDate?: string
}

// Get all registered users
export function getRegisteredUsers(): User[] {
  try {
    const users = localStorage.getItem("registeredUsers")
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error("Error getting registered users:", error)
    return []
  }
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = getRegisteredUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

// Save user data
export function saveUser(user: User): void {
  try {
    const users = getRegisteredUsers()
    const existingUserIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase())

    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = { ...users[existingUserIndex], ...user }
    } else {
      // Add new user with €50,000 balance
      const newUser = {
        ...user,
        balance: 50000,
        currency: "EUR",
        isVerified: false,
        transactions: [],
        investments: [],
        verifications: [],
      }
      users.push(newUser)
    }

    localStorage.setItem("registeredUsers", JSON.stringify(users))
  } catch (error) {
    console.error("Error saving user:", error)
  }
}

// Update user balance
export function updateUserBalance(email: string, amount: number): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex >= 0) {
      users[userIndex].balance = Math.max(0, (users[userIndex].balance || 0) + amount)
      localStorage.setItem("registeredUsers", JSON.stringify(users))

      // Also update current user if it's the logged in user
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (currentUser.email?.toLowerCase() === email.toLowerCase()) {
        currentUser.balance = users[userIndex].balance
        localStorage.setItem("user", JSON.stringify(currentUser))
      }
    }
  } catch (error) {
    console.error("Error updating user balance:", error)
  }
}

// Add transaction to user
export function addTransaction(email: string, transaction: Transaction): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex >= 0) {
      if (!users[userIndex].transactions) {
        users[userIndex].transactions = []
      }

      users[userIndex].transactions.push(transaction)
      localStorage.setItem("registeredUsers", JSON.stringify(users))

      // Also save to global transactions
      const allTransactions = getAllTransactions()
      allTransactions.push(transaction)
      localStorage.setItem("allTransactions", JSON.stringify(allTransactions))
    }
  } catch (error) {
    console.error("Error adding transaction:", error)
  }
}

// Process withdrawal
export function processWithdrawal(email: string, amount: number, method: string, details?: any): string {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    const user = users[userIndex]

    if (user.balance < amount) {
      throw new Error("Insufficient balance")
    }

    // Deduct amount from balance
    user.balance -= amount

    // Create transaction record
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userEmail: email,
      userName: user.name,
      type: "withdrawal",
      amount: amount,
      currency: user.currency || "EUR",
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      method: method,
      bankDetails: details?.bankDetails,
      walletAddress: details?.walletAddress,
    }

    // Add transaction to user
    if (!user.transactions) {
      user.transactions = []
    }
    user.transactions.push(transaction)

    // Save updated users
    localStorage.setItem("registeredUsers", JSON.stringify(users))

    // Update current user session
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (currentUser.email?.toLowerCase() === email.toLowerCase()) {
      currentUser.balance = user.balance
      localStorage.setItem("user", JSON.stringify(currentUser))
    }

    // Save to global transactions
    const allTransactions = getAllTransactions()
    allTransactions.push(transaction)
    localStorage.setItem("allTransactions", JSON.stringify(allTransactions))

    return transaction.id
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    throw error
  }
}

// Process deposit
export function processDeposit(email: string, amount: number, method: string): string {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    const user = users[userIndex]

    // Create transaction record
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userEmail: email,
      userName: user.name,
      type: "deposit",
      amount: amount,
      currency: user.currency || "EUR",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      method: method,
    }

    // Add transaction to user
    if (!user.transactions) {
      user.transactions = []
    }
    user.transactions.push(transaction)

    // Save updated users
    localStorage.setItem("registeredUsers", JSON.stringify(users))

    // Save to global transactions
    const allTransactions = getAllTransactions()
    allTransactions.push(transaction)
    localStorage.setItem("allTransactions", JSON.stringify(allTransactions))

    return transaction.id
  } catch (error) {
    console.error("Error processing deposit:", error)
    throw error
  }
}

// Add investment to user
export function addInvestment(email: string, investment: Investment): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex >= 0) {
      if (!users[userIndex].investments) {
        users[userIndex].investments = []
      }

      users[userIndex].investments.push(investment)
      localStorage.setItem("registeredUsers", JSON.stringify(users))
    }
  } catch (error) {
    console.error("Error adding investment:", error)
  }
}

// Get user transactions
export function getUserTransactions(email: string): Transaction[] {
  const user = getUserByEmail(email)
  return user?.transactions || []
}

// Get user investments
export function getUserInvestments(email: string): Investment[] {
  const user = getUserByEmail(email)
  return user?.investments || []
}

// Update user status
export function updateUserStatus(email: string, status: string): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email === email)

    if (userIndex !== -1) {
      users[userIndex].status = status
      localStorage.setItem("registeredUsers", JSON.stringify(users))
    }
  } catch (error) {
    console.error("Error updating user status:", error)
  }
}

// Get all transactions
export function getAllTransactions(): Transaction[] {
  try {
    const transactions = localStorage.getItem("allTransactions")
    return transactions ? JSON.parse(transactions) : []
  } catch (error) {
    console.error("Error getting transactions:", error)
    return []
  }
}

// Get all investments
export function getAllInvestments(): Investment[] {
  try {
    const investments = localStorage.getItem("allInvestments")
    return investments ? JSON.parse(investments) : []
  } catch (error) {
    console.error("Error getting investments:", error)
    return []
  }
}

// Update transaction status
export function updateTransactionStatus(userEmail: string, transactionId: string, status: string): void {
  try {
    const transactions = getAllTransactions()
    const transactionIndex = transactions.findIndex((t) => t.id === transactionId && t.userEmail === userEmail)

    if (transactionIndex !== -1) {
      transactions[transactionIndex].status = status as "pending" | "completed" | "rejected" | "processing"

      // If approved deposit, update user balance
      if (status === "completed" && transactions[transactionIndex].type === "deposit") {
        const users = getRegisteredUsers()
        const userIndex = users.findIndex((u) => u.email === userEmail)
        if (userIndex !== -1) {
          users[userIndex].balance = (users[userIndex].balance || 0) + transactions[transactionIndex].amount
          localStorage.setItem("registeredUsers", JSON.stringify(users))

          // Update current user session if it's the same user
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
          if (currentUser.email === userEmail) {
            currentUser.balance = users[userIndex].balance
            localStorage.setItem("user", JSON.stringify(currentUser))
          }
        }
      }

      localStorage.setItem("allTransactions", JSON.stringify(transactions))
    }
  } catch (error) {
    console.error("Error updating transaction status:", error)
  }
}

// Submit verification request - Auto approve
export function submitVerification(
  userEmail: string,
  userName: string,
  verificationData: {
    documentType: string
    documentNumber?: string
    country?: string
    frontImage: string
    backImage?: string
    selfieImage: string
  },
): string {
  try {
    const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const verification: VerificationRequest = {
      id: verificationId,
      userEmail,
      userName,
      documentType: verificationData.documentType,
      documentNumber: verificationData.documentNumber,
      country: verificationData.country,
      frontImage: verificationData.frontImage,
      backImage: verificationData.backImage,
      selfieImage: verificationData.selfieImage,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "approved", // Auto approve
      approvedDate: new Date().toISOString().split("T")[0],
    }

    // Save to user verifications
    const userVerifications = JSON.parse(localStorage.getItem("userVerifications") || "[]")
    userVerifications.push(verification)
    localStorage.setItem("userVerifications", JSON.stringify(userVerifications))

    // Update user with verification request and set as verified
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email === userEmail)
    if (userIndex !== -1) {
      if (!users[userIndex].verifications) {
        users[userIndex].verifications = []
      }
      users[userIndex].verifications.push(verification)
      users[userIndex].isVerified = true // Auto verify user
      localStorage.setItem("registeredUsers", JSON.stringify(users))

      // Update current user session
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (currentUser.email === userEmail) {
        currentUser.isVerified = true
        localStorage.setItem("user", JSON.stringify(currentUser))
      }
    }

    return verificationId
  } catch (error) {
    console.error("Error submitting verification:", error)
    throw new Error("Failed to submit verification")
  }
}

// Add profit to user account
export function addProfitToUser(email: string, amount: number, description: string): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email === email)

    if (userIndex !== -1) {
      users[userIndex].balance = (users[userIndex].balance || 0) + amount
      localStorage.setItem("registeredUsers", JSON.stringify(users))

      // Add transaction record
      const transactions = getAllTransactions()
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        userEmail: email,
        userName: users[userIndex].name,
        type: "deposit",
        amount: amount,
        currency: users[userIndex].currency || "EUR",
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        method: description,
      }

      transactions.push(newTransaction)
      localStorage.setItem("allTransactions", JSON.stringify(transactions))

      // Update current user session if it's the same user
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (currentUser.email === email) {
        currentUser.balance = users[userIndex].balance
        localStorage.setItem("user", JSON.stringify(currentUser))
      }
    }
  } catch (error) {
    console.error("Error adding profit to user:", error)
  }
}

// Deduct amount from user account
export function deductFromUser(email: string, amount: number, description: string): void {
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex((u) => u.email === email)

    if (userIndex !== -1) {
      users[userIndex].balance = Math.max(0, (users[userIndex].balance || 0) - amount)
      localStorage.setItem("registeredUsers", JSON.stringify(users))

      // Add transaction record
      const transactions = getAllTransactions()
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        userEmail: email,
        userName: users[userIndex].name,
        type: "withdrawal",
        amount: amount,
        currency: users[userIndex].currency || "EUR",
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        method: description,
      }

      transactions.push(newTransaction)
      localStorage.setItem("allTransactions", JSON.stringify(transactions))

      // Update current user session if it's the same user
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (currentUser.email === email) {
        currentUser.balance = users[userIndex].balance
        localStorage.setItem("user", JSON.stringify(currentUser))
      }
    }
  } catch (error) {
    console.error("Error deducting from user:", error)
  }
}
