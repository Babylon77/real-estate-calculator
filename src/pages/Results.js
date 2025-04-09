import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Divider,
  Chip,
  LinearProgress,
  Slider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

// Import the new components
import TimelineVisualization from '../components/TimelineVisualization';
import FinanceOptionsComparison from '../components/FinanceOptionsComparison';
import ExitStrategyComparison from '../components/ExitStrategyComparison';

// Renovation cost constants
const RENOVATION_COST_ESTIMATES = {
  teardown: { base: 100, range: [80, 150] },
  poor: { base: 60, range: [50, 80] },
  fair: { base: 35, range: [25, 45] },
  good: { base: 15, range: [10, 25] }
};

// Regional cost multipliers
const REGIONAL_MULTIPLIERS = {
  'AL': 0.85, 'AK': 1.25, 'AZ': 0.95, 'AR': 0.85, 'CA': 1.35, 'CO': 1.10, 
  'CT': 1.15, 'DE': 1.05, 'FL': 0.95, 'GA': 0.90, 'HI': 1.40, 'ID': 0.90,
  'IL': 1.05, 'IN': 0.90, 'IA': 0.90, 'KS': 0.90, 'KY': 0.90, 'LA': 0.90,
  'ME': 1.00, 'MD': 1.10, 'MA': 1.25, 'MI': 1.00, 'MN': 1.05, 'MS': 0.85,
  'MO': 0.90, 'MT': 0.95, 'NE': 0.90, 'NV': 1.05, 'NH': 1.05, 'NJ': 1.20,
  'NM': 0.90, 'NY': 1.35, 'NC': 0.90, 'ND': 0.95, 'OH': 0.95, 'OK': 0.85,
  'OR': 1.10, 'PA': 1.05, 'RI': 1.15, 'SC': 0.90, 'SD': 0.90, 'TN': 0.90,
  'TX': 0.90, 'UT': 0.95, 'VT': 1.05, 'VA': 1.00, 'WA': 1.15, 'WV': 0.90,
  'WI': 1.00, 'WY': 0.95, 'DC': 1.30
};

