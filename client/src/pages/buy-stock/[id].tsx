
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { ArrowUp, ShoppingCart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// Import mock data directly
const companiesData = [{"id":1,"name":"Tesla, Inc.","ticker":"TSLA","sector":"Electric Vehicles","esg_score":86,"environmental_score":92,"social_score":76,"governance_score":82,"yearly_trend":8,"created_at":"2025-04-25T01:29:18.149Z","updated_at":"2025-04-25T01:29:18.149Z","industry":"Technology","sustainability_rating":"A-","esg_risk_level":"Low","current_price":"553.52","market_cap":"418272652528.72","return_on_investment":"8.30","carbon_neutral_year":2036,"week_high_52":"731.08","week_low_52":"345.05","dividend_yield":"4.41","pe_ratio":"48.60","description":"Tesla, Inc. is a leading innovator in the electric vehicle industry, focusing on sustainable transportation solutions. With a strong commitment to reducing carbon emissions, they have achieved an impressive ESG score of 86. Their environmental initiatives and technological advancement in EV manufacturing demonstrate their dedication to a greener future."},{"id":2,"name":"First Solar","ticker":"FSLR","sector":"Clean Energy","esg_score":84,"environmental_score":91,"social_score":81,"governance_score":78,"yearly_trend":4,"created_at":"2025-04-25T01:29:18.229Z","updated_at":"2025-04-25T01:29:18.229Z","industry":"Technology","sustainability_rating":"A","esg_risk_level":"Low","current_price":"556.75","market_cap":"65056469664.75","return_on_investment":"24.30","carbon_neutral_year":2033,"week_high_52":"604.24","week_low_52":"441.94","dividend_yield":"2.72","pe_ratio":"30.12","description":"As a pioneer in clean energy solutions, First Solar develops cutting-edge technologies for sustainable power generation. Their high environmental score of 91 showcases their dedication to reducing global carbon emissions. The company's innovative projects and research initiatives are driving the advancement of clean energy technology."},{"id":3,"name":"Beyond Meat","ticker":"BYND","sector":"Food Products","esg_score":78,"environmental_score":82,"social_score":80,"governance_score":72,"yearly_trend":6,"created_at":"2025-04-25T01:29:18.296Z","updated_at":"2025-04-25T01:29:18.296Z","industry":"Technology","sustainability_rating":"A+","esg_risk_level":"Medium","current_price":"271.00","market_cap":"288523582757.00","return_on_investment":"15.25","carbon_neutral_year":2044,"week_high_52":"346.82","week_low_52":"168.46","dividend_yield":"3.71","pe_ratio":"46.86","description":"Beyond Meat is revolutionizing the food industry with sustainable and plant-based alternatives. Their environmental score of 82 reflects their commitment to reducing the environmental impact of food production. The company's innovative approach to sustainable food solutions is reshaping the future of nutrition."},{"id":4,"name":"Microsoft","ticker":"MSFT","sector":"Technology","esg_score":75,"environmental_score":80,"social_score":78,"governance_score":68,"yearly_trend":3,"created_at":"2025-04-25T01:29:18.362Z","updated_at":"2025-04-25T01:29:18.362Z","industry":"Technology","sustainability_rating":"A+","esg_risk_level":"Medium","current_price":"738.25","market_cap":"220435949299.25","return_on_investment":"5.30","carbon_neutral_year":2032,"week_high_52":"1053.37","week_low_52":"489.15","dividend_yield":"3.38","pe_ratio":"15.67","description":"Microsoft is a technology leader with a strong focus on sustainable innovation. Their ESG score of 75 demonstrates their commitment to responsible business practices. The company's solutions combine cutting-edge technology with environmental consciousness, setting new standards in sustainable tech development."},{"id":5,"name":"Ørsted","ticker":"ORSTED.CO","sector":"Renewable Energy","esg_score":90,"environmental_score":95,"social_score":87,"governance_score":89,"yearly_trend":2,"created_at":"2025-04-25T01:29:18.429Z","updated_at":"2025-04-25T01:29:18.429Z","industry":"Technology","sustainability_rating":"A-","esg_risk_level":"Medium-Low","current_price":"430.21","market_cap":"368404773465.96","return_on_investment":"20.25","carbon_neutral_year":2048,"week_high_52":"437.09","week_low_52":"272.21","dividend_yield":"4.86","pe_ratio":"32.67","description":"Ørsted is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 95 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":8,"name":"Adani Green Energy","ticker":"ADG","sector":"Renewable Energy","esg_score":75,"environmental_score":79,"social_score":60,"governance_score":54,"yearly_trend":5,"created_at":"2025-04-25T08:01:53.054Z","updated_at":"2025-04-25T08:01:53.054Z","industry":"Technology","sustainability_rating":"B","esg_risk_level":"Low","current_price":"814.63","market_cap":"284308405128.56","return_on_investment":"28.78","carbon_neutral_year":2038,"week_high_52":"995.91","week_low_52":"572.96","dividend_yield":"1.71","pe_ratio":"54.68","description":"Adani Green Energy is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 79 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":9,"name":"NextEra Energy","ticker":"NEE","sector":"Renewable Energy","esg_score":85,"environmental_score":90,"social_score":73,"governance_score":78,"yearly_trend":6,"created_at":"2025-04-25T08:01:53.129Z","updated_at":"2025-04-25T08:01:53.129Z","industry":"Technology","sustainability_rating":"B","esg_risk_level":"Medium","current_price":"845.58","market_cap":"690936678385.56","return_on_investment":"16.54","carbon_neutral_year":2037,"week_high_52":"945.30","week_low_52":"567.41","dividend_yield":"4.00","pe_ratio":"54.00","description":"NextEra Energy is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 90 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":10,"name":"Iberdrola","ticker":"IBE.MC","sector":"Renewable Energy","esg_score":80,"environmental_score":84,"social_score":76,"governance_score":80,"yearly_trend":3,"created_at":"2025-04-25T08:01:53.195Z","updated_at":"2025-04-25T08:01:53.195Z","industry":"Technology","sustainability_rating":"A-","esg_risk_level":"Low","current_price":"138.26","market_cap":"66530012680.92","return_on_investment":"21.38","carbon_neutral_year":2035,"week_high_52":"192.98","week_low_52":"101.51","dividend_yield":"1.53","pe_ratio":"15.61","description":"Iberdrola is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 84 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":11,"name":"Vestas Wind Systems","ticker":"VWS.CO","sector":"Renewable Energy","esg_score":82,"environmental_score":87,"social_score":73,"governance_score":66,"yearly_trend":4,"created_at":"2025-04-25T08:01:53.261Z","updated_at":"2025-04-25T08:01:53.261Z","industry":"Technology","sustainability_rating":"B+","esg_risk_level":"Low","current_price":"908.69","market_cap":"902529918703.49","return_on_investment":"20.23","carbon_neutral_year":2030,"week_high_52":"1155.10","week_low_52":"617.21","dividend_yield":"4.47","pe_ratio":"28.55","description":"Vestas Wind Systems is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 87 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":12,"name":"Enphase Energy","ticker":"ENPH","sector":"Renewable Energy","esg_score":78,"environmental_score":82,"social_score":83,"governance_score":67,"yearly_trend":7,"created_at":"2025-04-25T08:01:53.329Z","updated_at":"2025-04-25T08:01:53.329Z","industry":"Technology","sustainability_rating":"A-","esg_risk_level":"Medium-Low","current_price":"563.64","market_cap":"282966331595.64","return_on_investment":"26.66","carbon_neutral_year":2038,"week_high_52":"635.27","week_low_52":"432.37","dividend_yield":"3.37","pe_ratio":"49.75","description":"Enphase Energy is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 82 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":13,"name":"Canadian Solar","ticker":"CSIQ","sector":"Renewable Energy","esg_score":76,"environmental_score":80,"social_score":72,"governance_score":69,"yearly_trend":4,"created_at":"2025-04-25T08:01:53.395Z","updated_at":"2025-04-25T08:01:53.395Z","industry":"Technology","sustainability_rating":"A+","esg_risk_level":"Medium-Low","current_price":"980.82","market_cap":"1022207664482.46","return_on_investment":"29.63","carbon_neutral_year":2045,"week_high_52":"1138.81","week_low_52":"704.13","dividend_yield":"0.78","pe_ratio":"57.83","description":"Canadian Solar is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 80 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":14,"name":"Clearway Energy","ticker":"CWEN","sector":"Renewable Energy","esg_score":81,"environmental_score":84,"social_score":79,"governance_score":77,"yearly_trend":3,"created_at":"2025-04-25T08:01:53.461Z","updated_at":"2025-04-25T08:01:53.461Z","industry":"Technology","sustainability_rating":"B+","esg_risk_level":"Low","current_price":"1047.06","market_cap":"659136531072.60","return_on_investment":"10.42","carbon_neutral_year":2046,"week_high_52":"1376.75","week_low_52":"820.94","dividend_yield":"1.23","pe_ratio":"23.68","description":"Clearway Energy is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 84 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":15,"name":"Brookfield Renewable","ticker":"BEPC","sector":"Renewable Energy","esg_score":83,"environmental_score":88,"social_score":76,"governance_score":83,"yearly_trend":5,"created_at":"2025-04-25T08:01:53.528Z","updated_at":"2025-04-25T08:01:53.528Z","industry":"Technology","sustainability_rating":"B+","esg_risk_level":"Medium-High","current_price":"252.16","market_cap":"183087879668.48","return_on_investment":"32.76","carbon_neutral_year":2044,"week_high_52":"257.90","week_low_52":"159.58","dividend_yield":"2.30","pe_ratio":"43.08","description":"Brookfield Renewable is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 88 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":16,"name":"SolarEdge Technologies","ticker":"SEDG","sector":"Renewable Energy","esg_score":77,"environmental_score":82,"social_score":74,"governance_score":72,"yearly_trend":6,"created_at":"2025-04-25T08:01:53.594Z","updated_at":"2025-04-25T08:01:53.594Z","industry":"Technology","sustainability_rating":"A","esg_risk_level":"Medium","current_price":"75.48","market_cap":"17412726208.08","return_on_investment":"33.77","carbon_neutral_year":2049,"week_high_52":"108.90","week_low_52":"54.93","dividend_yield":"2.77","pe_ratio":"39.16","description":"SolarEdge Technologies is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 82 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":17,"name":"Sunrun","ticker":"RUN","sector":"Renewable Energy","esg_score":79,"environmental_score":83,"social_score":78,"governance_score":74,"yearly_trend":7,"created_at":"2025-04-25T08:01:53.659Z","updated_at":"2025-04-25T08:01:53.659Z","industry":"Technology","sustainability_rating":"A","esg_risk_level":"Low","current_price":"85.06","market_cap":"50910051658.00","return_on_investment":"19.79","carbon_neutral_year":2042,"week_high_52":"94.91","week_low_52":"62.74","dividend_yield":"2.16","pe_ratio":"22.73","description":"Sunrun is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 83 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":18,"name":"SunPower","ticker":"SPWR","sector":"Renewable Energy","esg_score":75,"environmental_score":79,"social_score":73,"governance_score":70,"yearly_trend":4,"created_at":"2025-04-25T08:01:53.725Z","updated_at":"2025-04-25T08:01:53.725Z","industry":"Technology","sustainability_rating":"A+","esg_risk_level":"Medium-Low","current_price":"646.67","market_cap":"684233153916.84","return_on_investment":"16.92","carbon_neutral_year":2033,"week_high_52":"793.64","week_low_52":"515.86","dividend_yield":"2.40","pe_ratio":"12.87","description":"SunPower is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 79 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":19,"name":"Renewable Energy Group","ticker":"REGI","sector":"Renewable Energy","esg_score":80,"environmental_score":86,"social_score":77,"governance_score":75,"yearly_trend":5,"created_at":"2025-04-25T08:01:53.791Z","updated_at":"2025-04-25T08:01:53.791Z","industry":"Technology","sustainability_rating":"A","esg_risk_level":"Medium-High","current_price":"243.31","market_cap":"70078494133.30","return_on_investment":"30.50","carbon_neutral_year":2040,"week_high_52":"294.95","week_low_52":"163.87","dividend_yield":"3.84","pe_ratio":"51.90","description":"Renewable Energy Group is at the forefront of renewable energy technology, specializing in clean power generation. Their environmental score of 86 reflects their commitment to sustainable practices. The company's innovative approach to renewable energy solutions positions them as a key player in the global transition to clean energy."},{"id":20,"name":"Plug Power","ticker":"PLUG","sector":"Green Hydrogen","esg_score":74,"environmental_score":81,"social_score":70,"governance_score":69,"yearly_trend":8,"created_at":"2025-04-25T08:01:53.857Z","updated_at":"2025-04-25T08:01:53.857Z","industry":"Technology","sustainability_rating":"A+","esg_risk_level":"Medium","current_price":"345.91","market_cap":"100558131139.14","return_on_investment":"16.85","carbon_neutral_year":2047,"week_high_52":"352.44","week_low_52":"214.17","dividend_yield":"1.61","pe_ratio":"18.25","description":"Plug Power is pioneering the development of green hydrogen solutions, contributing to the clean energy transition. With an environmental score of 81, they are committed to developing sustainable energy alternatives. Their innovative hydrogen technologies are paving the way for a carbon-neutral future."}];

const buyStockData = [{"id":1,"company_id":1,"current_price":"553.52","market_cap":"418272652528.72","week_high_52":"731.08","week_low_52":"345.05","yearly_trend":"8.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:17.690Z","updated_at":"2025-05-01T08:57:17.690Z"},{"id":2,"company_id":2,"current_price":"556.75","market_cap":"65056469664.75","week_high_52":"604.24","week_low_52":"441.94","yearly_trend":"4.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:17.841Z","updated_at":"2025-05-01T08:57:17.841Z"},{"id":3,"company_id":3,"current_price":"271.00","market_cap":"288523582757.00","week_high_52":"346.82","week_low_52":"168.46","yearly_trend":"6.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:17.973Z","updated_at":"2025-05-01T08:57:17.973Z"},{"id":4,"company_id":4,"current_price":"738.25","market_cap":"220435949299.25","week_high_52":"1053.37","week_low_52":"489.15","yearly_trend":"3.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.111Z","updated_at":"2025-05-01T08:57:18.111Z"},{"id":5,"company_id":5,"current_price":"430.21","market_cap":"368404773465.96","week_high_52":"437.09","week_low_52":"272.21","yearly_trend":"2.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.251Z","updated_at":"2025-05-01T08:57:18.251Z"},{"id":6,"company_id":8,"current_price":"814.63","market_cap":"284308405128.56","week_high_52":"995.91","week_low_52":"572.96","yearly_trend":"5.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.390Z","updated_at":"2025-05-01T08:57:18.390Z"},{"id":7,"company_id":9,"current_price":"845.58","market_cap":"690936678385.56","week_high_52":"945.30","week_low_52":"567.41","yearly_trend":"6.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.525Z","updated_at":"2025-05-01T08:57:18.525Z"},{"id":8,"company_id":10,"current_price":"138.26","market_cap":"66530012680.92","week_high_52":"192.98","week_low_52":"101.51","yearly_trend":"3.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.668Z","updated_at":"2025-05-01T08:57:18.668Z"},{"id":9,"company_id":11,"current_price":"908.69","market_cap":"902529918703.49","week_high_52":"1155.10","week_low_52":"617.21","yearly_trend":"4.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:18.834Z","updated_at":"2025-05-01T08:57:18.834Z"},{"id":10,"company_id":12,"current_price":"563.64","market_cap":"282966331595.64","week_high_52":"635.27","week_low_52":"432.37","yearly_trend":"7.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.027Z","updated_at":"2025-05-01T08:57:19.027Z"},{"id":11,"company_id":13,"current_price":"980.82","market_cap":"1022207664482.46","week_high_52":"1138.81","week_low_52":"704.13","yearly_trend":"4.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.164Z","updated_at":"2025-05-01T08:57:19.164Z"},{"id":12,"company_id":14,"current_price":"1047.06","market_cap":"659136531072.60","week_high_52":"1376.75","week_low_52":"820.94","yearly_trend":"3.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.302Z","updated_at":"2025-05-01T08:57:19.302Z"},{"id":13,"company_id":15,"current_price":"252.16","market_cap":"183087879668.48","week_high_52":"257.90","week_low_52":"159.58","yearly_trend":"5.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.435Z","updated_at":"2025-05-01T08:57:19.435Z"},{"id":14,"company_id":16,"current_price":"75.48","market_cap":"17412726208.08","week_high_52":"108.90","week_low_52":"54.93","yearly_trend":"6.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.575Z","updated_at":"2025-05-01T08:57:19.575Z"},{"id":15,"company_id":17,"current_price":"85.06","market_cap":"50910051658.00","week_high_52":"94.91","week_low_52":"62.74","yearly_trend":"7.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.709Z","updated_at":"2025-05-01T08:57:19.709Z"},{"id":16,"company_id":18,"current_price":"646.67","market_cap":"684233153916.84","week_high_52":"793.64","week_low_52":"515.86","yearly_trend":"4.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:19.868Z","updated_at":"2025-05-01T08:57:19.868Z"},{"id":17,"company_id":19,"current_price":"243.31","market_cap":"70078494133.30","week_high_52":"294.95","week_low_52":"163.87","yearly_trend":"5.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:20.007Z","updated_at":"2025-05-01T08:57:20.007Z"},{"id":18,"company_id":20,"current_price":"345.91","market_cap":"100558131139.14","week_high_52":"352.44","week_low_52":"214.17","yearly_trend":"8.00","min_investment":"1000.00","max_investment":"1000000.00","created_at":"2025-05-01T08:57:20.257Z","updated_at":"2025-05-01T08:57:20.257Z"}];

const BuyStockPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [shares, setShares] = useState('1');
  const [amount, setAmount] = useState('0');

  // Find company and stock data
  const company = companiesData.find(c => c.id === parseInt(id as string));
  const stockData = buyStockData.find(b => b.company_id === parseInt(id as string));

  useEffect(() => {
    if (stockData?.current_price) {
      const shareCount = parseInt(shares) || 0;
      const calculatedAmount = shareCount * parseFloat(stockData.current_price);
      setAmount(calculatedAmount.toFixed(2));
    }
  }, [shares, stockData]);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Purchased ${shares} shares of ${company?.name}`
      });
      navigate('/portfolio');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to purchase stock',
        variant: 'destructive'
      });
    }
  });

  const formatCurrency = (value: string) => {
    return '₹' + parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!company || !stockData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Company not found</div>
      </div>
    );
  }

  const minInvestment = parseFloat(stockData.min_investment);
  const maxInvestment = parseFloat(stockData.max_investment);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{company.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Price: {formatCurrency(stockData.current_price)}
              </p>
            </div>
            <div className="flex gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Market Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Market Cap</span>
                    <span>{formatCurrency(stockData.market_cap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week High</span>
                    <span>{formatCurrency(stockData.week_high_52)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 Week Low</span>
                    <span>{formatCurrency(stockData.week_low_52)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Purchase Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Number of Shares</label>
                    <Input
                      type="number"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-full"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Investment Amount</label>
                    <div className="px-2">
                      <Slider
                        min={minInvestment}
                        max={maxInvestment}
                        step={1000}
                        value={[parseFloat(amount)]}
                        onValueChange={(value) => {
                          const shareCount = Math.floor(value[0] / parseFloat(stockData.current_price));
                          setShares(shareCount.toString());
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Min: {formatCurrency(minInvestment.toString())}</span>
                      <span>Max: {formatCurrency(maxInvestment.toString())}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Total Amount</label>
                    <Input
                      type="text"
                      value={formatCurrency(amount)}
                      readOnly
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => purchaseMutation.mutate()}
            disabled={purchaseMutation.isPending || parseFloat(amount) === 0}
          >
            {purchaseMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <ArrowUp className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Confirm Purchase</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BuyStockPage;
