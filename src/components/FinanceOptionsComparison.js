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

const FinanceOptionsComparison = ({ formData }) => {
  const theme = useTheme();
  
  // Extract and parse form data
  const purchasePrice = parseFloat(formData.purchasePrice) || 0;
  const renovationCost = parseFloat(formData.renovationCost) || 0;
  const expectedSellingPrice = parseFloat(formData.expectedSellingPrice) || 0;
  const sellingCostPercent = parseFloat(formData.sellingCosts) || 8;
  const downPaymentPercent = parseFloat(formData.downPayment) || 20;
  const interestRate = parseFloat(formData.interestRate) || 7.5;
  const holdingPeriod = parseInt(formData.holdingPeriod) || 6;
  const monthlyExpenses = parseFloat(formData.monthlyExpenses) || 0;

  // Define the finance options with their characteristics
  const financeOptions = [
    {
      name: 'Cash Purchase',
      downPaymentPercent: 100,
      interestRate: 0,
      loanPoints: 0,
      otherFees: 0,
      color: theme.palette.primary.main
    },
    {
      name: 'Conventional Loan',
      downPaymentPercent: downPaymentPercent,
      interestRate: interestRate,
      loanPoints: 1, // 1% in points
      otherFees: 2500, // Closing costs, etc.
      color: theme.palette.secondary.main
    },
    {
      name: 'Hard Money Loan',
      downPaymentPercent: 15,
      interestRate: 12, // Higher interest rate
      loanPoints: 2.5, // 2.5% in points
      otherFees: 1500, // Other fees
      color: theme.palette.error.main
    }
  ];

  // Calculate metrics for each finance option
  const calculatedOptions = financeOptions.map(option => {
    // Initial investments
    const downPaymentAmount = (purchasePrice * option.downPaymentPercent) / 100;
    const loanAmount = purchasePrice - downPaymentAmount;
    const loanPoints = (loanAmount * option.loanPoints) / 100;
    
    // Calculate monthly payment using the formula for monthly mortgage payment
    const monthlyRate = option.interestRate / 100 / 12;
    
    // For fix and flip loans, we typically calculate interest only
    let monthlyLoanPayment = 0;
    let totalInterest = 0;
    
    if (option.interestRate === 0) {
      // Cash purchase - no interest payments
      monthlyLoanPayment = 0;
      totalInterest = 0;
    } else {
      // For interest-only loans common in flipping (simpler calculation)
      monthlyLoanPayment = loanAmount * monthlyRate;
      totalInterest = monthlyLoanPayment * holdingPeriod;
    }
    
    // Total expenses
    const totalHoldingCosts = monthlyExpenses * holdingPeriod;
    const sellingCosts = (expectedSellingPrice * sellingCostPercent) / 100;
    
    // Calculate total investment and profit
    const totalInvestment = downPaymentAmount + renovationCost + loanPoints + option.otherFees + totalInterest + totalHoldingCosts;
    const netProfit = expectedSellingPrice - purchasePrice - renovationCost - totalInterest - loanPoints - option.otherFees - totalHoldingCosts - sellingCosts;
    
    // Calculate ROI
    const roi = (netProfit / totalInvestment) * 100;
    
    // Break-even analysis
    const breakEvenPrice = purchasePrice + renovationCost + totalInterest + loanPoints + option.otherFees + totalHoldingCosts + sellingCosts;
    
    // Cash on cash calculation
    const initialCashOutlay = downPaymentAmount + renovationCost + loanPoints + option.otherFees;
    const cashOnCash = (netProfit / initialCashOutlay) * 100;
    
    return {
      ...option,
      downPaymentAmount,
      loanAmount,
      loanPoints,
      monthlyLoanPayment,
      totalInterest,
      totalHoldingCosts,
      totalInvestment,
      netProfit,
      roi,
      breakEvenPrice,
      cashOnCash,
      initialCashOutlay
    };
  });

  // Prepare chart data for ROI comparison
  const roiSeries = [{
    name: 'Return on Investment (%)',
    data: calculatedOptions.map(option => parseFloat(option.roi.toFixed(2)))
  }];
  
  const roiOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: calculatedOptions.map(option => option.name),
    },
    yaxis: {
      title: {
        text: 'ROI (%)'
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(1) + '%';
        }
      }
    },
    fill: {
      colors: calculatedOptions.map(option => option.color)
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + '%';
        }
      }
    }
  };

  // Prepare chart data for cash-on-cash comparison
  const cashOnCashSeries = [{
    name: 'Cash on Cash Return (%)',
    data: calculatedOptions.map(option => parseFloat(option.cashOnCash.toFixed(2)))
  }];
  
  const cashOnCashOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: calculatedOptions.map(option => option.name),
    },
    yaxis: {
      title: {
        text: 'Cash on Cash Return (%)'
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(1) + '%';
        }
      }
    },
    fill: {
      colors: calculatedOptions.map(option => option.color)
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + '%';
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
        Financing Options Comparison
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{option.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Down Payment</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.downPaymentAmount)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Loan Amount</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.loanAmount)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Interest Rate</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{option.interestRate}%</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Loan Points & Fees</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.loanPoints + option.otherFees)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Monthly Payment</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.monthlyLoanPayment)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Total Interest Paid</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.totalInterest)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Total Cash Investment</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.initialCashOutlay)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Break-even Sale Price</TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right">{formatCurrency(option.breakEvenPrice)}</TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>Net Profit</strong></TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right"><strong>{formatCurrency(option.netProfit)}</strong></TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>ROI</strong></TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right"><strong>{option.roi.toFixed(2)}%</strong></TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>Cash on Cash Return</strong></TableCell>
                {calculatedOptions.map((option, index) => (
                  <TableCell key={index} align="right"><strong>{option.cashOnCash.toFixed(2)}%</strong></TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        ROI Comparison
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
        Cash on Cash Return Comparison
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Chart
          options={cashOnCashOptions}
          series={cashOnCashSeries}
          type="bar"
          height={300}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This comparison helps you understand the impact of different financing options.
        Cash purchases typically offer higher ROI but lower cash-on-cash returns due to the larger initial investment.
        Leveraged options (conventional and hard money loans) often provide higher cash-on-cash returns but come with increased costs and risks.
      </Typography>
    </Paper>
  );
};

export default FinanceOptionsComparison; 