// DIY discount factors
const DIY_FACTORS = {
  'significant': 0.6, // 40% savings
  'minimal': 0.85,    // 15% savings
  'gc': 0.9,          // 10% savings with you as GC
  'none': 1.0         // No savings
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Update how numbers are displayed
function formatCurrency(value) {
  return value.toLocaleString(undefined, {maximumFractionDigits: 0});
}

function formatPercent(value) {
  return value.toFixed(1);
}

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData: initialFormData } = location.state || {};
  const [formData, setFormData] = useState(initialFormData || {});

  if (!formData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No calculation data available
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={() => navigate('/calculator')}
            sx={{ mt: 2 }}
          >
            Go to Calculator
          </Button>
        </Paper>
      </Container>
    );
  }

  // Calculate results
  const purchasePrice = parseFloat(formData.purchasePrice);
  const downPayment = (purchasePrice * parseFloat(formData.downPayment)) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyInterestRate = parseFloat(formData.interestRate) / 100 / 12;
  const numberOfPayments = parseFloat(formData.loanTerm) * 12;
  const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  const renovationCost = parseFloat(formData.renovationCost);
  const holdingPeriod = parseFloat(formData.holdingPeriod);
  const monthlyExpenses = parseFloat(formData.monthlyExpenses);
  const totalHoldingCosts = (monthlyPayment + monthlyExpenses) * holdingPeriod;
  
  const expectedSellingPrice = parseFloat(formData.expectedSellingPrice);
  const sellingCosts = (expectedSellingPrice * parseFloat(formData.sellingCosts)) / 100;
  
  const totalInvestment = downPayment + renovationCost + totalHoldingCosts;
  const netProfit = expectedSellingPrice - sellingCosts - purchasePrice - renovationCost - totalHoldingCosts;
  const roi = (netProfit / totalInvestment) * 100;

  // Key metrics for house flipping
  const arvToPurchaseRatio = expectedSellingPrice / purchasePrice;
  const renovationToArvRatio = (renovationCost / expectedSellingPrice) * 100;
  const annualizedROI = (roi / holdingPeriod) * 12;
  const monthlyROI = roi / holdingPeriod;
  const totalReturn = (netProfit / totalInvestment) * 100;

  // Deal quality assessment
  const getDealQuality = () => {
    if (roi >= 30 && arvToPurchaseRatio >= 1.3 && renovationToArvRatio <= 20) return 'Excellent';
    if (roi >= 20 && arvToPurchaseRatio >= 1.2 && renovationToArvRatio <= 25) return 'Good';
    if (roi >= 10 && arvToPurchaseRatio >= 1.1 && renovationToArvRatio <= 30) return 'Fair';
    return 'Poor';
  };

  const dealQuality = getDealQuality();
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excellent': return 'primary';
      case 'Good': return 'primary';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'primary';
    }
  };

  // Function to generate executive summary for the report
  const getExecutiveSummary = (roi, arvToPurchaseRatio, renovationToArvRatio) => {
    if (roi >= 25 && arvToPurchaseRatio >= 1.3 && renovationToArvRatio <= 20) {
      return "This property shows excellent potential with strong ROI, favorable ARV to purchase ratio, and efficient renovation costs. Recommended for investment.";
    } else if (roi >= 20 && arvToPurchaseRatio >= 1.2 && renovationToArvRatio <= 25) {
      return "This property shows good potential with solid ROI and acceptable renovation costs relative to value. Consider moving forward with appropriate risk management.";
    } else if (roi >= 15 && arvToPurchaseRatio >= 1.15) {
      return "This property shows fair potential but with tighter margins. Careful management of renovation costs and timeline will be crucial to profitability.";
    } else {
      return "This property presents significant challenges with limited profit potential. Consider renegotiating purchase price or seeking a better opportunity.";
    }
  };

  // Data for charts
  const investmentBreakdown = [
    { name: 'Down Payment', value: downPayment },
    { name: 'Renovation', value: renovationCost },
    { name: 'Holding Costs', value: totalHoldingCosts },
  ];

  const handleSliderChange = (name) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValue.toString()
    }));
  };

  const handleInputChange = (name) => (event) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value
    }));
  };

  const generateLenderReport = () => {
    // Create a new window for the report
    const reportWindow = window.open('', '_blank');
    
    // Calculate important metrics that might be needed in the report
    const downPayment = (purchasePrice * parseFloat(formData.downPayment || 20)) / 100;
    
    // Calculate what-if scenarios (expanded)
    const scenarios = {
      purchasePrice: {
        optimistic: purchasePrice * 0.9, // 10% lower
        pessimistic: purchasePrice * 1.1, // 10% higher
      },
      arv: {
        optimistic: expectedSellingPrice * 1.1, // 10% higher
        pessimistic: expectedSellingPrice * 0.9, // 10% lower
      },
      renovationCost: {
        optimistic: renovationCost * 0.9, // 10% lower
        pessimistic: renovationCost * 1.1, // 10% higher
        extreme: renovationCost * 1.3, // 30% higher (common scenario)
      },
      holdingPeriod: {
        optimistic: holdingPeriod * 0.8, // 20% shorter
        pessimistic: holdingPeriod * 1.2, // 20% longer
        extreme: holdingPeriod * 2, // Double time (extreme but common)
      },
      sellingCosts: {
        optimistic: parseFloat(formData.sellingCosts) * 0.8, // 20% lower selling costs
        pessimistic: parseFloat(formData.sellingCosts) * 1.2, // 20% higher selling costs
      },
      interestRate: {
        optimistic: parseFloat(formData.interestRate) * 0.9, // 10% lower rate
        pessimistic: parseFloat(formData.interestRate) * 1.1, // 10% higher rate
      }
    };

    // Calculate ROI for each scenario (expanded)
    const calculateScenarioROI = (purchase, arv, renovation, holding, sellingCostsPct = parseFloat(formData.sellingCosts), interestRate = parseFloat(formData.interestRate)) => {
      const dp = (purchase * parseFloat(formData.downPayment)) / 100;
      const loan = purchase - dp;
      const monthlyRate = interestRate / 100 / 12;
      const payments = parseFloat(formData.loanTerm) * 12;
      const monthlyPayment = loan * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
      const holdingCosts = (monthlyPayment + monthlyExpenses) * holding;
      const totalInvestment = dp + renovation + holdingCosts;
      const sellingCosts = (arv * sellingCostsPct) / 100;
      const netProfit = arv - sellingCosts - purchase - renovation - holdingCosts;
      return {
        roi: (netProfit / totalInvestment) * 100,
        netProfit: netProfit,
        totalInvestment: totalInvestment
      };
    };

    // Base scenario
    const baseScenario = calculateScenarioROI(
      purchasePrice, 
      expectedSellingPrice, 
      renovationCost, 
      holdingPeriod
    );

    // Create individual what-if scenarios
    const individualScenarios = [
      {
        name: 'Base Case',
        ...baseScenario
      },
      {
        name: 'Purchase Price +10%',
        ...calculateScenarioROI(
          scenarios.purchasePrice.pessimistic,
          expectedSellingPrice,
          renovationCost,
          holdingPeriod
        )
      },
      {
        name: 'Purchase Price -10%',
        ...calculateScenarioROI(
          scenarios.purchasePrice.optimistic,
          expectedSellingPrice,
          renovationCost,
          holdingPeriod
        )
      },
      {
        name: 'ARV +10%',
        ...calculateScenarioROI(
          purchasePrice,
          scenarios.arv.optimistic,
          renovationCost,
          holdingPeriod
        )
      },
      {
        name: 'ARV -10%',
        ...calculateScenarioROI(
          purchasePrice,
          scenarios.arv.pessimistic,
          renovationCost,
          holdingPeriod
        )
      },
      {
        name: 'Renovation +10%',
        ...calculateScenarioROI(
          purchasePrice,
          expectedSellingPrice,
          scenarios.renovationCost.pessimistic,
          holdingPeriod
        )
      },
      {
        name: 'Renovation +30%',
        ...calculateScenarioROI(
          purchasePrice,
          expectedSellingPrice,
          scenarios.renovationCost.extreme,
          holdingPeriod
        )
      },
      {
        name: 'Holding Period x2',
        ...calculateScenarioROI(
          purchasePrice,
          expectedSellingPrice,
          renovationCost,
          scenarios.holdingPeriod.extreme
        )
      },
      {
        name: 'Selling Costs +20%',
        ...calculateScenarioROI(
          purchasePrice,
          expectedSellingPrice,
          renovationCost,
          holdingPeriod,
          scenarios.sellingCosts.pessimistic
        )
      },
      {
        name: 'Interest Rate +10%',
        ...calculateScenarioROI(
          purchasePrice,
          expectedSellingPrice,
          renovationCost,
          holdingPeriod,
          parseFloat(formData.sellingCosts),
          scenarios.interestRate.pessimistic
        )
      }
    ];

    // Calculate combined what-if scenarios
    const scenarioROIs = {
      base: baseScenario.roi,
      optimistic: calculateScenarioROI(
        scenarios.purchasePrice.optimistic,
        scenarios.arv.optimistic,
        scenarios.renovationCost.optimistic,
        scenarios.holdingPeriod.optimistic,
        scenarios.sellingCosts.optimistic,
        scenarios.interestRate.optimistic
      ).roi,
      pessimistic: calculateScenarioROI(
        scenarios.purchasePrice.pessimistic,
        scenarios.arv.pessimistic,
        scenarios.renovationCost.pessimistic,
        scenarios.holdingPeriod.pessimistic,
        scenarios.sellingCosts.pessimistic,
        scenarios.interestRate.pessimistic
      ).roi,
      extremePessimistic: calculateScenarioROI(
        scenarios.purchasePrice.pessimistic,
        scenarios.arv.pessimistic,
        scenarios.renovationCost.extreme,
        scenarios.holdingPeriod.extreme,
        scenarios.sellingCosts.pessimistic,
        scenarios.interestRate.pessimistic
      ).roi
    };

    // Generate the charts for what-if analysis
    const generateROIBarChart = (scenarios) => {
      const barColors = scenarios.map(s => {
        const roi = s.roi;
        if (roi >= 20) return '#4caf50'; // green
        if (roi >= 10) return '#ff9800'; // orange
        if (roi >= 0) return '#f44336';  // red
        return '#9e9e9e'; // grey for negative
      });

      return `
        <div style="height: 400px; margin: 20px 0;">
          <canvas id="roiBarChart"></canvas>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          // Create the ROI Bar Chart
          const ctx = document.getElementById('roiBarChart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(scenarios.map(s => s.name))},
              datasets: [{
                label: 'ROI (%)',
                data: ${JSON.stringify(scenarios.map(s => parseFloat(s.roi.toFixed(1))))},
                backgroundColor: ${JSON.stringify(barColors)},
                borderColor: ${JSON.stringify(barColors.map(c => c.replace('0.7', '1')))},
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'ROI (%)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Scenario'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'ROI Comparison Across Different Scenarios',
                  font: {
                    size: 16
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'ROI: ' + context.parsed.y.toFixed(1) + '%';
                    }
                  }
                }
              }
            }
          });
        </script>
      `;
    };

    const generateProfitBarChart = (scenarios) => {
      const barColors = scenarios.map(s => {
        const profit = s.netProfit;
        if (profit >= netProfit) return '#4caf50'; // green
        if (profit >= 0) return '#ff9800'; // orange
        return '#f44336'; // red
      });

      return `
        <div style="height: 400px; margin: 20px 0;">
          <canvas id="profitBarChart"></canvas>
        </div>
        <script>
          // Create the Profit Bar Chart
          const profitCtx = document.getElementById('profitBarChart').getContext('2d');
          new Chart(profitCtx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(scenarios.map(s => s.name))},
              datasets: [{
                label: 'Net Profit ($)',
                data: ${JSON.stringify(scenarios.map(s => Math.round(s.netProfit)))},
                backgroundColor: ${JSON.stringify(barColors)},
                borderColor: ${JSON.stringify(barColors.map(c => c.replace('0.7', '1')))},
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Net Profit ($)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Scenario'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Net Profit Comparison Across Different Scenarios',
                  font: {
                    size: 16
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Net Profit: $' + context.parsed.y.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        </script>
      `;
    };

    // Add renovation breakdown HTML
    let renovationBreakdownHTML = '';
    if (formData.useBreakdown) {
      renovationBreakdownHTML = `
        <div class="section">
          <h3>Renovation Breakdown</h3>
          <table>
            <tr><th>Category</th><th>Cost</th></tr>
            ${Object.entries(formData.renovationBreakdown)
              .filter(([_, value]) => parseFloat(value) > 0)
              .map(([key, value]) => `
                <tr>
                  <td style="text-transform: capitalize;">${key}</td>
                  <td>$${parseFloat(value).toLocaleString()}</td>
                </tr>
              `).join('')}
            <tr style="font-weight: bold;">
              <td>Total</td>
              <td>$${renovationCost.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      `;
    } else if (formData.renovationMethod === 'estimate') {
      // If using the estimator, show the parameters used
      renovationBreakdownHTML = `
        <div class="section">
          <h3>Renovation Estimate Parameters</h3>
          <table>
            <tr><th>Parameter</th><th>Value</th></tr>
            <tr><td>House Size</td><td>${formData.houseSize} sq ft</td></tr>
            <tr><td>House Condition</td><td>${formData.houseCondition ? formData.houseCondition.charAt(0).toUpperCase() + formData.houseCondition.slice(1) : 'N/A'}</td></tr>
            <tr><td>Location</td><td>${formData.location || 'N/A'}</td></tr>
            <tr><td>DIY Level</td><td>${(() => {
              if (!formData.diyLevel) return 'N/A';
              switch(formData.diyLevel) {
                case 'significant': return 'Significant DIY (40% savings)';
                case 'minimal': return 'Minimal DIY (15% savings)';
                case 'gc': return 'You as General Contractor (10% savings)';
                case 'none': return 'Hire Full Service GC (No savings)';
                default: return formData.diyLevel;
              }
            })()}</td></tr>
            <tr style="font-weight: bold;">
              <td>Total Estimated Cost</td>
              <td>$${renovationCost.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      `;
    }

    // Create appendix HTML
    const appendixHTML = `
      <div class="section">
        <h2>Appendix</h2>
        <div>
          <h3>Renovation Cost Methodology</h3>
          <p>The renovation costs in this analysis were ${formData.useBreakdown ? 'itemized by category' : formData.renovationMethod === 'estimate' ? 'estimated based on the property condition and size' : 'provided as a total figure'}.</p>
          ${renovationBreakdownHTML}
          
          <h3>Best Practices for Renovation Management</h3>
          <ul>
            <li>Get at least 3 quotes from licensed contractors for major renovation components</li>
            <li>Add a 15-20% contingency for unexpected issues, especially for older properties</li>
            <li>Prioritize improvements that add the most value (typically kitchens, bathrooms, and curb appeal)</li>
            <li>Consider phasing renovations if cash flow is a concern</li>
            <li>For DIY work, focus on cosmetic improvements rather than structural, electrical, or plumbing</li>
            <li>Create a detailed timeline with milestones to track progress and avoid delays</li>
          </ul>
        </div>
      </div>
    `;

    // Generate what-if scenarios for the report
    const scenariosForReport = [
      {
        name: 'Base Case',
        ...baseScenario
      },
      {
        name: 'Optimistic Scenario',
        ...calculateScenarioROI(
          scenarios.purchasePrice.optimistic,
          scenarios.arv.optimistic,
          scenarios.renovationCost.optimistic,
          scenarios.holdingPeriod.optimistic,
          scenarios.sellingCosts.optimistic,
          scenarios.interestRate.optimistic
        )
      },
      {
        name: 'Pessimistic Scenario',
        ...calculateScenarioROI(
          scenarios.purchasePrice.pessimistic,
          scenarios.arv.pessimistic,
          scenarios.renovationCost.pessimistic,
          scenarios.holdingPeriod.pessimistic,
          scenarios.sellingCosts.pessimistic,
          scenarios.interestRate.pessimistic
        )
      },
      {
        name: 'Extreme Scenario',
        ...calculateScenarioROI(
          scenarios.purchasePrice.pessimistic,
          scenarios.arv.pessimistic,
          scenarios.renovationCost.extreme,
          scenarios.holdingPeriod.extreme,
          scenarios.sellingCosts.pessimistic,
          scenarios.interestRate.pessimistic
        )
      }
    ];

    // Include Exit Strategy Comparison
    const generateExitStrategyComparison = () => {
      // If no expected monthly rent is provided, return empty string
      if (!(parseFloat(formData.expectedMonthlyRent) > 0)) {
        return '';
      }

      // Calculate rental metrics (similar to ExitStrategyComparison component)
      const monthlyRent = parseFloat(formData.expectedMonthlyRent) || 0;
      const annualAppreciationRate = 0.03; // 3% annual appreciation
      const annualInflationRate = 0.02; // 2% annual inflation
      const realAppreciationRate = annualAppreciationRate - annualInflationRate;
      const propertyManagementFee = 0.1; // 10% of rent
      const maintenancePercent = 0.05; // 5% of rent
      const vacancyRate = 0.08; // 8% vacancy
      const rentIncreaseRate = 0.02; // 2% annual rent increase
      const sellingCostAfterRental = 0.07; // 7% selling cost after rental period
      const yearsToHold = 5; // 5 year rental period

      // Calculate initial downpayment and loan
      const downPaymentPercent = parseFloat(formData.downPayment) || 20;
      const downPayment = (purchasePrice * downPaymentPercent) / 100;
      const loanAmount = purchasePrice - downPayment;
      const interestRate = parseFloat(formData.interestRate) || 7.5;
      const loanTermYears = 30;
      const monthlyInterestRate = interestRate / 100 / 12;
      const totalPayments = loanTermYears * 12;
      
      const monthlyMortgagePayment = loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);

      // Helper function to calculate remaining loan balance
      const calculateRemainingLoanBalance = (principal, monthlyRate, totalPayments, paymentsMade) => {
        return principal * 
          (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) / 
          (Math.pow(1 + monthlyRate, totalPayments) - 1);
      };

      // Calculate flip metrics (already computed in main code)
      const sellingCosts = (expectedSellingPrice * parseFloat(formData.sellingCosts)) / 100;
      const totalInvestment = downPayment + renovationCost + (monthlyExpenses * holdingPeriod);
      const netFlipProfit = expectedSellingPrice - sellingCosts - purchasePrice - renovationCost - (monthlyExpenses * holdingPeriod);
      const flipROI = (netFlipProfit / totalInvestment) * 100;
      const annualizedFlipROI = (flipROI / holdingPeriod) * 12;

      // Calculate 5-year rental metrics
      let annualCashFlows = [];
      let appreciatedValues = [];
      let equityValues = [];
      
      for (let year = 1; year <= yearsToHold; year++) {
        // Calculate appreciation
        const appreciatedValue = expectedSellingPrice * Math.pow(1 + annualAppreciationRate, year);
        
        // Calculate adjusted rent for the year
        const adjustedMonthlyRent = monthlyRent * Math.pow(1 + rentIncreaseRate, year - 1);
        const annualRentalIncome = adjustedMonthlyRent * 12;
        
        // Calculate expenses
        const vacancyLoss = annualRentalIncome * vacancyRate;
        const propertyManagement = annualRentalIncome * propertyManagementFee;
        const maintenance = annualRentalIncome * maintenancePercent;
        const propertyTaxes = expectedSellingPrice * 0.015; // Estimate 1.5% of ARV
        const insurance = expectedSellingPrice * 0.005; // Estimate 0.5% of ARV
        const annualMortgage = monthlyMortgagePayment * 12;
        
        // Total expenses and cash flow
        const totalExpenses = vacancyLoss + propertyManagement + maintenance + propertyTaxes + insurance + annualMortgage;
        const annualCashFlow = annualRentalIncome - totalExpenses;
        
        // Calculate remaining loan balance
        const remainingLoanBalance = calculateRemainingLoanBalance(
          loanAmount, 
          monthlyInterestRate, 
          totalPayments, 
          year * 12
        );
        
        // Calculate equity
        const equity = appreciatedValue - remainingLoanBalance;
        
        annualCashFlows.push(annualCashFlow);
        appreciatedValues.push(appreciatedValue);
        equityValues.push(equity);
      }
      
      // Final year metrics
      const finalAppreciatedValue = appreciatedValues[yearsToHold - 1];
      const finalRemainingLoanBalance = calculateRemainingLoanBalance(
        loanAmount, 
        monthlyInterestRate, 
        totalPayments, 
        yearsToHold * 12
      );
      const sellingCostAfterHolding = finalAppreciatedValue * sellingCostAfterRental;
      const netProceedsFromSale = finalAppreciatedValue - finalRemainingLoanBalance - sellingCostAfterHolding;
      
      // Calculate total profit components
      const totalRentalCashFlow = annualCashFlows.reduce((sum, cashFlow) => sum + cashFlow, 0);
      const totalAppreciation = finalAppreciatedValue - expectedSellingPrice;
      const totalPrincipalPaydown = loanAmount - finalRemainingLoanBalance;
      
      // Total profit and ROI
      const rentalInitialInvestment = downPayment + renovationCost;
      const totalRentalProfit = totalRentalCashFlow + netProceedsFromSale - rentalInitialInvestment;
      const rentalROI = (totalRentalProfit / rentalInitialInvestment) * 100;
      const annualizedRentalROI = rentalROI / yearsToHold;

      // Generate HTML for exit strategy comparison
      return `
        <div class="section">
          <h2>Exit Strategy Comparison: Flip vs. Rental</h2>
          
          <table>
            <tr>
              <th>Metric</th>
              <th>Flip Now</th>
              <th>Rent for 5 Years</th>
            </tr>
            <tr>
              <td>Total Profit</td>
              <td>$${formatCurrency(netFlipProfit)}</td>
              <td>$${formatCurrency(totalRentalProfit)}</td>
            </tr>
            <tr>
              <td>Annualized ROI</td>
              <td>${formatPercent(annualizedFlipROI)}%</td>
              <td>${formatPercent(annualizedRentalROI)}%</td>
            </tr>
            <tr>
              <td>Timeframe</td>
              <td>${holdingPeriod} months</td>
              <td>5 years</td>
            </tr>
            <tr>
              <td>Risk Level</td>
              <td>Lower</td>
              <td>Higher</td>
            </tr>
            <tr>
              <td>Liquidity</td>
              <td>Higher</td>
              <td>Lower</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3>Rental Profit Breakdown</h3>
            <table>
              <tr>
                <th>Component</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
              <tr>
                <td>Cash Flow (5 years)</td>
                <td>$${formatCurrency(totalRentalCashFlow)}</td>
                <td>${formatPercent(totalRentalCashFlow / totalRentalProfit * 100)}%</td>
              </tr>
              <tr>
                <td>Appreciation</td>
                <td>$${formatCurrency(totalAppreciation)}</td>
                <td>${formatPercent(totalAppreciation / totalRentalProfit * 100)}%</td>
              </tr>
              <tr>
                <td>Principal Paydown</td>
                <td>$${formatCurrency(totalPrincipalPaydown)}</td>
                <td>${formatPercent(totalPrincipalPaydown / totalRentalProfit * 100)}%</td>
              </tr>
              <tr>
                <td>Selling Costs</td>
                <td>-$${formatCurrency(sellingCostAfterHolding)}</td>
                <td>${formatPercent(-sellingCostAfterHolding / totalRentalProfit * 100)}%</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 20px;">
            <h3>Understanding Rental ROI</h3>
            <p>
              The rental ROI calculation combines both the initial value-add investment (purchase + renovation) 
              and the ongoing returns from holding the property (cash flow, appreciation, and principal paydown).
            </p>
            <p>
              The high ROI percentage is driven by the power of leverage - you're only investing the down payment (${formData.downPayment}%)
              but gaining appreciation on the full property value. This highlights why rental real estate can be an
              effective wealth-building strategy when the numbers work correctly.
            </p>
            <p>
              Key success factors for the rental strategy:
              <ul>
                <li>Positive monthly cash flow (${totalRentalCashFlow > 0 ? 'present' : 'not present'} in this scenario)</li>
                <li>Property in an area with steady appreciation (we assume ${(annualAppreciationRate * 100).toFixed(1)}% annually)</li>
                <li>Long-term debt paydown building additional equity</li>
              </ul>
            </p>
          </div>
          
          <div style="margin-top: 20px;">
            <h3>Key Assumptions:</h3>
            <table>
              <tr><th>Parameter</th><th>Value</th></tr>
              <tr><td>Annual Appreciation Rate</td><td>${(annualAppreciationRate * 100).toFixed(1)}%</td></tr>
              <tr><td>Annual Inflation Rate</td><td>${(annualInflationRate * 100).toFixed(1)}%</td></tr>
              <tr><td>Real Appreciation Rate (after inflation)</td><td>${(realAppreciationRate * 100).toFixed(1)}%</td></tr>
              <tr><td>Rental Income Increase Rate</td><td>${(rentIncreaseRate * 100).toFixed(1)}%</td></tr>
              <tr><td>Vacancy Rate</td><td>${(vacancyRate * 100).toFixed(1)}%</td></tr>
              <tr><td>Property Management Fee</td><td>${(propertyManagementFee * 100).toFixed(1)}%</td></tr>
              <tr><td>Maintenance</td><td>${(maintenancePercent * 100).toFixed(1)}%</td></tr>
            </table>
          </div>
          
          <div style="margin-top: 20px;">
            <h3>5-Year Rental Cash Flow Projection</h3>
            <table>
              <tr>
                <th>Year</th>
                <th>Annual Cash Flow</th>
                <th>Property Value</th>
                <th>Equity</th>
              </tr>
              ${Array.from({length: yearsToHold}, (_, i) => {
                const year = i + 1;
                return `
                  <tr>
                    <td>Year ${year}</td>
                    <td>$${formatCurrency(annualCashFlows[i])}</td>
                    <td>$${formatCurrency(appreciatedValues[i])}</td>
                    <td>$${formatCurrency(equityValues[i])}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
          
          <div style="margin-top: 20px;">
            <p>
              ${totalRentalCashFlow < 0 
                ? "Note: This property shows negative cash flow as a rental, which means you would need to contribute additional funds monthly." 
                : "This property generates positive cash flow as a rental, which can contribute to your monthly income."}
              ${netFlipProfit > totalRentalProfit 
                ? "Based on the analysis, flipping this property appears to be the more profitable strategy." 
                : "Based on the analysis, holding this property as a rental for 5 years appears to be the more profitable long-term strategy."}
            </p>
          </div>
        </div>
      `;
    };

    // Existing report HTML generation code...
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Property Investment Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1100px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #2c3e50; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { color: #34495e; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .highlight { background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; }
            .section { margin: 30px 0; }
            .good { color: #27ae60; }
            .fair { color: #f39c12; }
            .poor { color: #e74c3c; }
            .warning { background-color: #fef9e7; border-left: 4px solid #f39c12; padding: 15px; }
            .chart-container { margin: 20px 0; }
            @media print {
              body { font-size: 12pt; }
              .no-print { display: none; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <h1>Property Investment Analysis Report</h1>
          <div class="highlight">
            <h2>Executive Summary</h2>
            <p><strong>Address:</strong> ${formData.propertyAddress || "Not provided"}</p>
            <p><strong>Deal Quality:</strong> <span class="${getQualityColor(dealQuality).replace('primary','good').replace('warning','fair').replace('error','poor')}">${dealQuality}</span></p>
            <p>${getExecutiveSummary(roi, arvToPurchaseRatio, renovationToArvRatio)}</p>
          </div>
          
          <div class="section">
            <h2>Deal Summary</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Assessment</th>
              </tr>
              <tr>
                <td>ROI</td>
                <td>${formatPercent(roi)}%</td>
                <td class="${roi >= 20 ? 'good' : roi >= 10 ? 'fair' : 'poor'}">${roi >= 20 ? 'Good' : roi >= 10 ? 'Fair' : 'Poor'}</td>
              </tr>
              <tr>
                <td>ARV to Purchase Ratio</td>
                <td>${arvToPurchaseRatio.toFixed(2)}x</td>
                <td class="${arvToPurchaseRatio >= 1.3 ? 'good' : arvToPurchaseRatio >= 1.2 ? 'fair' : 'poor'}">${arvToPurchaseRatio >= 1.3 ? 'Good' : arvToPurchaseRatio >= 1.2 ? 'Fair' : 'Poor'}</td>
              </tr>
              <tr>
                <td>Renovation to ARV Ratio</td>
                <td>${formatPercent(renovationToArvRatio)}%</td>
                <td class="${renovationToArvRatio <= 20 ? 'good' : renovationToArvRatio <= 25 ? 'fair' : 'poor'}">${renovationToArvRatio <= 20 ? 'Good' : renovationToArvRatio <= 25 ? 'Fair' : 'Poor'}</td>
              </tr>
              <tr>
                <td>Net Profit</td>
                <td>$${formatCurrency(netProfit)}</td>
                <td class="${netProfit >= 30000 ? 'good' : netProfit >= 15000 ? 'fair' : 'poor'}">${netProfit >= 30000 ? 'Good' : netProfit >= 15000 ? 'Fair' : 'Poor'}</td>
              </tr>
              <tr>
                <td>Annualized ROI</td>
                <td>${formatPercent(annualizedROI)}%</td>
                <td class="${annualizedROI >= 30 ? 'good' : annualizedROI >= 20 ? 'fair' : 'poor'}">${annualizedROI >= 30 ? 'Good' : annualizedROI >= 20 ? 'Fair' : 'Poor'}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2>Investment Details</h2>
            <table>
              <tr>
                <th>Purchase Details</th>
                <th>Renovation Details</th>
                <th>Selling Details</th>
              </tr>
              <tr>
                <td>Purchase Price</td>
                <td>Renovation Cost</td>
                <td>Expected Selling Price</td>
              </tr>
              <tr>
                <td>$${formatCurrency(purchasePrice)}</td>
                <td>$${formatCurrency(renovationCost)}</td>
                <td>$${formatCurrency(expectedSellingPrice)}</td>
              </tr>
              <tr>
                <td>Down Payment</td>
                <td>Holding Period</td>
                <td>Selling Costs</td>
              </tr>
              <tr>
                <td>${formData.downPayment}%</td>
                <td>${holdingPeriod} months</td>
                <td>${formData.sellingCosts}%</td>
              </tr>
              <tr>
                <td>Interest Rate</td>
                <td>Monthly Expenses</td>
                <td>Loan Term</td>
              </tr>
              <tr>
                <td>${formData.interestRate}%</td>
                <td>$${formatCurrency(monthlyExpenses)}</td>
                <td>${formData.loanTerm} years</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2>What-If Analysis</h2>
            <div class="highlight" style="margin-bottom: 20px;">
              <p>This analysis shows how the investment performs under different scenarios, helping you understand the potential risks and opportunities.</p>
              <p><strong>Why this matters:</strong> Real estate investments rarely go exactly as planned. By testing different scenarios, we can assess 
              how resilient this deal is to unexpected changes in purchase price, selling price, renovation costs, and timeline.</p>
              <p><strong>How to interpret:</strong> A strong deal will maintain positive returns even in the pessimistic scenario. 
              The difference between the base and pessimistic scenarios indicates the level of risk.</p>
            </div>
            <p>The following scenarios show how the deal performs under different conditions:</p>
            
            <table>
              <tr>
                <th>Scenario</th>
                <th>ROI</th>
                <th>Net Profit</th>
                <th>Assessment</th>
              </tr>
              ${scenariosForReport.map(scenario => `
                <tr>
                  <td>${scenario.name}</td>
                  <td>${formatPercent(scenario.roi)}%</td>
                  <td>$${formatCurrency(scenario.netProfit)}</td>
                  <td class="${scenario.roi >= 20 ? 'good' : scenario.roi >= 10 ? 'fair' : 'poor'}">${scenario.roi >= 20 ? 'Good' : scenario.roi >= 10 ? 'Fair' : 'Poor'}</td>
                </tr>
              `).join('')}
            </table>
            
            <div class="highlight" style="margin-top: 20px;">
              <h3>Sensitivity Analysis</h3>
              <p>
                <strong>Key Insights:</strong> ${
                  scenariosForReport[2].roi >= 15 
                    ? 'The deal maintains good ROI even in the pessimistic scenario, indicating strong resilience to adverse conditions.' 
                    : scenariosForReport[2].roi >= 5 
                      ? 'The deal maintains positive but reduced ROI in the pessimistic scenario, suggesting moderate risk.' 
                      : 'The deal shows significant sensitivity to adverse conditions, with ROI dropping substantially in the pessimistic scenario.'
                }
              </p>
              <p>${
                scenariosForReport[3].roi >= 0 
                  ? `Even in the extreme scenario, the deal remains profitable with a ${formatPercent(scenariosForReport[3].roi)}% ROI.` 
                  : `In the extreme scenario, the deal becomes unprofitable with a ${formatPercent(scenariosForReport[3].roi)}% ROI. Extra caution is warranted.`
              }</p>
            </div>
          </div>
          
          <!-- Add Project Timeline to the report -->
          <div class="section">
            <h2>Project Timeline & Cash Flow</h2>
            <div style="margin: 20px 0;">
              <div class="timeline-container">
                <table>
                  <tr>
                    <th>Project Phase</th>
                    <th>Duration</th>
                    <th>Cumulative Time</th>
                    <th>Key Activities</th>
                  </tr>
                  <tr>
                    <td>Purchase & Closing</td>
                    <td>${formData.timelineEstimates?.closingTime || 30} days</td>
                    <td>${formData.timelineEstimates?.closingTime || 30} days</td>
                    <td>Contract signing, inspections, financing, title search</td>
                  </tr>
                  <tr>
                    <td>Permits & Planning</td>
                    <td>${formData.timelineEstimates?.permitTime || 15} days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15)} days</td>
                    <td>Obtaining necessary permits, finalizing renovation plans</td>
                  </tr>
                  <tr>
                    <td>Demolition</td>
                    <td>${formData.timelineEstimates?.demoTime || 7} days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7)} days</td>
                    <td>Interior demolition, site clearing, waste removal</td>
                  </tr>
                  <tr>
                    <td>Rough-In Work</td>
                    <td>${formData.timelineEstimates?.roughInTime || 14} days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14)} days</td>
                    <td>Framing, electrical, plumbing, HVAC rough-ins</td>
                  </tr>
                  <tr>
                    <td>Finishing Work</td>
                    <td>${formData.timelineEstimates?.finishTime || 21} days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14) + parseInt(formData.timelineEstimates?.finishTime || 21)} days</td>
                    <td>Drywall, flooring, cabinets, fixtures, painting, trim</td>
                  </tr>
                  <tr>
                    <td>Final Inspections</td>
                    <td>7 days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14) + parseInt(formData.timelineEstimates?.finishTime || 21) + 7} days</td>
                    <td>Final walk-through, punch list items, municipal inspections</td>
                  </tr>
                  <tr>
                    <td>Listing & Sale</td>
                    <td>${formData.timelineEstimates?.listingTime || 45} days</td>
                    <td>${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14) + parseInt(formData.timelineEstimates?.finishTime || 21) + 7 + parseInt(formData.timelineEstimates?.listingTime || 45)} days</td>
                    <td>Photography, listing, showings, offers, closing</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 20px;">
                <h3>Cash Flow Timeline</h3>
                <table>
                  <tr>
                    <th>Time Point</th>
                    <th>Cash Flow</th>
                    <th>Cumulative Cash Flow</th>
                    <th>Notes</th>
                  </tr>
                  <tr>
                    <td>Day 1</td>
                    <td>-$${formatCurrency(downPayment)}</td>
                    <td>-$${formatCurrency(downPayment)}</td>
                    <td>Down payment at closing</td>
                  </tr>
                  <tr>
                    <td>Day ${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15)}</td>
                    <td>-$${formatCurrency(renovationCost * 0.3)}</td>
                    <td>-$${formatCurrency(downPayment + (renovationCost * 0.3))}</td>
                    <td>30% of renovation costs (initial payment)</td>
                  </tr>
                  <tr>
                    <td>Day ${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14)}</td>
                    <td>-$${formatCurrency(renovationCost * 0.4)}</td>
                    <td>-$${formatCurrency(downPayment + (renovationCost * 0.7))}</td>
                    <td>40% of renovation costs (rough-in completion)</td>
                  </tr>
                  <tr>
                    <td>Day ${parseInt(formData.timelineEstimates?.closingTime || 30) + parseInt(formData.timelineEstimates?.permitTime || 15) + parseInt(formData.timelineEstimates?.demoTime || 7) + parseInt(formData.timelineEstimates?.roughInTime || 14) + parseInt(formData.timelineEstimates?.finishTime || 21)}</td>
                    <td>-$${formatCurrency(renovationCost * 0.3)}</td>
                    <td>-$${formatCurrency(downPayment + renovationCost)}</td>
                    <td>30% of renovation costs (final payment)</td>
                  </tr>
                  <tr>
                    <td>Monthly</td>
                    <td>-$${formatCurrency(monthlyExpenses)}</td>
                    <td>-$${formatCurrency(downPayment + renovationCost + (monthlyExpenses * holdingPeriod))}</td>
                    <td>Monthly holding costs (taxes, insurance, utilities, loan payments)</td>
                  </tr>
                  <tr>
                    <td>End of Project</td>
                    <td>+$${formatCurrency(expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100))}</td>
                    <td>+$${formatCurrency(netProfit)}</td>
                    <td>Sale proceeds (after selling costs)</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Finance Options Comparison</h2>
            <div style="margin: 20px 0;">
              <table>
                <tr>
                  <th>Finance Option</th>
                  <th>Cash Purchase</th>
                  <th>Conventional Loan</th>
                  <th>Hard Money Loan</th>
                </tr>
                <tr>
                  <td>Down Payment</td>
                  <td>$${formatCurrency(purchasePrice)}</td>
                  <td>$${formatCurrency(purchasePrice * parseFloat(formData.downPayment) / 100)}</td>
                  <td>$${formatCurrency(purchasePrice * 15 / 100)}</td>
                </tr>
                <tr>
                  <td>Interest Rate</td>
                  <td>0%</td>
                  <td>${parseFloat(formData.interestRate)}%</td>
                  <td>12%</td>
                </tr>
                <tr>
                  <td>Loan Points</td>
                  <td>0</td>
                  <td>1 point ($${formatCurrency((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * 0.01)})</td>
                  <td>2.5 points ($${formatCurrency((purchasePrice - (purchasePrice * 15 / 100)) * 0.025)})</td>
                </tr>
                <tr>
                  <td>Total Interest Paid</td>
                  <td>$0</td>
                  <td>$${formatCurrency(((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * (parseFloat(formData.interestRate) / 100 / 12)) * holdingPeriod)}</td>
                  <td>$${formatCurrency(((purchasePrice - (purchasePrice * 15 / 100)) * (12 / 100 / 12)) * holdingPeriod)}</td>
                </tr>
                <tr>
                  <td>Total Investment</td>
                  <td>$${formatCurrency(purchasePrice + renovationCost + (monthlyExpenses * holdingPeriod))}</td>
                  <td>$${formatCurrency((purchasePrice * parseFloat(formData.downPayment) / 100) + renovationCost + ((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * 0.01) + (((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * (parseFloat(formData.interestRate) / 100 / 12)) * holdingPeriod) + (monthlyExpenses * holdingPeriod))}</td>
                  <td>$${formatCurrency((purchasePrice * 15 / 100) + renovationCost + ((purchasePrice - (purchasePrice * 15 / 100)) * 0.025) + (((purchasePrice - (purchasePrice * 15 / 100)) * (12 / 100 / 12)) * holdingPeriod) + (monthlyExpenses * holdingPeriod))}</td>
                </tr>
                <tr>
                  <td>Net Profit</td>
                  <td>$${formatCurrency(expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - (monthlyExpenses * holdingPeriod))}</td>
                  <td>$${formatCurrency(expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - ((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * 0.01) - (((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * (parseFloat(formData.interestRate) / 100 / 12)) * holdingPeriod) - (monthlyExpenses * holdingPeriod))}</td>
                  <td>$${formatCurrency(expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - ((purchasePrice - (purchasePrice * 15 / 100)) * 0.025) - (((purchasePrice - (purchasePrice * 15 / 100)) * (12 / 100 / 12)) * holdingPeriod) - (monthlyExpenses * holdingPeriod))}</td>
                </tr>
                <tr>
                  <td>Return on Investment (ROI)</td>
                  <td>${formatPercent((expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - (monthlyExpenses * holdingPeriod)) / (purchasePrice + renovationCost + (monthlyExpenses * holdingPeriod)) * 100)}%</td>
                  <td>${formatPercent((expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - ((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * 0.01) - (((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * (parseFloat(formData.interestRate) / 100 / 12)) * holdingPeriod) - (monthlyExpenses * holdingPeriod)) / ((purchasePrice * parseFloat(formData.downPayment) / 100) + renovationCost + ((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * 0.01) + (((purchasePrice - (purchasePrice * parseFloat(formData.downPayment) / 100)) * (parseFloat(formData.interestRate) / 100 / 12)) * holdingPeriod) + (monthlyExpenses * holdingPeriod)) * 100)}%</td>
                  <td>${formatPercent((expectedSellingPrice - (expectedSellingPrice * parseFloat(formData.sellingCosts) / 100) - purchasePrice - renovationCost - ((purchasePrice - (purchasePrice * 15 / 100)) * 0.025) - (((purchasePrice - (purchasePrice * 15 / 100)) * (12 / 100 / 12)) * holdingPeriod) - (monthlyExpenses * holdingPeriod)) / ((purchasePrice * 15 / 100) + renovationCost + ((purchasePrice - (purchasePrice * 15 / 100)) * 0.025) + (((purchasePrice - (purchasePrice * 15 / 100)) * (12 / 100 / 12)) * holdingPeriod) + (monthlyExpenses * holdingPeriod)) * 100)}%</td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Add Exit Strategy Comparison to the report -->
          ${generateExitStrategyComparison()}
          
          <div class="section">
            <h2>Risk Assessment</h2>
            <p>${getRiskAssessment(roi, arvToPurchaseRatio, renovationToArvRatio, scenarioROIs)}</p>
            
            <div class="warning" style="margin-top: 20px;">
              <h3>Risk Mitigation Recommendations:</h3>
              <p>Based on this analysis, here are specific steps you can take to protect your investment:</p>
              <ul>
                ${renovationToArvRatio > 20 ? '<li><strong>Renovation Cost Risk:</strong> Get multiple contractor bids to reduce renovation costs. Consider phasing renovations to ensure each dollar spent maximizes value.</li>' : ''}
                ${holdingPeriod > 6 ? '<li><strong>Timeline Risk:</strong> Develop a detailed timeline with milestones and penalties in contractor agreements to prevent delays that increase holding costs.</li>' : ''}
                ${netProfit < 20000 ? '<li><strong>Profit Margin Risk:</strong> Negotiate purchase price more aggressively or find ways to add more value through strategic improvements that boost ARV without proportional cost increases.</li>' : ''}
                ${scenarioROIs.pessimistic < 10 ? '<li><strong>Market Risk:</strong> Build a larger contingency fund (at least 20% of renovation budget) to cover unexpected costs and maintain profitability even in challenging scenarios.</li>' : ''}
                ${arvToPurchaseRatio < 1.3 ? '<li><strong>Valuation Risk:</strong> Verify ARV with multiple comps and possibly get a professional appraisal. Consider getting a pre-listing inspection to identify any issues early.</li>' : ''}
                <li><strong>Execution Risk:</strong> Obtain fixed-price contracts for major renovation components to limit cost overruns.</li>
                <li><strong>Exit Strategy Risk:</strong> Line up multiple exit strategies in case the property doesn't sell as quickly as expected. ${parseFloat(formData.expectedMonthlyRent) > 0 ? 'The rental option provides an alternative exit if needed.' : 'Consider analyzing this as a potential rental as a backup plan.'}</li>
              </ul>
            </div>
          </div>
          
          ${appendixHTML}
        </body>
      </html>
    `;

    // Write the report to the new window
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  const getRiskAssessment = (roi, arvRatio, renovationRatio, scenarios) => {
    let assessment = [];
    
    // Base ROI assessment
    if (roi >= 30) {
      assessment.push("The base ROI of " + roi.toFixed(1) + "% is excellent, well above the industry standard of 20%.");
    } else if (roi >= 20) {
      assessment.push("The base ROI of " + roi.toFixed(1) + "% meets industry standards.");
    } else {
      assessment.push("The base ROI of " + roi.toFixed(1) + "% is below industry standards.");
    }

    // ARV to Purchase ratio assessment
    if (arvRatio >= 1.3) {
      assessment.push("The ARV to Purchase ratio of " + arvRatio.toFixed(2) + "x indicates strong potential for value creation.");
    } else if (arvRatio >= 1.2) {
      assessment.push("The ARV to Purchase ratio of " + arvRatio.toFixed(2) + "x is within acceptable range.");
    } else {
      assessment.push("The ARV to Purchase ratio of " + arvRatio.toFixed(2) + "x suggests limited upside potential.");
    }

    // Renovation cost assessment
    if (renovationRatio <= 20) {
      assessment.push("Renovation costs at " + renovationRatio.toFixed(1) + "% of ARV are efficient.");
    } else if (renovationRatio <= 25) {
      assessment.push("Renovation costs at " + renovationRatio.toFixed(1) + "% of ARV are reasonable.");
    } else {
      assessment.push("Renovation costs at " + renovationRatio.toFixed(1) + "% of ARV are high and may impact profitability.");
    }

    // Scenario analysis assessment
    if (scenarios.pessimistic >= 10) {
      assessment.push("Even in the pessimistic scenario, the deal maintains a positive ROI, indicating good downside protection.");
    } else if (scenarios.pessimistic >= 0) {
      assessment.push("The pessimistic scenario shows minimal profit, suggesting the deal is sensitive to market conditions.");
    } else {
      assessment.push("The pessimistic scenario results in a loss, indicating significant risk in the deal.");
    }

    return assessment.join(" ");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
          Investment Analysis Results
        </Typography>
          <Chip
            label={`Deal Quality: ${dealQuality}`}
            color={getQualityColor(dealQuality)}
            size="large"
            sx={{ fontSize: '1.1rem', padding: '0.5rem' }}
          />
        </Box>

        {/* Interactive Sliders Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Adjust Inputs
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Purchase Price
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={purchasePrice}
                      onChange={handleSliderChange('purchasePrice')}
                      min={50000}
                      max={1000000}
                      step={10000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={purchasePrice}
                      onChange={handleInputChange('purchasePrice')}
                      type="number"
                      inputProps={{ min: 50000, max: 1000000, step: 10000 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Expected Selling Price (ARV)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={expectedSellingPrice}
                      onChange={handleSliderChange('expectedSellingPrice')}
                      min={50000}
                      max={1500000}
                      step={10000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={expectedSellingPrice}
                      onChange={handleInputChange('expectedSellingPrice')}
                      type="number"
                      inputProps={{ min: 50000, max: 1500000, step: 10000 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Renovation Cost
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={renovationCost}
                      onChange={handleSliderChange('renovationCost')}
                      min={0}
                      max={200000}
                      step={5000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={renovationCost}
                      onChange={handleInputChange('renovationCost')}
                      type="number"
                      inputProps={{ min: 0, max: 200000, step: 5000 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Holding Period (months)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={holdingPeriod}
                      onChange={handleSliderChange('holdingPeriod')}
                      min={1}
                      max={12}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} months`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={holdingPeriod}
                      onChange={handleInputChange('holdingPeriod')}
                      type="number"
                      inputProps={{ min: 1, max: 12, step: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Monthly Expenses
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={monthlyExpenses}
                      onChange={handleSliderChange('monthlyExpenses')}
                      min={0}
                      max={5000}
                      step={100}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={monthlyExpenses}
                      onChange={handleInputChange('monthlyExpenses')}
                      type="number"
                      inputProps={{ min: 0, max: 5000, step: 100 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Down Payment (%)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={parseFloat(formData.downPayment)}
                      onChange={handleSliderChange('downPayment')}
                      min={0}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      value={formData.downPayment}
                      onChange={handleInputChange('downPayment')}
                      type="number"
                      inputProps={{ min: 0, max: 50, step: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Key Metrics Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Net Profit
                  <Tooltip title="Total profit after all costs and expenses">
                    <InfoIcon sx={{ ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Typography variant="h4" color={netProfit >= 0 ? 'success.main' : 'error.main'}>
                ${formatCurrency(netProfit)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((netProfit / totalInvestment) * 100, 100)}
                color={netProfit >= 0 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ROI
                  <Tooltip title="Return on Investment: (Net Profit / Total Investment) * 100. Shows how much you earn relative to your cash investment">
                    <InfoIcon sx={{ ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Typography variant="h4" color={roi >= 20 ? 'success.main' : roi >= 10 ? 'warning.main' : 'error.main'}>
                {formatPercent(roi)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(roi, 100)}
                color={roi >= 20 ? 'success' : roi >= 10 ? 'warning' : 'error'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ARV to Purchase
                  <Tooltip title="After Repair Value to Purchase Price ratio. Higher ratios indicate better deals">
                    <InfoIcon sx={{ ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Typography variant="h4" color={arvToPurchaseRatio >= 1.3 ? 'success.main' : arvToPurchaseRatio >= 1.2 ? 'warning.main' : 'error.main'}>
                {arvToPurchaseRatio.toFixed(2)}x
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((arvToPurchaseRatio - 1) * 100, 100)}
                color={arvToPurchaseRatio >= 1.3 ? 'success' : arvToPurchaseRatio >= 1.2 ? 'warning' : 'error'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Renovation to ARV
                  <Tooltip title="Percentage of ARV spent on renovations. Lower percentages indicate better deals">
                    <InfoIcon sx={{ ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Typography variant="h4" color={renovationToArvRatio <= 20 ? 'success.main' : renovationToArvRatio <= 25 ? 'warning.main' : 'error.main'}>
                {formatPercent(renovationToArvRatio)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100 - Math.min(renovationToArvRatio, 100)}
                color={renovationToArvRatio <= 20 ? 'success' : renovationToArvRatio <= 25 ? 'warning' : 'error'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Annualized ROI
                  <Tooltip title="If you could repeat this same deal multiple times in a year, this would be your annual ROI. Calculated as (ROI / Holding Period) * 12">
                    <InfoIcon sx={{ ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                </Box>
              </Typography>
              <Typography variant="h4" color={annualizedROI >= 30 ? 'success.main' : annualizedROI >= 20 ? 'warning.main' : 'error.main'}>
                {formatPercent(annualizedROI)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(annualizedROI, 100)}
                color={annualizedROI >= 30 ? 'success' : annualizedROI >= 20 ? 'warning' : 'error'}
                sx={{ mt: 1 }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Investment Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}\n$${value.toLocaleString()}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {investmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ color: '#666' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Results */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Detailed Analysis
          </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
              <TableBody>
                {/* ... existing table rows ... */}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Timeline Visualization Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Project Timeline & Cash Flow
          </Typography>
          <TimelineVisualization formData={formData} />
        </Box>

        {/* Finance Options Comparison Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Finance Options Comparison
          </Typography>
          <FinanceOptionsComparison formData={formData} />
        </Box>

        {/* Exit Strategy Comparison - Only show if expectedMonthlyRent is provided */}
        {parseFloat(formData.expectedMonthlyRent) > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Exit Strategy Analysis: Flip vs. Rental
            </Typography>
            <ExitStrategyComparison formData={formData} />
          </Box>
        )}

        {/* Input Summary Section */}
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Input Summary</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Purchase Details</Typography>
                  <Table size="small">
                <TableBody>
                  <TableRow>
                        <TableCell>Purchase Price</TableCell>
                        <TableCell align="right">${formatCurrency(purchasePrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Down Payment</TableCell>
                        <TableCell align="right">{formData.downPayment}%</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Interest Rate</TableCell>
                        <TableCell align="right">{formData.interestRate}%</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Loan Term</TableCell>
                        <TableCell align="right">{formData.loanTerm} years</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Renovation Details</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Renovation Cost</TableCell>
                        <TableCell align="right">${formatCurrency(renovationCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Holding Period</TableCell>
                        <TableCell align="right">{holdingPeriod} months</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Monthly Expenses</TableCell>
                        <TableCell align="right">${formatCurrency(monthlyExpenses)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {formData.useBreakdown && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Renovation Breakdown</Typography>
                      <Table size="small">
                        <TableBody>
                          {Object.entries(formData.renovationBreakdown)
                            .filter(([_, value]) => parseFloat(value) > 0)
                            .map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{key}</TableCell>
                                <TableCell align="right">${formatCurrency(parseFloat(value))}</TableCell>
                  </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Selling Details</Typography>
                  <Table size="small">
                    <TableBody>
                  <TableRow>
                        <TableCell>Expected Selling Price</TableCell>
                        <TableCell align="right">${formatCurrency(expectedSellingPrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                        <TableCell>Selling Costs</TableCell>
                        <TableCell align="right">{formData.sellingCosts}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
          </Grid>
        </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Generate Report Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => generateLenderReport()}
            sx={{ minWidth: 200 }}
          >
            Generate Lender Report
          </Button>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={() => navigate('/calculator')}
          >
            Calculate Another Property
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Results; 