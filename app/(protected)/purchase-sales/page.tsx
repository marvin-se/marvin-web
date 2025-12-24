"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Transaction, SalesResponse, PurchaseResponse, Listing, User } from "@/lib/types";

// A simple component to display a transaction item
function TransactionCard({ transaction, type }: { transaction: Transaction, type: 'purchase' | 'sale' }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full bg-gray-100">
          <img 
            src={transaction.product.images?.[0] || "/placeholder.svg"} 
            alt={transaction.product.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg truncate">{transaction.product.title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {type === 'purchase' 
            ? `From: ${transaction.seller.fullName}` 
            : `To: ${transaction.buyer.fullName}`} 
        </CardDescription>
        <div className="mt-2 flex items-center justify-end">
          <p className="text-lg font-semibold">${transaction.product.price}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500">
          Date: {new Date(transaction.createdAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}

export default function PurchaseSalesPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [salesRes, purchasesRes, listingsRes] = await Promise.all([
          api.get<SalesResponse>('/user/sales'),
          api.get<PurchaseResponse>('/user/purchases'),
          api.get<Listing[]>(`/user/${user.id}/listings`)
        ]);

        let allSales: Transaction[] = [];
        if (salesRes.data && salesRes.data.transactions) {
          allSales = [...salesRes.data.transactions];
        }

        // Process manually sold listings
        if (listingsRes.data) {
          const soldListings = listingsRes.data.filter(l => l.status === 'SOLD');
          
          // Create fake transaction objects for sold listings that aren't already in sales
          // We check by product ID to avoid duplicates if the backend eventually supports it
          const existingProductIds = new Set(allSales.map(s => s.product.id));
          
          const manualSales: Transaction[] = soldListings
            .filter(l => !existingProductIds.has(l.id))
            .map(l => ({
              id: -l.id, // Negative ID to avoid collision with real transaction IDs
              buyer: { fullName: "Marked as Sold", id: 0, email: "", isActive: true, createdAt: new Date() } as User,
              seller: user,
              product: l,
              createdAt: l.createdAt ? l.createdAt.toString() : new Date().toISOString()
            }));
            
          allSales = [...allSales, ...manualSales];
        }
        
        setSales(allSales);
        
        if (purchasesRes.data && purchasesRes.data.transactions) {
          setPurchases(purchasesRes.data.transactions);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12">
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Unified Container */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[#182C53]">Purchase & Sales</h1>
            <p className="text-gray-500 mt-1">
              Track all your transactions in one place.
            </p>
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="purchases"
                  className="data-[state=active]:bg-[#72C69B] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                >
                  My Purchases ({purchases.length})
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-[#72C69B] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                >
                  My Sales ({sales.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="purchases">
                {purchases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {purchases.map((transaction) => (
                      <Link href={`/listing/${transaction.product.id}?from=purchase-sales`} key={transaction.id}>
                        <TransactionCard transaction={transaction} type="purchase" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No purchases found.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="sales">
                {sales.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sales.map((transaction) => (
                      <Link href={`/listing/${transaction.product.id}?from=purchase-sales`} key={transaction.id}>
                        <TransactionCard transaction={transaction} type="sale" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No sales found.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      </div>
    </div>
  );
}
