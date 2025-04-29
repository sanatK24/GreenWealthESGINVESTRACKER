import { Filter, Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FilterBar = () => {
  return (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center">
              <span className="text-sm font-medium text-slate-700 mr-2">Time Period:</span>
              <Select defaultValue="30days">
                <SelectTrigger className="h-8 w-40 text-sm border-slate-300 bg-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="inline-flex items-center">
              <span className="text-sm font-medium text-slate-700 mr-2">Sector:</span>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-40 text-sm border-slate-300 bg-white">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="consumer">Consumer Goods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search companies..." 
                className="text-sm pl-8 pr-2 py-1 h-8 border-slate-300 min-w-[200px]"
              />
            </div>
            <Button variant="outline" size="sm" className="text-sm bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
              <Filter className="h-4 w-4 mr-1" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
