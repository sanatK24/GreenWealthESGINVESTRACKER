import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Company } from '@shared/schema';
import { ArrowUpDown, Search, SunIcon, Battery, Atom, Leaf, Wind, DropletIcon } from 'lucide-react';

// Define the green technology stocks
const greenTechStocks = [
  { id: 1, name: "Tesla", ticker: "TSLA", sector: "Automotive", esgScore: 68, description: "Electric vehicles and clean energy solutions" },
  { id: 2, name: "First Solar", ticker: "FSLR", sector: "Solar Energy", esgScore: 72, description: "Photovoltaic solar energy solutions" },
  { id: 3, name: "NextEra Energy", ticker: "NEE", sector: "Renewable Energy", esgScore: 78, description: "World's largest producer of wind and solar energy" },
  { id: 4, name: "Vestas Wind Systems", ticker: "VWS.CO", sector: "Wind Power", esgScore: 82, description: "Wind turbine design, manufacturing, installation, and service" },
  { id: 5, name: "Ørsted", ticker: "ORSTED.CO", sector: "Renewable Energy", esgScore: 84, description: "Largest energy company in Denmark, focusing on green energy" },
  { id: 6, name: "Enphase Energy", ticker: "ENPH", sector: "Solar Energy", esgScore: 71, description: "Energy technology company specializing in solar microinverters" },
  { id: 7, name: "Plug Power", ticker: "PLUG", sector: "Hydrogen Fuel Cells", esgScore: 67, description: "Hydrogen fuel cell systems for electric motors" },
  { id: 8, name: "Sunrun", ticker: "RUN", sector: "Solar Energy", esgScore: 69, description: "Residential solar panels and home batteries" },
  { id: 9, name: "SolarEdge", ticker: "SEDG", sector: "Solar Energy", esgScore: 70, description: "Solar power optimization and energy monitoring solutions" },
  { id: 10, name: "Bloom Energy", ticker: "BE", sector: "Fuel Cells", esgScore: 65, description: "Solid oxide fuel cells for electricity generation" },
  { id: 11, name: "Beyond Meat", ticker: "BYND", sector: "Food Technology", esgScore: 73, description: "Plant-based meat substitutes" },
  { id: 12, name: "Brookfield Renewable", ticker: "BEP", sector: "Renewable Energy", esgScore: 79, description: "Operates renewable power platforms globally" },
  { id: 13, name: "NIO Inc.", ticker: "NIO", sector: "Automotive", esgScore: 66, description: "Electric vehicle manufacturer based in China" },
  { id: 14, name: "Clearway Energy", ticker: "CWEN", sector: "Renewable Energy", esgScore: 74, description: "Owns and operates renewable energy projects" },
  { id: 15, name: "Hannon Armstrong", ticker: "HASI", sector: "Climate Finance", esgScore: 77, description: "Sustainable infrastructure investments" },
  { id: 16, name: "Ballard Power Systems", ticker: "BLDP", sector: "Fuel Cells", esgScore: 68, description: "Development and manufacturing of proton exchange membrane fuel cells" },
  { id: 17, name: "XPENG", ticker: "XPEV", sector: "Automotive", esgScore: 64, description: "Chinese electric vehicle manufacturer" },
  { id: 18, name: "Itron", ticker: "ITRI", sector: "Smart Grid", esgScore: 71, description: "Energy and water management solutions" },
  { id: 19, name: "Canadian Solar", ticker: "CSIQ", sector: "Solar Energy", esgScore: 69, description: "Solar PV modules and provider of solar energy solutions" },
  { id: 20, name: "ChargePoint Holdings", ticker: "CHPT", sector: "EV Infrastructure", esgScore: 70, description: "Electric vehicle charging network" },
  { id: 21, name: "Siemens Gamesa", ticker: "SGRE.MC", sector: "Wind Power", esgScore: 80, description: "Wind turbine design and manufacturing" },
  { id: 22, name: "Array Technologies", ticker: "ARRY", sector: "Solar Energy", esgScore: 68, description: "Solar tracking solutions for utility-scale projects" },
  { id: 23, name: "Livent", ticker: "LTHM", sector: "Energy Storage", esgScore: 66, description: "Lithium technology for batteries and energy storage" },
  { id: 24, name: "Ameresco", ticker: "AMRC", sector: "Energy Efficiency", esgScore: 72, description: "Energy efficiency and renewable energy solutions" },
  { id: 25, name: "Daqo New Energy", ticker: "DQ", sector: "Solar Energy", esgScore: 67, description: "Manufacturer of high-purity polysilicon for solar panels" },
];

const getSectorIcon = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'solar energy':
      return <SunIcon className="h-4 w-4" />;
    case 'wind power':
      return <Wind className="h-4 w-4" />;
    case 'renewable energy':
      return <Leaf className="h-4 w-4" />;
    case 'hydrogen fuel cells':
    case 'fuel cells':
      return <Atom className="h-4 w-4" />;
    case 'energy storage':
    case 'ev infrastructure':
      return <Battery className="h-4 w-4" />;
    default:
      return <DropletIcon className="h-4 w-4" />;
  }
};

const GreenStocksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'ticker' | 'esgScore' | 'sector'>('esgScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort stocks
  const filteredStocks = greenTechStocks
    .filter(stock => 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  // Function to handle sort
  const handleSort = (field: 'name' | 'ticker' | 'esgScore' | 'sector') => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Green Technology Stocks</h1>
      <p className="text-slate-500">
        Explore sustainable investments in clean energy, electric vehicles, and other green technologies.
      </p>
      
      <div className="flex items-center justify-between space-x-2 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search by name, ticker, or sector..."
            className="w-full bg-white pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Green Technology Companies</CardTitle>
          <CardDescription>
            Companies focused on renewable energy, electric vehicles, and clean technology solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="flex items-center p-0 hover:bg-transparent"
                  >
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('ticker')}
                    className="flex items-center p-0 hover:bg-transparent"
                  >
                    Ticker
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('sector')}
                    className="flex items-center p-0 hover:bg-transparent"
                  >
                    Sector
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('esgScore')}
                    className="flex items-center p-0 hover:bg-transparent"
                  >
                    ESG Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.name}</TableCell>
                  <TableCell>{stock.ticker}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getSectorIcon(stock.sector)}
                      {stock.sector}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        stock.esgScore >= 75 ? "bg-green-500" :
                        stock.esgScore >= 65 ? "bg-emerald-400" :
                        "bg-yellow-500"
                      }
                    >
                      {stock.esgScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{stock.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-slate-500">
            Showing {filteredStocks.length} of {greenTechStocks.length} green technology stocks
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GreenStocksPage;