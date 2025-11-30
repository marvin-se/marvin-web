import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Mock data for demonstration purposes
const mockPurchases = [
  {
    id: "1",
    name: "Vintage University Hoodie",
    price: 25.00,
    date: "2023-10-15",
    seller: "Jane Doe",
    imageUrl: "/placeholder.svg", 
  },
  {
    id: "2",
    name: "Introduction to Psychology Textbook",
    price: 40.00,
    date: "2023-09-22",
    seller: "John Smith",
    imageUrl: "/placeholder.svg",
  },
];

const mockSales = [
  {
    id: "3",
    name: "Graphic Calculator TI-84",
    price: 75.00,
    date: "2023-11-01",
    buyer: "Emily White",
    imageUrl: "/placeholder.svg",
  },
];

// A simple component to display a transaction item
function TransactionCard({ item, type }: { item: any, type: 'purchase' | 'sale' }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {type === 'purchase' ? `From: ${item.seller}` : `To: ${item.buyer}`}
        </CardDescription>
        <div className="mt-2 flex items-center justify-end">
          <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500">
          Transaction Date: {new Date(item.date).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}


export default function PurchaseSalesPage() {
  return (
    <div className="container mx-auto py-10 pt-24 md:pt-32">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Purchase & Sales</h1>
        <p className="text-muted-foreground mt-2">
          Track all your transactions in one place.
        </p>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="purchases">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {mockPurchases.map((item) => (
              <Link href={`/listing/${item.id}?from=purchase-sales`} key={item.id}>
                <TransactionCard item={item} type="purchase" />
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="sales">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {mockSales.map((item) => (
              <Link href={`/listing/${item.id}?from=purchase-sales`} key={item.id}>
                <TransactionCard item={item} type="sale" />
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
