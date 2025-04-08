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
      case 'Excellent': return 'success';
      case 'Good': return 'info';
      case 'Fair': return 'warning';
      default: return 'error';
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
            <tr><td>House Condition</td><td>${formData.houseCondition.charAt(0).toUpperCase() + formData.houseCondition.slice(1)}</td></tr>
            <tr><td>Location</td><td>${formData.location}</td></tr>
            <tr><td>DIY Level</td><td>${(() => {
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

    // Create an appendix section explaining renovation costs
    const appendixHTML = `
      <div class="pagebreak"></div>
      <div class="section">
        <h2>Appendix: Renovation Cost Methodology</h2>
        ${(() => {
          if (formData.useBreakdown) {
            return `
              <p>The renovation cost of $${formatCurrency(renovationCost)} was determined using a <strong>detailed component breakdown</strong>. This method provides a more accurate estimate as it considers specific repair costs for individual elements of the property.</p>
              
              <h3>Breakdown Summary</h3>
              <table>
                <tr><th>Category</th><th>Cost</th><th>% of Total</th></tr>
                ${Object.entries(formData.renovationBreakdown)
                  .filter(([_, value]) => parseFloat(value) > 0)
                  .map(([key, value]) => {
                    const cost = parseFloat(value);
                    const percentage = (cost / renovationCost) * 100;
                    return `
                      <tr>
                        <td style="text-transform: capitalize;">${key}</td>
                        <td>$${formatCurrency(cost)}</td>
                        <td>${formatPercent(percentage)}%</td>
                      </tr>
                    `;
                  }).join('')}
                <tr style="font-weight: bold;">
                  <td>Total</td>
                  <td>$${formatCurrency(renovationCost)}</td>
                  <td>100%</td>
                </tr>
              </table>
              
              <p>This detailed breakdown helps identify where the renovation budget will be allocated, enabling better planning and risk management.</p>
            `;
          } else if (formData.renovationMethod === 'estimate') {
            return `
              <p>The renovation cost of $${formatCurrency(renovationCost)} was generated using the <strong>Condition Estimator</strong>. This method calculates renovation costs based on property characteristics and local market factors.</p>
              
              <h3>Estimation Parameters</h3>
              <table>
                <tr><th>Parameter</th><th>Value</th><th>Impact</th></tr>
                <tr>
                  <td>House Size</td>
                  <td>${formatCurrency(parseFloat(formData.houseSize))} sq ft</td>
                  <td>Base multiplier for total costs</td>
                </tr>
                <tr>
                  <td>House Condition</td>
                  <td>${formData.houseCondition.charAt(0).toUpperCase() + formData.houseCondition.slice(1)}</td>
                  <td>${(() => {
                    switch(formData.houseCondition) {
                      case 'teardown': return '$80-150 per sq ft';
                      case 'poor': return '$50-80 per sq ft';
                      case 'fair': return '$25-45 per sq ft';
                      case 'good': return '$10-25 per sq ft';
                      default: return 'N/A';
                    }
                  })()}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>${formData.location}</td>
                  <td>${(REGIONAL_MULTIPLIERS[formData.location] * 100).toFixed(0)}% of base cost</td>
                </tr>
                <tr>
                  <td>DIY Level</td>
                  <td>${(() => {
                    switch(formData.diyLevel) {
                      case 'significant': return 'Significant DIY';
                      case 'minimal': return 'Minimal DIY';
                      case 'gc': return 'You as General Contractor';
                      case 'none': return 'Hire Full Service GC';
                      default: return formData.diyLevel;
                    }
                  })()}</td>
                  <td>${(() => {
                    switch(formData.diyLevel) {
                      case 'significant': return '40% savings';
                      case 'minimal': return '15% savings';
                      case 'gc': return '10% savings';
                      case 'none': return 'No savings';
                      default: return 'N/A';
                    }
                  })()}</td>
                </tr>
              </table>
              
              <p>The Condition Estimator provides a quick yet reliable approximation based on typical renovation costs in your region. For a more accurate assessment, consider obtaining detailed contractor quotes.</p>
              
              <h3>Calculation Method</h3>
              <p>Cost Range: $${formatCurrency(parseFloat(formData.houseSize) * RENOVATION_COST_ESTIMATES[formData.houseCondition].range[0] * REGIONAL_MULTIPLIERS[formData.location] * DIY_FACTORS[formData.diyLevel])} - $${formatCurrency(parseFloat(formData.houseSize) * RENOVATION_COST_ESTIMATES[formData.houseCondition].range[1] * REGIONAL_MULTIPLIERS[formData.location] * DIY_FACTORS[formData.diyLevel])}</p>
              <p>Base Cost: $${formatCurrency(parseFloat(formData.houseSize) * RENOVATION_COST_ESTIMATES[formData.houseCondition].base * REGIONAL_MULTIPLIERS[formData.location] * DIY_FACTORS[formData.diyLevel])}</p>
            `;
          } else {
            return `
              <p>The renovation cost of $${formatCurrency(renovationCost)} was manually entered based on your estimate.</p>
              <p>For more accurate cost projections, consider using either:</p>
              <ul>
                <li><strong>Detailed Breakdown:</strong> Itemize costs by category (roof, kitchen, etc.)</li>
                <li><strong>Condition Estimator:</strong> Calculate based on house size, condition, and location</li>
              </ul>
              <p>Both methods are available in the calculator and provide better risk assessment than a single lump sum estimate.</p>
            `;
          }
        })()}
        
        <div class="highlight" style="margin-top: 20px;">
          <h3>Renovation Cost Best Practices</h3>
          <ol>
            <li>Always include a 10-20% contingency for unexpected issues</li>
            <li>Get at least three contractor quotes for major renovation work</li>
            <li>Prioritize repairs that increase property value (kitchens, bathrooms, curb appeal)</li>
            <li>Create a detailed scope of work to avoid contractor disputes</li>
            <li>Obtain permits for all structural, electrical, and plumbing work</li>
          </ol>
        </div>
      </div>
    `;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Real Estate Flip Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .section { margin-bottom: 30px; }
            .metric { margin: 10px 0; }
            .scenario { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .good { color: green; }
            .fair { color: orange; }
            .poor { color: red; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .highlight { background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3; margin: 15px 0; }
            .warning { background-color: #fff3e0; padding: 15px; border-radius: 5px; border-left: 4px solid #ff9800; margin: 15px 0; }
            @media print {
              .pagebreak { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <h1>Real Estate Flip Analysis Report</h1>
          
          <div class="section">
            <h2>Deal Summary</h2>
            <p>This report analyzes a real estate flip opportunity with the following key metrics:</p>
            <table>
              <tr><th>Metric</th><th>Value</th><th>Assessment</th></tr>
              <tr>
                <td>ROI</td>
                <td>${formatPercent(roi)}%</td>
                <td class="${roi >= 20 ? 'good' : roi >= 10 ? 'fair' : 'poor'}">
                  ${roi >= 20 ? 'Strong' : roi >= 10 ? 'Moderate' : 'Weak'}
                </td>
              </tr>
              <tr>
                <td>ARV to Purchase Ratio</td>
                <td>${arvToPurchaseRatio.toFixed(2)}x</td>
                <td class="${arvToPurchaseRatio >= 1.3 ? 'good' : arvToPurchaseRatio >= 1.2 ? 'fair' : 'poor'}">
                  ${arvToPurchaseRatio >= 1.3 ? 'Strong' : arvToPurchaseRatio >= 1.2 ? 'Moderate' : 'Weak'}
                </td>
              </tr>
              <tr>
                <td>Renovation to ARV Ratio</td>
                <td>${formatPercent(renovationToArvRatio)}%</td>
                <td class="${renovationToArvRatio <= 20 ? 'good' : renovationToArvRatio <= 25 ? 'fair' : 'poor'}">
                  ${renovationToArvRatio <= 20 ? 'Efficient' : renovationToArvRatio <= 25 ? 'Moderate' : 'High'}
                </td>
              </tr>
              <tr>
                <td>Net Profit</td>
                <td>$${formatCurrency(netProfit)}</td>
                <td class="${netProfit >= 30000 ? 'good' : netProfit >= 15000 ? 'fair' : 'poor'}">
                  ${netProfit >= 30000 ? 'Strong' : netProfit >= 15000 ? 'Moderate' : 'Minimal'}
                </td>
              </tr>
              <tr>
                <td>Annualized ROI</td>
                <td>${formatPercent(annualizedROI)}%</td>
                <td class="${annualizedROI >= 30 ? 'good' : annualizedROI >= 20 ? 'fair' : 'poor'}">
                  ${annualizedROI >= 30 ? 'Excellent' : annualizedROI >= 20 ? 'Good' : 'Below Target'}
                </td>
              </tr>
            </table>
            
            <div class="${(netProfit >= 15000 && roi >= 15) ? 'highlight' : 'warning'}">
              <p><strong>Executive Summary:</strong> ${(netProfit >= 25000 && roi >= 20) 
                ? 'This deal shows strong potential with healthy profit margins and good ROI. Proceed with confidence while managing risks.' 
                : (netProfit >= 15000 && roi >= 15) 
                  ? 'This deal shows moderate potential. Consider if there are opportunities to improve the numbers by negotiating purchase price or reducing renovation costs.' 
                  : 'This deal requires careful consideration. The profit potential is limited and the ROI is below standard targets for fix and flip projects.'}</p>
            </div>
          </div>

          <div class="section">
            <h2>Investment Details</h2>
            <table>
              <tr><th>Component</th><th>Amount</th></tr>
              <tr><td>Purchase Price</td><td>$${formatCurrency(purchasePrice)}</td></tr>
              <tr><td>Renovation Cost</td><td>$${formatCurrency(renovationCost)}</td></tr>
              <tr><td>Holding Costs</td><td>$${formatCurrency(totalHoldingCosts)}</td></tr>
              <tr><td>Total Investment</td><td>$${formatCurrency(totalInvestment)}</td></tr>
              <tr><td>Expected Selling Price (ARV)</td><td>$${formatCurrency(expectedSellingPrice)}</td></tr>
              <tr><td>Net Profit</td><td>$${formatCurrency(netProfit)}</td></tr>
              <tr><td>Annualized ROI</td><td>${formatPercent(annualizedROI)}%</td></tr>
            </table>
            
            ${renovationBreakdownHTML}
          </div>

          <div class="pagebreak"></div>
          
          <div class="section">
            <h2>What-If Analysis</h2>
            <p>The following scenarios show how the deal performs under different conditions:</p>
            
            <div class="scenario">
              <h3>Optimistic Scenario</h3>
              <p>Assumes:</p>
              <ul>
                <li>10% lower purchase price</li>
                <li>10% higher ARV</li>
                <li>10% lower renovation costs</li>
                <li>20% shorter holding period</li>
                <li>20% lower selling costs</li>
                <li>10% lower interest rate</li>
              </ul>
              <p>Projected ROI: <span class="${scenarioROIs.optimistic >= 20 ? 'good' : scenarioROIs.optimistic >= 10 ? 'fair' : 'poor'}">${formatPercent(scenarioROIs.optimistic)}%</span></p>
            </div>

            <div class="scenario">
              <h3>Pessimistic Scenario</h3>
              <p>Assumes:</p>
              <ul>
                <li>10% higher purchase price</li>
                <li>10% lower ARV</li>
                <li>10% higher renovation costs</li>
                <li>20% longer holding period</li>
                <li>20% higher selling costs</li>
                <li>10% higher interest rate</li>
              </ul>
              <p>Projected ROI: <span class="${scenarioROIs.pessimistic >= 20 ? 'good' : scenarioROIs.pessimistic >= 10 ? 'fair' : 'poor'}">${formatPercent(scenarioROIs.pessimistic)}%</span></p>
            </div>

            <div class="scenario">
              <h3>Extreme Pessimistic Scenario</h3>
              <p>Assumes:</p>
              <ul>
                <li>10% higher purchase price</li>
                <li>10% lower ARV</li>
                <li>30% higher renovation costs (common in renovations)</li>
                <li>Double holding period (common delay)</li>
                <li>20% higher selling costs</li>
                <li>10% higher interest rate</li>
              </ul>
              <p>Projected ROI: <span class="${scenarioROIs.extremePessimistic >= 20 ? 'good' : scenarioROIs.extremePessimistic >= 10 ? 'fair' : 'poor'}">${formatPercent(scenarioROIs.extremePessimistic)}%</span></p>
            </div>
            
            <div class="highlight" style="margin-top: 20px;">
              <p><strong>Sensitivity Analysis:</strong> ${
                scenarioROIs.pessimistic >= 15 
                  ? 'The deal maintains good ROI even in the pessimistic scenario, indicating strong resilience to adverse conditions.' 
                  : scenarioROIs.pessimistic >= 5 
                    ? 'The deal maintains positive but reduced ROI in the pessimistic scenario, suggesting moderate risk.' 
                    : 'The deal shows significant sensitivity to adverse conditions, with ROI dropping substantially in the pessimistic scenario.'}
              </p>
              <p>${
                scenarioROIs.extremePessimistic >= 0 
                  ? `Even in the extreme scenario, the deal remains profitable with a ${formatPercent(scenarioROIs.extremePessimistic)}% ROI.` 
                  : `In the extreme scenario, the deal becomes unprofitable with a ${formatPercent(scenarioROIs.extremePessimistic)}% ROI. Extra caution is warranted.`
              }</p>
            </div>
          </div>

          <div class="pagebreak"></div>
          
          <div class="section">
            <h2>Individual Scenario Analysis</h2>
            <p>The charts below illustrate how specific changes to key variables affect the deal's performance:</p>
            
            ${generateROIBarChart(individualScenarios)}
            
            ${generateProfitBarChart(individualScenarios)}
            
            <div class="highlight" style="margin-top: 20px;">
              <p><strong>Key Sensitivities:</strong></p>
              <ul>
                ${individualScenarios
                  .filter(s => s.name !== 'Base Case')
                  .map(s => {
                    const difference = s.roi - baseScenario.roi;
                    const impactText = Math.abs(difference) < 3 
                      ? 'minimal impact' 
                      : Math.abs(difference) < 7 
                        ? 'moderate impact' 
                        : 'significant impact';
                    return `<li>${s.name}: ${formatPercent(difference)}% change in ROI (${impactText})</li>`;
                  })
                  .join('')}
              </ul>
              <p><strong>Most Sensitive Factors:</strong> ${(() => {
                const sortedScenarios = [...individualScenarios]
                  .filter(s => s.name !== 'Base Case')
                  .sort((a, b) => Math.abs(baseScenario.roi - b.roi) - Math.abs(baseScenario.roi - a.roi));
                return sortedScenarios.length > 0 
                  ? `${sortedScenarios[0].name}, ${sortedScenarios[1].name}, and ${sortedScenarios[2].name}`
                  : 'None identified';
              })()}</p>
            </div>
          </div>

          <div class="section">
            <h2>Risk Assessment</h2>
            <p>${getRiskAssessment(roi, arvToPurchaseRatio, renovationToArvRatio, scenarioROIs)}</p>
            
            <div class="warning" style="margin-top: 20px;">
              <h3>Risk Mitigation Recommendations:</h3>
              <ul>
                ${renovationToArvRatio > 20 ? '<li>Consider getting multiple contractor bids to reduce renovation costs</li>' : ''}
                ${holdingPeriod > 6 ? '<li>Develop a timeline with milestones to avoid project delays</li>' : ''}
                ${netProfit < 20000 ? '<li>Negotiate purchase price more aggressively to improve margins</li>' : ''}
                ${scenarioROIs.pessimistic < 10 ? '<li>Build a larger contingency fund to cover unexpected costs</li>' : ''}
                ${arvToPurchaseRatio < 1.3 ? '<li>Verify ARV with multiple comps and possibly get a professional appraisal</li>' : ''}
                <li>Obtain fixed-price contracts for major renovation components to limit cost overruns</li>
                <li>Line up multiple exit strategies in case the property doesn't sell as quickly as expected</li>
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