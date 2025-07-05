"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Building2, Smartphone, Copy, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { processDeposit } from "@/lib/user-service"
import Link from "next/link"

export default function DepositPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [copiedAddress, setCopiedAddress] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } catch (error) {
      console.error("Error loading user data:", error)
      router.push("/login")
    }
  }, [router])

  const cryptoAddresses = {
    BTC: {
      address: "1EwSeZbK8RW5EgRc96RnhjcLmGQA6zZ2RV",
      network: "Bitcoin Network",
      confirmations: "3 blocks",
      name: "Bitcoin",
    },
    ETH: {
      address: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
      network: "Ethereum Network",
      confirmations: "12 blocks",
      name: "Ethereum",
    },
    "USDT-ERC20": {
      address: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
      network: "Ethereum (ERC-20)",
      confirmations: "12 blocks",
      name: "USDT (ERC-20)",
    },
    "USDT-BEP20": {
      address: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
      network: "Binance Smart Chain (BEP-20)",
      confirmations: "15 blocks",
      name: "USDT (BEP-20)",
    },
    "USDT-TRC20": {
      address: "TFBXLYCcuDLJqkN7ggxzfKMHmW64L7u9AA",
      network: "Tron (TRC-20)",
      confirmations: "20 blocks",
      name: "USDT (TRC-20)",
    },
  }

  const handleCopyAddress = async (address: string, crypto: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(crypto)
      toast({
        title: "Address Copied!",
        description: `${crypto} address copied to clipboard`,
      })
      setTimeout(() => setCopiedAddress(""), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) < 10) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is €10",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "cryptocurrency" && !selectedCrypto) {
      toast({
        title: "Select Cryptocurrency",
        description: "Please select a cryptocurrency for deposit",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const depositAmount = Number.parseFloat(amount)
      const method =
        paymentMethod === "cryptocurrency"
          ? `${cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]?.name || selectedCrypto}`
          : paymentMethod

      const txId = processDeposit(user.email, depositAmount, method)
      setTransactionId(txId)
      setShowSuccessModal(true)

      toast({
        title: "Deposit Submitted!",
        description: "Your deposit request has been submitted successfully",
      })

      // Reset form
      setAmount("")
      setPaymentMethod("")
      setSelectedCrypto("")
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit Failed",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050e24] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050e24] text-white">
      {/* Header */}
      <header className="border-b border-[#253256] bg-[#0a1735]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Deposit Funds</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Current Balance */}
          <Card className="bg-[#0a1735] border-[#253256] mb-8">
            <CardHeader>
              <CardTitle className="text-white">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#f9a826]">{formatCurrency(user.balance || 50000)}</div>
            </CardContent>
          </Card>

          {/* Deposit Form */}
          <Card className="bg-[#0a1735] border-[#253256]">
            <CardHeader>
              <CardTitle className="text-white">Make a Deposit</CardTitle>
              <CardDescription className="text-gray-400">Add funds to your investment account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Deposit Amount (EUR)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount (minimum €10)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    step="0.01"
                    className="bg-[#253256] border-[#253256] text-white placeholder:text-gray-400"
                    required
                  />
                  <p className="text-sm text-gray-400">Minimum deposit: €10</p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-white">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-[#253256] border-[#253256] text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#253256] border-[#253256]">
                      <SelectItem value="credit-card" className="text-white hover:bg-[#0a1735]">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bank-transfer" className="text-white hover:bg-[#0a1735]">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Bank Transfer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cryptocurrency" className="text-white hover:bg-[#0a1735]">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Cryptocurrency</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cryptocurrency Selection */}
                {paymentMethod === "cryptocurrency" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Select Cryptocurrency</Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="bg-[#253256] border-[#253256] text-white">
                          <SelectValue placeholder="Choose cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#253256] border-[#253256]">
                          {Object.entries(cryptoAddresses).map(([key, crypto]) => (
                            <SelectItem key={key} value={key} className="text-white hover:bg-[#0a1735]">
                              {crypto.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Crypto Address Display */}
                    {selectedCrypto && cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses] && (
                      <div className="space-y-4 p-4 border border-[#253256] rounded-lg bg-[#253256]/30">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">
                            {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].name} Deposit Address
                          </h3>
                          <Badge variant="outline" className="border-[#f9a826] text-[#f9a826]">
                            {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].network}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Wallet Address</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].address}
                              readOnly
                              className="bg-[#0a1735] border-[#253256] text-white font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopyAddress(
                                  cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].address,
                                  selectedCrypto,
                                )
                              }
                              className="border-[#f9a826] text-[#f9a826] hover:bg-[#f9a826] hover:text-black"
                            >
                              {copiedAddress === selectedCrypto ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Network:</span>
                            <p className="text-white font-medium">
                              {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].network}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Confirmations:</span>
                            <p className="text-white font-medium">
                              {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].confirmations}
                            </p>
                          </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-yellow-500 font-medium text-sm">Important Instructions:</p>
                              <ul className="text-yellow-200 text-xs space-y-1">
                                <li>
                                  • Only send {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].name} to
                                  this address
                                </li>
                                <li>
                                  • Ensure you're using the correct network:{" "}
                                  {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].network}
                                </li>
                                <li>• Minimum deposit: equivalent of €10</li>
                                <li>
                                  • Funds will be credited after{" "}
                                  {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].confirmations}{" "}
                                  confirmations
                                </li>
                                <li>
                                  • Sending wrong cryptocurrency or using wrong network will result in permanent loss
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-white">How to deposit:</h4>
                          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Copy the wallet address above</li>
                            <li>Open your crypto wallet or exchange</li>
                            <li>
                              Send your {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses].name} to the
                              copied address
                            </li>
                            <li>Wait for network confirmations</li>
                            <li>Your balance will be updated automatically</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    loading || !amount || !paymentMethod || (paymentMethod === "cryptocurrency" && !selectedCrypto)
                  }
                  className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black font-semibold"
                >
                  {loading ? "Processing..." : "Submit Deposit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#0a1735] border-[#253256] text-white">
          <DialogHeader>
            <DialogTitle className="text-green-500">Deposit Submitted Successfully!</DialogTitle>
            <DialogDescription className="text-gray-300">
              Your deposit request has been submitted and is being processed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm">
                <strong>Transaction ID:</strong> {transactionId}
              </p>
              <p className="text-sm mt-2">
                <strong>Amount:</strong> €{amount}
              </p>
              <p className="text-sm mt-2">
                <strong>Method:</strong>{" "}
                {paymentMethod === "cryptocurrency"
                  ? cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]?.name
                  : paymentMethod}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push("/dashboard")
                }}
                className="flex-1 bg-[#f9a826] hover:bg-[#f9a826]/90 text-black"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push("/dashboard/history")
                }}
                variant="outline"
                className="flex-1 border-[#253256] text-white hover:bg-[#253256]"
              >
                View History
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
