import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme
} from '@mui/material';
import Chart from 'react-apexcharts';

const ExitStrategyComparison = ({ formData }) => {
  const theme = useTheme();
  
  // Parse form data
  const purchasePrice = parseFloat(formData.purchasePrice) || 0;
  const renovationCost = parseFloat(formData.renovationCost) || 0;
  const expectedSellingPrice = parseFloat(formData.expectedSellingPrice) || 0;
  const sellingCostPercent = parseFloat(formData.sellingCosts) || 8;
  const downPaymentPercent = parseFloat(formData.downPayment) || 20;
  const interestRate = parseFloat(formData.interestRate) || 7.5;
  const holdingPeriod = parseInt(formData.holdingPeriod) || 6;
  const monthlyExpenses = parseFloat(formData.monthlyExpenses) || 0;
  const expectedMonthlyRent = parseFloat(formData.expectedMonthlyRent) || 0;

  // Calculate downPayment before it's used
  const downPayment = (purchasePrice * downPaymentPercent) / 100;

  // If no rent is provided, use a reasonable estimate
  const monthlyRent = expectedMonthlyRent > 0 ? 
    expectedMonthlyRent : 
    Math.round((expectedSellingPrice * 0.008)); // Rough estimate of 0.8% of ARV

  // Define constants for rental analysis
  const annualAppreciationRate = 0.03; // 3% annual appreciation
  const annualInflationRate = 0.02; // 2% annual inflation
  const realAppreciationRate = annualAppreciationRate - annualInflationRate; // Real appreciation after inflation
  const propertyManagementFee = 0.1; // 10% of rent
  const maintenancePercent = 0.05; // 5% of rent
  const vacancyRate = 0.08; // 8% vacancy
  const rentIncreaseRate = 0.02; // 2% annual rent increase
  const sellingCostAfterRental = 0.07; // 7% selling cost after rental period
  
  // Flip strategy calculations
  const sellingCosts = (expectedSellingPrice * sellingCostPercent) / 100;
  const totalInvestment = downPayment + renovationCost + (monthlyExpenses * holdingPeriod);
  const netFlipProfit = expectedSellingPrice - sellingCosts - purchasePrice - renovationCost - (monthlyExpenses * holdingPeriod);
  const flipROI = (netFlipProfit / totalInvestment) * 100;
  // Corrected annualized flip ROI calculation: ROI per month * 12
  const annualizedFlipROI = (flipROI / holdingPeriod) * 12;
  
  // Rental strategy calculations for 5 years
  const yearsToHold = 5;
  const afterRepairValue = expectedSellingPrice;
  
  // Calculate mortgage details for rental
  const loanAmount = purchasePrice - downPayment;
  const loanTermYears = 30;
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  
  const monthlyMortgagePayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
    (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
  
  // Rental cash flow and appreciation by year
  const rentalAnalysis = Array.from({length: yearsToHold}, (_, year) => {
    // Calculate appreciation
    const appreciatedValue = afterRepairValue * Math.pow(1 + annualAppreciationRate, year + 1);
    
    // Calculate adjusted rent for the year
    const adjustedMonthlyRent = monthlyRent * Math.pow(1 + rentIncreaseRate, year);
    const annualRentalIncome = adjustedMonthlyRent * 12;
    
    // Calculate expenses
    const vacancyLoss = annualRentalIncome * vacancyRate;
    const propertyManagement = annualRentalIncome * propertyManagementFee;
    const maintenance = annualRentalIncome * maintenancePercent;
    const propertyTaxes = afterRepairValue * 0.015; // Estimate 1.5% of ARV
    const insurance = afterRepairValue * 0.005; // Estimate 0.5% of ARV
    const annualMortgage = monthlyMortgagePayment * 12;
    
    // Total expenses and cash flow
    const totalExpenses = vacancyLoss + propertyManagement + maintenance + propertyTaxes + insurance + annualMortgage;
    const annualCashFlow = annualRentalIncome - totalExpenses;
    
    // Calculate remaining loan balance
    const remainingLoanBalance = calculateRemainingLoanBalance(
      loanAmount, 
      monthlyInterestRate, 
      totalPayments, 
      (year + 1) * 12
    );
    
    // Calculate equity
    const equity = appreciatedValue - remainingLoanBalance;
    
    // Calculate ROI components
    const cashOnCashReturn = (annualCashFlow / (downPayment + renovationCost)) * 100;
    const equityGain = appreciatedValue - afterRepairValue;
    const principalPaydown = loanAmount - remainingLoanBalance;
    
    return {
      year: year + 1,
      appreciatedValue,
      adjustedMonthlyRent,
      annualRentalIncome,
      vacancyLoss,
      propertyManagement,
      maintenance,
      propertyTaxes,
      insurance,
      annualMortgage,
      totalExpenses,
      annualCashFlow,
      remainingLoanBalance,
      equity,
      cashOnCashReturn,
      equityGain,
      principalPaydown
    };
  });
  
  // Calculate selling after 5 years
  const finalYearAnalysis = rentalAnalysis[yearsToHold - 1];
  const sellingCostAfterHolding = finalYearAnalysis.appreciatedValue * sellingCostAfterRental;
  const netProceedsFromSale = finalYearAnalysis.appreciatedValue - finalYearAnalysis.remainingLoanBalance - sellingCostAfterHolding;
  
  // Calculate total profit from rental + sale
  const totalRentalCashFlow = rentalAnalysis.reduce((sum, year) => sum + year.annualCashFlow, 0);
  
  // Breaking down the rental return components
  const totalAppreciation = finalYearAnalysis.appreciatedValue - afterRepairValue;
  const totalPrincipalPaydown = loanAmount - finalYearAnalysis.remainingLoanBalance;
  
  // Fix total rental profit calculation: cash flow + equity from sale - initial investment (correcting double counting)
  const rentalInitialInvestment = downPayment + renovationCost;
  const totalRentalProfit = totalRentalCashFlow + netProceedsFromSale - rentalInitialInvestment;
  
  // Calculate corrected ROI for rental + sale strategy
  const rentalROI = (totalRentalProfit / rentalInitialInvestment) * 100;
  const annualizedRentalROI = rentalROI / yearsToHold;
  
  // Helper function to calculate remaining loan balance
  function calculateRemainingLoanBalance(principal, monthlyRate, totalPayments, paymentsMade) {
    return principal * 
      (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
  
  // Prepare data for comparison chart
  const comparisonData = [
    { 
      strategy: 'Flip Now', 
      totalProfit: netFlipProfit,
      annualizedROI: annualizedFlipROI,
      timeframe: `${holdingPeriod} months`,
      risk: 'Lower',
      liquidity: 'Higher',
      color: theme.palette.primary.main
    },
    { 
      strategy: 'Rent for 5 Years', 
      totalProfit: totalRentalProfit,
      annualizedROI: annualizedRentalROI,
      timeframe: '5 years',
      risk: 'Higher',
      liquidity: 'Lower',
      color: theme.palette.secondary.main
    }
  ];

  // Prepare breakdown data for rental profit
  const rentalProfitBreakdown = [
    { name: 'Cash Flow', value: totalRentalCashFlow },
    { name: 'Appreciation', value: totalAppreciation },
    { name: 'Principal Paydown', value: totalPrincipalPaydown },
    { name: 'Selling Costs', value: -sellingCostAfterHolding }
  ];
  
  // Prepare chart series for profit comparison
  const profitSeries = [
    {
      name: 'Total Profit',
      data: comparisonData.map(item => parseFloat(item.totalProfit.toFixed(0)))
    }
  ];
  
  const profitOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: comparisonData.map(item => item.color),
    xaxis: {
      categories: comparisonData.map(item => item.strategy),
    },
    yaxis: {
      title: {
        text: 'Total Profit ($)'
      },
      labels: {
        formatter: function (val) {
          return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    }
  };
  
  // Prepare chart series for ROI comparison
  const roiSeries = [
    {
      name: 'Annualized ROI',
      data: comparisonData.map(item => parseFloat(item.annualizedROI.toFixed(2)))
    }
  ];
  
  const roiOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: comparisonData.map(item => item.color),
    xaxis: {
      categories: comparisonData.map(item => item.strategy),
    },
    yaxis: {
      title: {
        text: 'Annualized ROI (%)'
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(1) + '%';
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + '%';
        }
      }
    }
  };

  // Prepare chart for rental profit breakdown
  const rentalBreakdownSeries = [
    {
      name: 'Components',
      data: rentalProfitBreakdown.map(item => parseFloat(item.value.toFixed(0)))
    }
  ];
  
  const rentalBreakdownOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: [
      theme.palette.success.main, 
      theme.palette.info.main, 
      theme.palette.warning.main, 
      theme.palette.error.main
    ],
    xaxis: {
      categories: rentalProfitBreakdown.map(item => item.name),
      labels: {
        formatter: function (val) {
          return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    }
  };

  // Prepare cash flow data for 5-year rental scenario
  const cashFlowSeries = [
    {
      name: 'Annual Cash Flow',
      data: rentalAnalysis.map(year => parseFloat(year.annualCashFlow.toFixed(0)))
    },
    {
      name: 'Property Value',
      data: rentalAnalysis.map(year => parseFloat(year.appreciatedValue.toFixed(0)))
    }
  ];
  
  const cashFlowOptions = {
    chart: {
      type: 'line',
      height: 350
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth'
    },
    colors: [theme.palette.success.main, theme.palette.info.main],
    xaxis: {
      categories: rentalAnalysis.map(year => `Year ${year.year}`),
    },
    yaxis: [
      {
        title: {
          text: 'Annual Cash Flow ($)'
        },
        labels: {
          formatter: function (val) {
            return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Property Value ($)'
        },
        labels: {
          formatter: function (val) {
            return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
          }
        }
      }
    ],
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    }
  };

  // Format number as currency
  const formatCurrency = (value) => {
    return '$' + value.toLocaleString(undefined, {maximumFractionDigits: 0});
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Exit Strategy Comparison
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{strategy.strategy}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total Profit</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{formatCurrency(strategy.totalProfit)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Annualized ROI</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{strategy.annualizedROI.toFixed(2)}%</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Timeframe</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{strategy.timeframe}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Risk Level</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{strategy.risk}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Liquidity</TableCell>
                {comparisonData.map((strategy, index) => (
                  <TableCell key={index} align="right">{strategy.liquidity}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Total Profit Comparison
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Chart
          options={profitOptions}
          series={profitSeries}
          type="bar"
          height={300}
        />
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Rental Profit Breakdown
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Chart
          options={rentalBreakdownOptions}
          series={rentalBreakdownSeries}
          type="bar"
          height={300}
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Key Assumptions:</Typography>
          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Annual Appreciation Rate:</span>
            <span>{(annualAppreciationRate * 100).toFixed(1)}%</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Annual Inflation Rate:</span>
            <span>{(annualInflationRate * 100).toFixed(1)}%</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Real Appreciation Rate (after inflation):</span>
            <span>{(realAppreciationRate * 100).toFixed(1)}%</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Rental Income Increase Rate:</span>
            <span>{(rentIncreaseRate * 100).toFixed(1)}%</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Vacancy Rate:</span>
            <span>{(vacancyRate * 100).toFixed(1)}%</span>
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Note: Negative cash flow in early years may be offset by appreciation and equity gains over time.
          {totalRentalCashFlow < 0 && " In this scenario, cash flow is negative, but property appreciation and loan principal reduction contribute to the overall profit."}
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Annualized ROI Comparison
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Chart
          options={roiOptions}
          series={roiSeries}
          type="bar"
          height={300}
        />
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        5-Year Rental Scenario Analysis
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Chart
          options={cashFlowOptions}
          series={cashFlowSeries}
          type="line"
          height={350}
        />
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Rental Property Cash Flow Details (Year 1)
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Monthly</TableCell>
                <TableCell align="right">Annual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Rental Income</TableCell>
                <TableCell align="right">{formatCurrency(monthlyRent)}</TableCell>
                <TableCell align="right">{formatCurrency(monthlyRent * 12)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Vacancy Loss ({(vacancyRate * 100).toFixed(0)}%)</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * vacancyRate)}</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * 12 * vacancyRate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Property Management ({(propertyManagementFee * 100).toFixed(0)}%)</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * propertyManagementFee)}</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * 12 * propertyManagementFee)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Maintenance ({(maintenancePercent * 100).toFixed(0)}%)</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * maintenancePercent)}</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyRent * 12 * maintenancePercent)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Property Taxes</TableCell>
                <TableCell align="right">-{formatCurrency(afterRepairValue * 0.015 / 12)}</TableCell>
                <TableCell align="right">-{formatCurrency(afterRepairValue * 0.015)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Insurance</TableCell>
                <TableCell align="right">-{formatCurrency(afterRepairValue * 0.005 / 12)}</TableCell>
                <TableCell align="right">-{formatCurrency(afterRepairValue * 0.005)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 4 }}>Less: Mortgage Payment</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyMortgagePayment)}</TableCell>
                <TableCell align="right">-{formatCurrency(monthlyMortgagePayment * 12)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>Net Cash Flow</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(rentalAnalysis[0].annualCashFlow / 12)}</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(rentalAnalysis[0].annualCashFlow)}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cash on Cash Return</TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right">{rentalAnalysis[0].cashOnCashReturn.toFixed(2)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This comparison helps you decide between selling immediately or holding as a rental property. 
        The flip strategy provides quicker returns with less risk, while the rental strategy potentially offers higher total returns through appreciation and equity building, but requires more management and patience.
        {totalRentalCashFlow < 0 ? " Note that in this scenario, the rental option shows negative cash flow, meaning you would need to contribute additional funds monthly to cover expenses." : ""}
      </Typography>
    </Paper>
  );
};

export default ExitStrategyComparison; 