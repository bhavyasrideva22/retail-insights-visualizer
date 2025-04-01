
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartTooltip, Legend, ReferenceLine } from 'recharts';
import { Calculator, Download, Mail } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type CalculationMethod = 'cogs' | 'average';

interface CalculatorValues {
  costOfGoodsSold: number;
  beginningInventory: number;
  endingInventory: number;
  averageInventory: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const InventoryTurnoverCalculator: React.FC = () => {
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  
  const [method, setMethod] = useState<CalculationMethod>('cogs');
  const [values, setValues] = useState<CalculatorValues>({
    costOfGoodsSold: 1000000,
    beginningInventory: 250000,
    endingInventory: 150000,
    averageInventory: 200000
  });
  
  const [turnoverRatio, setTurnoverRatio] = useState<number>(0);
  const [daysToSell, setDaysToSell] = useState<number>(0);
  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  
  useEffect(() => {
    calculateResults();
  }, [values, method]);
  
  const calculateResults = () => {
    let inventoryValue: number;
    let ratio: number;
    
    if (method === 'cogs') {
      inventoryValue = (values.beginningInventory + values.endingInventory) / 2;
      ratio = values.costOfGoodsSold / inventoryValue;
    } else {
      inventoryValue = values.averageInventory;
      ratio = values.costOfGoodsSold / inventoryValue;
    }
    
    setTurnoverRatio(ratio);
    setDaysToSell(365 / ratio);
    
    // Update chart data
    setBenchmarkData([
      { name: 'Apparel', value: 4.5 },
      { name: 'Electronics', value: 5.2 },
      { name: 'Grocery', value: 12.8 },
      { name: 'Furniture', value: 2.3 },
      { name: 'General Retail', value: 3.8 },
    ]);
    
    setComparisonData([
      { name: 'Your Business', value: ratio },
      { name: 'Industry Avg.', value: 3.8 },
    ]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: parseFloat(value) || 0
    });
  };
  
  const handleMethodChange = (value: string) => {
    setMethod(value as CalculationMethod);
  };
  
  const generatePDF = async () => {
    if (!resultRef.current) return;
    
    try {
      toast({
        title: "Preparing your PDF...",
        description: "Please wait while we generate your report.",
      });
      
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add branded header
      pdf.setFillColor(36, 94, 79); // dark green
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Retail Insights Visualizer', 105, 15, { align: 'center' });
      
      // Add report title
      pdf.setTextColor(36, 94, 79);
      pdf.setFontSize(20);
      pdf.text('Inventory Turnover Analysis', 105, 40, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 50, { align: 'center' });
      
      // Add image of results
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 60, imgWidth, imgHeight);
      
      // Add footer
      pdf.setFillColor(36, 94, 79);
      pdf.rect(0, 282, 210, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text('© 2023 Retail Insights Visualizer | www.retailinsights.com', 105, 290, { align: 'center' });
      
      pdf.save('inventory-turnover-analysis.pdf');
      
      toast({
        title: "PDF Downloaded Successfully",
        description: "Your inventory turnover analysis has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
      });
    }
  };
  
