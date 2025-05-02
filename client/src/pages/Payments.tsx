
// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/hooks/use-auth';
// import { useLocation } from 'wouter';
// import { PayPalButton } from '@/components/payment/PayPalButton';
// import { Button } from '@/components/ui/button';
// import { useQuery } from '@tanstack/react-query';

// export default function Payments() {
//   const { user } = useAuth();
//   const [, setLocation] = useLocation();

//   const { data: paymentHistory } = useQuery({
//     queryKey: ['payment-history'],
//     queryFn: async () => {
//       const response = await fetch('/api/payments/history');
//       if (!response.ok) throw new Error('Failed to fetch payment history');
//       return response.json();
//     },
//     enabled: !!user
//   });

//   if (!user) {
//     return (
//       <div className="container mx-auto py-6">
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-10">
//             <h2 className="text-xl font-semibold mb-4">Please Login First</h2>
//             <p className="text-muted-foreground mb-4">You need to be logged in to view and manage payments.</p>
//             <Button onClick={() => setLocation('/auth')}>Login</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Payments</h1>
//       </div>

//       <Tabs defaultValue="investments">
//         <TabsList>
//           <TabsTrigger value="investments">Make Investment</TabsTrigger>
//           <TabsTrigger value="history">Payment History</TabsTrigger>
//           <TabsTrigger value="certificates">Investment Certificates</TabsTrigger>
//         </TabsList>

//         <TabsContent value="investments">
//           <Card>
//             <CardHeader>
//               <CardTitle>Make a New Investment</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="max-w-md mx-auto">
//                 <PayPalButton 
//                   amount="100"
//                   description="ESG Portfolio Investment"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="history">
//           <Card>
//             <CardHeader>
//               <CardTitle>Payment History</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {!paymentHistory?.length ? (
//                 <p className="text-center text-muted-foreground py-8">
//                   No payment history found. Make your first investment to get started!
//                 </p>
//               ) : (
//                 <div className="space-y-4">
//                   {paymentHistory.map((payment: any) => (
//                     <div key={payment.id} className="border-b pb-4">
//                       <div className="flex justify-between">
//                         <span>Amount: ${payment.amount}</span>
//                         <span>{new Date(payment.date).toLocaleDateString()}</span>
//                       </div>
//                       <p className="text-sm text-muted-foreground">{payment.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="certificates">
//           <Card>
//             <CardHeader>
//               <CardTitle>Investment Certificates</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-center text-muted-foreground py-8">
//                 Your investment certificates will appear here after successful payments.
//               </p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
