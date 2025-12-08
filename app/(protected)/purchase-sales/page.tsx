"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getSoldTransactions } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";

// A simple component to display a transaction item
function TransactionCard({ item, type }: { item: any, type: 'purchase' | 'sale' }) {
  // In a real app, the 'type' would likely come from the transaction data itself
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image src={item.image_url} alt={item.title} layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {/* This is a simplification. A real app would store buyer/seller per transaction. */}
          {type === 'purchase' ? `From: ${item.created_by}` : `To: Unknown Buyer`} 
        </CardDescription>
        <div className="mt-2 flex items-center justify-end">
          <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500">
          Transaction Date: {new Date(item.updated_at).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}

export default function PurchaseSalesPage() {
  const { user } = useAuth();
  // Fetch sold listings from the central mock data source
  const transactions = getSoldTransactions();

  // This is a simplification. In a real app, you'd fetch transactions FOR the specific user.
  // Here we just split the mock data for demonstration.
  const purchases = transactions.filter(t => t.created_by !== user?.email); // Mock: purchased from others
  const sales = transactions.filter(t => t.created_by === user?.email); // Mock: sold by current user

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="container mx-auto py-10 pt-24 md:pt-32">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Purchase & Sales</h1>
          <p className="text-muted-foreground mt-2">
            Track all your transactions in one place.
          </p>
        </div>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="purchases"
              className="data-[state=active]:bg-[#72C69B] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
            >
              My Purchases
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-[#72C69B] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
            >
              My Sales
            </TabsTrigger>
          </TabsList>
          <TabsContent value="purchases">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {purchases.map((item) => (
                <Link href={`/listing/${item.id}?from=purchase-sales`} key={item.id}>
                  <TransactionCard item={item} type="purchase" />
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sales">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {sales.map((item) => (
                <Link href={`/listing/${item.id}?from=purchase-sales`} key={item.id}>
                  <TransactionCard item={item} type="sale" />
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