  const sendEmail = () => {
    // In a real implementation, this would connect to a backend service
    toast({
      title: "Email Feature",
      description: "This would integrate with your email service to send the report. For now, please use the download option.",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in">
      <Card className="calculator-card">
        <CardHeader className="bg-primary rounded-t-xl text-white p-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Inventory Turnover Calculator</CardTitle>
          </div>
          <CardDescription className="text-gray-100 mt-2">
            Analyze how efficiently your retail business moves inventory and compare with industry benchmarks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="cogs" onValueChange={handleMethodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cogs">COGS Method</TabsTrigger>
              <TabsTrigger value="average">Average Inventory Method</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cogs" className="space-y-4 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="costOfGoodsSold" className="text-sm font-medium mb-1 block">
                    Cost of Goods Sold (₹)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="costOfGoodsSold"
                            name="costOfGoodsSold"
                            type="number"
                            value={values.costOfGoodsSold}
                            onChange={handleInputChange}
                            className="w-full border-gray-300"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total cost of inventory sold during the period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <Label htmlFor="beginningInventory" className="text-sm font-medium mb-1 block">
                    Beginning Inventory (₹)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="beginningInventory"
                            name="beginningInventory"
                            type="number"
                            value={values.beginningInventory}
                            onChange={handleInputChange}
                            className="w-full border-gray-300"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Value of inventory at the start of the period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <Label htmlFor="endingInventory" className="text-sm font-medium mb-1 block">
                    Ending Inventory (₹)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="endingInventory"
                            name="endingInventory"
                            type="number"
                            value={values.endingInventory}
                            onChange={handleInputChange}
                            className="w-full border-gray-300"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Value of inventory at the end of the period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="average" className="space-y-4 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="costOfGoodsSold" className="text-sm font-medium mb-1 block">
                    Cost of Goods Sold (₹)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="costOfGoodsSold"
                            name="costOfGoodsSold"
                            type="number"
                            value={values.costOfGoodsSold}
                            onChange={handleInputChange}
                            className="w-full border-gray-300"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total cost of inventory sold during the period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <Label htmlFor="averageInventory" className="text-sm font-medium mb-1 block">
                    Average Inventory Value (₹)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="averageInventory"
                            name="averageInventory"
                            type="number"
                            value={values.averageInventory}
                            onChange={handleInputChange}
                            className="w-full border-gray-300"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average value of inventory over the period</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div ref={resultRef} className="mt-8 p-6 bg-cream rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-primary mb-4">Your Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Inventory Turnover Ratio</h4>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-primary">{turnoverRatio.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-2 mb-1">times/year</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {turnoverRatio < 2 ? 
                    "Low turnover - consider reducing inventory levels" : 
                    turnoverRatio > 6 ? 
                      "High turnover - efficient inventory management" : 
                      "Average turnover - within normal retail range"}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Days Sales of Inventory (DSI)</h4>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-primary">{daysToSell.toFixed(0)}</span>
                  <span className="text-sm text-gray-500 ml-2 mb-1">days</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {daysToSell > 180 ? 
                    "Your inventory takes a long time to sell" : 
                    daysToSell < 60 ? 
                      "Your inventory sells very quickly" : 
                      "Your inventory sells at an average pace"}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-primary mb-4">Inventory Turnover Comparison</h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip formatter={(value) => [`${value.toFixed(2)} times`, 'Turnover Ratio']} />
                    <Legend />
                    <Bar dataKey="value" name="Turnover Ratio" fill="#245e4f" radius={[4, 4, 0, 0]} />
                    <ReferenceLine y={3.8} stroke="#e9c46a" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-primary mb-4">Industry Benchmarks</h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={benchmarkData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip formatter={(value) => [`${value.toFixed(2)} times`, 'Turnover Ratio']} />
                    <Legend />
                    <Bar dataKey="value" name="Turnover Ratio" fill="#7ac9a7" radius={[4, 4, 0, 0]} />
                    <ReferenceLine y={turnoverRatio} stroke="#e9c46a" strokeDasharray="3 3" label="Your Ratio" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mt-8 bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-primary mb-2">Calculation Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {method === 'cogs' ? (
                  <>
                    <p>Cost of Goods Sold: {formatCurrency(values.costOfGoodsSold)}</p>
                    <p>Beginning Inventory: {formatCurrency(values.beginningInventory)}</p>
                    <p>Ending Inventory: {formatCurrency(values.endingInventory)}</p>
                    <p>Average Inventory: {formatCurrency((values.beginningInventory + values.endingInventory) / 2)}</p>
                    <p className="font-medium mt-2">
                      Inventory Turnover = {formatCurrency(values.costOfGoodsSold)} ÷ {formatCurrency((values.beginningInventory + values.endingInventory) / 2)} = {turnoverRatio.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <>
                    <p>Cost of Goods Sold: {formatCurrency(values.costOfGoodsSold)}</p>
                    <p>Average Inventory: {formatCurrency(values.averageInventory)}</p>
                    <p className="font-medium mt-2">
                      Inventory Turnover = {formatCurrency(values.costOfGoodsSold)} ÷ {formatCurrency(values.averageInventory)} = {turnoverRatio.toFixed(2)}
                    </p>
                  </>
                )}
                <p className="font-medium">
                  Days Sales of Inventory = 365 ÷ {turnoverRatio.toFixed(2)} = {daysToSell.toFixed(0)} days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Use the buttons to save or share your results
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={sendEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Results
            </Button>
            <Button onClick={generatePDF} className="cta-button flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-12 space-y-8 max-w-4xl mx-auto">
        <section>
          <h2 className="section-title">Understanding Inventory Turnover</h2>
          <div className="info-text space-y-4">
            <p>
              Inventory turnover is a critical financial ratio that measures how efficiently a retail or e-commerce business 
              manages its inventory. It shows how many times a company sells and replaces its stock of goods during a specific period. 
              This ratio is particularly valuable for retailers and wholesalers where inventory management is crucial to business success.
            </p>
            <p>
              A higher inventory turnover ratio indicates efficient inventory management, strong sales, and minimal capital tied up in 
              inventory. Conversely, a lower ratio might suggest overstocking, obsolescence, or declining sales. The ideal inventory 
              turnover varies significantly by industry, with grocers typically having much higher turnover rates than jewelry or 
              furniture retailers.
            </p>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">How to Calculate Inventory Turnover</h3>
          <div className="info-text space-y-4">
            <p>
              There are two common methods to calculate inventory turnover:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>COGS Method (Preferred):</strong> Inventory Turnover = Cost of Goods Sold ÷ Average Inventory
                <p className="mt-1">
                  This method is generally more accurate because it uses the cost of inventory rather than the retail value of sales.
                </p>
              </li>
              <li>
                <strong>Sales Method:</strong> Inventory Turnover = Net Sales ÷ Average Inventory
                <p className="mt-1">
                  This alternative uses net sales instead of COGS and is sometimes used when cost information is unavailable.
                </p>
              </li>
            </ol>
            <p>
              Average inventory is typically calculated by adding the beginning and ending inventory values for the period and dividing by two. 
              For more accurate results, particularly when inventory levels fluctuate significantly, monthly or quarterly inventory values 
              may be used to calculate a more precise average.
            </p>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">Benefits of Monitoring Inventory Turnover</h3>
          <div className="info-text space-y-4">
            <p>
              Regular monitoring of your inventory turnover ratio offers numerous advantages for retail and e-commerce businesses:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Improved Cash Flow Management:</strong> Higher turnover means less cash is tied up in inventory, improving liquidity.
              </li>
              <li>
                <strong>Reduced Storage Costs:</strong> Efficient inventory management leads to lower warehousing, insurance, and handling expenses.
              </li>
              <li>
                <strong>Minimized Risk of Obsolescence:</strong> Faster-moving inventory reduces the risk of products becoming outdated or damaged in storage.
              </li>
              <li>
                <strong>Better Purchasing Decisions:</strong> Understanding turnover helps inform smarter buying patterns and order quantities.
              </li>
              <li>
                <strong>Competitive Pricing Strategies:</strong> Knowledge of inventory efficiency can inform pricing strategies to balance profitability and sales volume.
              </li>
            </ul>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">Industry-Specific Benchmarks</h3>
          <div className="info-text space-y-4">
            <p>
              Inventory turnover varies significantly across retail sectors due to differing product characteristics, seasonality, and 
              consumer behavior patterns. Here are typical ranges for various retail categories in India:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Grocery and FMCG:</strong> 12-20 times per year (perishability drives higher turnover)</li>
              <li><strong>Fashion and Apparel:</strong> 4-6 times per year (seasonal collections affect turnover)</li>
              <li><strong>Consumer Electronics:</strong> 5-7 times per year (rapid technology changes impact management)</li>
              <li><strong>Furniture and Home Goods:</strong> 2-4 times per year (slower movement due to higher price points)</li>
              <li><strong>Jewelry and Luxury Items:</strong> 1-3 times per year (high value and selective purchasing patterns)</li>
            </ul>
            <p>
              Remember that these benchmarks should be considered guidelines rather than strict targets. Your optimal inventory 
              turnover will depend on your specific business model, pricing strategy, market positioning, and growth objectives.
            </p>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">Strategies to Improve Inventory Turnover</h3>
          <div className="info-text space-y-4">
            <p>
              If your inventory turnover ratio is lower than industry benchmarks or your business goals, consider implementing these strategies:
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Implement Just-in-Time (JIT) Inventory:</strong> Reduce excess stock by adopting JIT practices that synchronize inventory 
                orders with sales patterns and demand forecasts.
              </li>
              <li>
                <strong>Use ABC Analysis:</strong> Categorize inventory into high-value/high-movement (A), moderate-value/moderate-movement (B), 
                and low-value/low-movement (C) items to focus management efforts appropriately.
              </li>
              <li>
                <strong>Improve Demand Forecasting:</strong> Utilize historical data, seasonal trends, and market research to better predict 
                future inventory needs and reduce both stockouts and overstocking.
              </li>
              <li>
                <strong>Review Pricing Strategies:</strong> Adjust pricing on slow-moving items to increase sales velocity without significantly 
                impacting margins.
              </li>
              <li>
                <strong>Enhance Supplier Relationships:</strong> Negotiate better terms with suppliers, including smaller but more frequent 
                deliveries, consignment options, or vendor-managed inventory arrangements.
              </li>
              <li>
                <strong>Implement Cross-selling and Upselling:</strong> Increase sales volume of existing inventory by training staff to suggest 
                complementary products or premium alternatives.
              </li>
              <li>
                <strong>Streamline Product Mix:</strong> Regularly evaluate product performance and consider discontinuing consistently poor-performing items.
              </li>
            </ol>
            <p>
              Remember that the goal isn't necessarily to maximize turnover at all costs but to find the optimal balance between 
              inventory availability and efficient capital use for your specific business context.
            </p>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">Days Sales of Inventory (DSI)</h3>
          <div className="info-text space-y-4">
            <p>
              Days Sales of Inventory (DSI), also known as Days Inventory Outstanding (DIO), is a complementary metric to inventory turnover. 
              While inventory turnover tells you how many times you sell through your inventory in a period, DSI tells you approximately how many 
              days it takes to convert inventory into sales.
            </p>
            <p>
              The formula for calculating DSI is:
            </p>
            <div className="bg-white p-3 rounded-md border border-gray-200 my-3 text-center">
              <strong>DSI = 365 days ÷ Inventory Turnover Ratio</strong>
            </div>
            <p>
              For example, if your inventory turnover ratio is 5, your DSI would be 365 ÷ 5 = 73 days. This means it takes approximately 73 days 
              to sell through your entire inventory.
            </p>
            <p>
              Lower DSI values indicate more efficient inventory management, but as with turnover ratios, the optimal range depends on your industry, 
              business model, and strategy. Fast-fashion retailers might target a DSI of 30-45 days, while furniture retailers might comfortably 
              operate with a DSI of 120-150 days.
            </p>
          </div>
        </section>
        
        <section>
          <h3 className="subsection-title">Conclusion</h3>
          <div className="info-text space-y-4">
            <p>
              Inventory turnover is more than just a financial metric—it's a window into the operational health of your retail or e-commerce business. 
              By regularly calculating and analyzing this ratio, you can make more informed decisions about purchasing, pricing, merchandising, and 
              overall inventory management.
            </p>
            <p>
              Remember that context matters: Always interpret your inventory turnover in light of your specific industry benchmarks, seasonal patterns, 
              and business strategy. The "right" turnover ratio is one that balances customer service levels (having products available when needed) 
              with financial efficiency (minimizing capital tied up in inventory).
            </p>
            <p>
              Use our calculator as part of your regular business analysis routine to track improvements in your inventory management efficiency over time, 
              compare performance across different product categories, and identify opportunities for strategic adjustments to your inventory practices.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryTurnoverCalculator;
