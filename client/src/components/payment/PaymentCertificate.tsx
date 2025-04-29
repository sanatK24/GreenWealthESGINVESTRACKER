import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Award, Download, CheckCircle, Calendar, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentCertificateProps {
  transactionDetails: {
    companyName: string;
    shares: number;
    amount: number;
    date: Date;
    esgScore: number;
    paymentId: string;
  }
}

export function PaymentCertificate({ transactionDetails }: PaymentCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    const content = certificateRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the certificate');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>GreenWealth Investment Certificate</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
            }
            .certificate {
              border: 2px solid #1a5653;
              padding: 40px;
              text-align: center;
              max-width: 800px;
              margin: 0 auto;
              background-color: #f8f9fa;
            }
            .header {
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1a5653;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            .details {
              margin: 30px 0;
              text-align: left;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              margin-top: 40px;
              font-size: 14px;
              color: #777;
            }
            .ribbon {
              width: 100px;
              height: 100px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">GreenWealth Investment Certificate</div>
              <div class="subtitle">Sustainable Investment Verification</div>
            </div>
            
            <p>This certifies that an investment was made in a company with environmentally and socially responsible practices.</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Company:</span>
                <span>${transactionDetails.companyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Shares Purchased:</span>
                <span>${transactionDetails.shares}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Investment Amount:</span>
                <span>₹${transactionDetails.amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Date:</span>
                <span>${format(transactionDetails.date, 'PPP')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ESG Score:</span>
                <span>${transactionDetails.esgScore}/100</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span>${transactionDetails.paymentId}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your commitment to sustainable investing.</p>
              <p>© ${new Date().getFullYear()} Green Invest ESG Portfolio Platform</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-primary">Investment Certificate</CardTitle>
            <CardDescription>
              Proof of your sustainable investment
            </CardDescription>
          </div>
          <Award className="h-12 w-12 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6" ref={certificateRef}>
        <div className="space-y-4">
          <div className="text-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium">
              Thank you for investing in sustainable companies!
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your investment helps support environmentally and socially responsible businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Company:</span>
                <span className="font-medium">{transactionDetails.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Shares:</span>
                <span className="font-medium">{transactionDetails.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">₹{transactionDetails.amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date:
                </span>
                <span className="font-medium">
                  {format(transactionDetails.date, 'PP')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ESG Score:</span>
                <span className="font-medium">{transactionDetails.esgScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Transaction ID:
                </span>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {transactionDetails.paymentId.substring(0, 12)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 px-6 py-4">
        <Button 
          className="w-full flex items-center justify-center gap-2"
          onClick={handlePrint}
        >
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </CardFooter>
    </Card>
  );
}