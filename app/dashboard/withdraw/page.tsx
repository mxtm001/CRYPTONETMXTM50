"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Wallet,
  Building2,
  CheckCircle,
  AlertCircle,
  Home,
  History,
  LifeBuoy,
  LogOut,
  User,
} from "lucide-react"
import { processWithdrawal } from "@/lib/user-service"

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState("bank_transfer")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Bank transfer fields
  const [accountName, setAccountName] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [bankCountry, setBankCountry] = useState("")

  // Crypto fields
  const [walletAddress, setWalletAddress] = useState("")
  const [cryptoType, setCryptoType] = useState("bitcoin")

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)

      // Get latest user data from registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const currentUserData = registeredUsers.find((u: any) => u.email === userData.email)

      if (currentUserData) {
        setUser({
          ...userData,
          balance: currentUserData.balance || 5500000,
          currency: currentUserData.currency || "EUR",
        })
      } else {
        setUser(userData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Check minimum withdrawal
    if (Number(amount) < 100) {
      setError("Minimum withdrawal amount is €100")
      return
    }

    // Check if user has sufficient balance
    if (Number(amount) > user.balance) {
      setError("Insufficient balance")
      return
    }

    // Validate fields based on withdrawal method
    if (withdrawalMethod === "bank_transfer") {
      if (!accountName || !bankName || !accountNumber || !bankCountry) {
        setError("Please fill in all bank details")
        return
      }
    } else if (withdrawalMethod === "crypto") {
      if (!walletAddress) {
        setError("Please enter wallet address")
        return
      }
    }

    setProcessing(true)

    try {
      const details =
        withdrawalMethod === "bank_transfer"
          ? {
              bankDetails: {
                accountName,
                bankName,
                accountNumber,
                swiftCode,
                bankCountry,
              },
            }
          : {
              walletAddress,
              cryptoType,
            }

      // Process withdrawal
      const transactionId = processWithdrawal(
        user.email,
        Number(amount),
        withdrawalMethod === "bank_transfer" ? "Bank Transfer" : `${cryptoType} Withdrawal`,
        details,
      )

      // Update user balance in state
      const newBalance = user.balance - Number(amount)
      setUser((prev: any) => ({ ...prev, balance: newBalance }))

      // Simulate processing time
      setTimeout(() => {
        setProcessing(false)
        setSuccess(true)

        // Reset form after success
        setTimeout(() => {
          setSuccess(false)
          setAmount("")
          setAccountName("")
          setBankName("")
          setAccountNumber("")
          setSwiftCode("")
          setBankCountry("")
          setWalletAddress("")
        }, 3000)
      }, 2000)
    } catch (error: any) {
      setProcessing(false)
      setError(error.message || "Failed to process withdrawal. Please try again.")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050e24] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050e24] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a1735] text-white hidden md:block">
        <div className="p-4 border-b border-[#253256]">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-medium">MXTM INVESTMENT</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-8">
            <div className="bg-[#162040] h-10 w-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-[#0066ff] font-bold">{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/deposit"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  Deposit
                </Link>
              </li>
              <li>
                <Link href="/dashboard/withdraw" className="flex items-center p-2 rounded-md bg-[#162040] text-white">
                  <Wallet className="mr-3 h-5 w-5" />
                  Withdraw
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/investments"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  Investments
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/history"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <History className="mr-3 h-5 w-5" />
                  History
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/verification"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <User className="mr-3 h-5 w-5" />
                  Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <LifeBuoy className="mr-3 h-5 w-5" />
                  Support
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white w-full text-left"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0a1735] z-10 border-b border-[#253256]">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-medium text-white text-sm">MXTM</span>
          </Link>
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Home className="h-5 w-5 text-white" />
            </Link>
            <button onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="mr-4 text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
          </div>

          {/* Balance Info */}
          <Card className="bg-[#0a1735] border-[#253256] text-white mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Available Balance</span>
                <span className="text-xl font-bold text-[#f9a826]">{formatCurrency(user?.balance || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription className="text-gray-400">
                Choose your withdrawal method and enter the amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (EUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#162040] border-[#253256] text-white"
                    min="100"
                    max={user?.balance || 0}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-400">
                    Minimum: €100 • Available: {formatCurrency(user?.balance || 0)}
                  </p>
                </div>

                <Tabs value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                  <TabsList className="bg-[#162040] border-[#253256] w-full">
                    <TabsTrigger value="bank_transfer" className="data-[state=active]:bg-[#0a1735]">
                      Bank Transfer
                    </TabsTrigger>
                    <TabsTrigger value="crypto" className="data-[state=active]:bg-[#0a1735]">
                      Cryptocurrency
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bank_transfer" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-name">Account Holder Name</Label>
                        <Input
                          id="account-name"
                          placeholder="Full name on account"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="bg-[#162040] border-[#253256] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          placeholder="Name of your bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="bg-[#162040] border-[#253256] text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number/IBAN</Label>
                        <Input
                          id="account-number"
                          placeholder="Account number or IBAN"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="bg-[#162040] border-[#253256] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swift-code">SWIFT/BIC Code (Optional)</Label>
                        <Input
                          id="swift-code"
                          placeholder="SWIFT or BIC code"
                          value={swiftCode}
                          onChange={(e) => setSwiftCode(e.target.value)}
                          className="bg-[#162040] border-[#253256] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank-country">Bank Country</Label>
                      <Input
                        id="bank-country"
                        placeholder="Country where bank is located"
                        value={bankCountry}
                        onChange={(e) => setBankCountry(e.target.value)}
                        className="bg-[#162040] border-[#253256] text-white"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="crypto" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="crypto-type">Cryptocurrency</Label>
                      <Select value={cryptoType} onValueChange={setCryptoType}>
                        <SelectTrigger className="bg-[#162040] border-[#253256] text-white">
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1735] border-[#253256] text-white">
                          <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                          <SelectItem value="usdt">Tether (USDT)</SelectItem>
                          <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wallet-address">Wallet Address</Label>
                      <Input
                        id="wallet-address"
                        placeholder="Enter your wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-[#162040] border-[#253256] text-white"
                      />
                      <p className="text-xs text-gray-400">
                        Make sure the address is correct. Transactions cannot be reversed.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black font-medium"
                  disabled={processing || !amount}
                >
                  {processing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Processing Withdrawal...
                    </div>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Withdrawal Info */}
          <Card className="bg-[#0a1735] border-[#253256] text-white mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Withdrawal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-[#f9a826] mt-0.5" />
                  <div>
                    <h4 className="font-medium">Bank Transfer</h4>
                    <p className="text-sm text-gray-400">1-3 business days • No fees</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Wallet className="h-5 w-5 text-[#f9a826] mt-0.5" />
                  <div>
                    <h4 className="font-medium">Cryptocurrency</h4>
                    <p className="text-sm text-gray-400">10-60 minutes • Network fees apply</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0a1735] border border-[#253256] rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Withdrawal Successful!</h2>
              <p className="text-gray-300 mb-6">
                Your withdrawal of €{amount} has been processed successfully. The funds will be transferred to your
                account shortly.
              </p>
              <Button className="bg-[#f9a826] hover:bg-[#f9a826]/90 text-black" onClick={() => setSuccess(false)}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
