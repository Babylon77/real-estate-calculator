import React from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  useTheme 
} from '@mui/material';
import Chart from 'react-apexcharts';

const TimelineVisualization = ({ formData }) => {
  const theme = useTheme();

  // Extract timeline estimates
  const { 
    closingTime, 
    permitTime, 
    demoTime, 
    roughInTime, 
    finishTime, 
    listingTime 
  } = formData.timelineEstimates;

  // Adjust timeline based on property condition
  const condition = formData.houseCondition || 'fair';
  
  // Condition-based multipliers for key renovation phases
  const getConditionMultiplier = (condition) => {
    switch(condition) {
      case 'teardown':
        return { demo: 3.0, roughIn: 2.5, finish: 2.0 };
      case 'poor':
        return { demo: 2.0, roughIn: 1.75, finish: 1.5 };
      case 'fair':
        return { demo: 1.0, roughIn: 1.0, finish: 1.0 };
      case 'good':
        return { demo: 0.5, roughIn: 0.6, finish: 0.7 };
      default:
        return { demo: 1.0, roughIn: 1.0, finish: 1.0 };
    }
  };
  
  const multipliers = getConditionMultiplier(condition);
  
  // Calculate total days for each phase and their starting points
  const closingDays = parseInt(closingTime) || 30;
  const permitDays = parseInt(permitTime) || 15;
  const baseDemoDays = parseInt(demoTime) || 7;
  const baseRoughInDays = parseInt(roughInTime) || 14;
  const baseFinishDays = parseInt(finishTime) || 21;
  const listingDays = parseInt(listingTime) || 45;
  
  // Apply condition-based adjustments
  const demoDays = Math.round(baseDemoDays * multipliers.demo);
  const roughInDays = Math.round(baseRoughInDays * multipliers.roughIn);
  const finishDays = Math.round(baseFinishDays * multipliers.finish);
  
  const permitStart = closingDays;
  const demoStart = permitStart + permitDays;
  const roughInStart = demoStart + demoDays;
  const finishStart = roughInStart + roughInDays;
  const listingStart = finishStart + finishDays;
  const totalDays = listingStart + listingDays;

  // Calculate cash flow events
  const holdingPeriod = parseInt(formData.holdingPeriod) || 6;
  const monthlyExpenses = parseFloat(formData.monthlyExpenses) || 0;
  const renovationCost = parseFloat(formData.renovationCost) || 0;
  const downPayment = parseFloat(formData.purchasePrice) * (parseFloat(formData.downPayment) / 100) || 0;
  
  // Create phase labels with durations
  const phaseDurations = {
    'Closing Process': `${closingDays} days`,
    'Permitting': `${permitDays} days`,
    'Demolition': `${demoDays} days`,
    'Rough-In Work': `${roughInDays} days`,
    'Finishing Work': `${finishDays} days`,
    'Listing & Selling': `${listingDays} days`
  };
  
  // Create data for the Gantt chart
  const series = [
    {
      name: 'Project Timeline',
      data: [
        {
          x: 'Closing Process',
          y: [0, closingDays],
          fillColor: theme.palette.primary.light
        },
        {
          x: 'Permitting',
          y: [permitStart, permitStart + permitDays],
          fillColor: theme.palette.warning.light
        },
        {
          x: 'Demolition',
          y: [demoStart, demoStart + demoDays],
          fillColor: theme.palette.error.light
        },
        {
          x: 'Rough-In Work',
          y: [roughInStart, roughInStart + roughInDays],
          fillColor: theme.palette.info.light
        },
        {
          x: 'Finishing Work',
          y: [finishStart, finishStart + finishDays],
          fillColor: theme.palette.success.light
        },
        {
          x: 'Listing & Selling',
          y: [listingStart, listingStart + listingDays],
          fillColor: theme.palette.secondary.light
        }
      ]
    }
  ];

  // Create cash flow series for the chart
  const cashFlowSeries = [
    {
      name: 'Cash Flow',
      data: [
        {
          x: 'Down Payment',
          y: [0, 0],
          fillColor: theme.palette.error.main,
          cashFlow: -downPayment
        },
        {
          x: 'Monthly Expenses',
          y: [30, 30 * holdingPeriod],
          fillColor: theme.palette.warning.main,
          cashFlow: -monthlyExpenses * holdingPeriod
        },
        {
          x: 'Renovation Costs',
          y: [demoStart, finishStart + finishDays],
          fillColor: theme.palette.error.main,
          cashFlow: -renovationCost
        },
        {
          x: 'Sale Proceeds',
          y: [totalDays - 1, totalDays],
          fillColor: theme.palette.success.main,
          cashFlow: parseFloat(formData.expectedSellingPrice) * (1 - parseFloat(formData.sellingCosts) / 100)
        }
      ]
    }
  ];

  // Configure chart options
  const options = {
    chart: {
      height: 350,
      type: 'rangeBar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        rangeBarGroupRows: true
      }
    },
    xaxis: {
      type: 'numeric',
      title: {
        text: 'Days'
      }
    },
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const start = data.y[0];
        const end = data.y[1];
        const duration = end - start;
        const phaseName = data.x;
        
        return `
          <div class="apexcharts-tooltip-title" style="font-weight: bold; margin-bottom: 5px; font-size: 13px;">
            ${phaseName} (${phaseDurations[phaseName]})
          </div>
          <div class="apexcharts-tooltip-series-group">
            <span>Start: Day ${start}</span><br>
            <span>End: Day ${end}</span><br>
            <span>Duration: ${duration} days</span>
            ${condition !== 'fair' ? 
              `<br><span>Adjusted for ${condition} condition</span>` : 
              ''}
          </div>
        `;
      }
    },
    legend: {
      position: 'top'
    }
  };

  // Configure cash flow chart options
  const cashFlowOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: cashFlowSeries[0].data.map(item => item.x)
    },
    yaxis: {
      title: {
        text: 'Cash Flow ($)'
      },
      labels: {
        formatter: function(val) {
          return val >= 0 ? 
            '+$' + val.toLocaleString(undefined, {maximumFractionDigits: 0}) : 
            '-$' + Math.abs(val).toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val >= 0 ? 
            '+$' + val.toLocaleString(undefined, {maximumFractionDigits: 0}) : 
            '-$' + Math.abs(val).toLocaleString(undefined, {maximumFractionDigits: 0});
        }
      }
    },
    colors: cashFlowSeries[0].data.map(item => item.fillColor)
  };

  // Prepare data for cash flow chart
  const cashFlowData = [{
    name: 'Cash Flow',
    data: cashFlowSeries[0].data.map(item => item.cashFlow)
  }];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Project Timeline {condition !== 'fair' && `(Adjusted for ${condition.charAt(0).toUpperCase() + condition.slice(1)} Condition)`}
      </Typography>
      
      <Box 
        sx={{ mb: 4 }}
        onWheel={(e) => e.preventDefault()}
      >
        <Chart
          options={options}
          series={series}
          type="rangeBar"
          height={350}
        />
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Cash Flow Timing
      </Typography>
      
      <Box 
        sx={{ mb: 2 }}
        onWheel={(e) => e.preventDefault()}
      >
        <Chart
          options={cashFlowOptions}
          series={cashFlowData}
          type="bar"
          height={300}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This timeline is estimated based on your inputs and property condition. 
        {condition === 'teardown' && " A teardown property significantly extends renovation time compared to properties in better condition."}
        {condition === 'poor' && " A property in poor condition requires more extensive work than one in fair condition."}
        {condition === 'good' && " A property in good condition typically requires less renovation time than one in fair condition."}
        The cash flow chart shows when major expenses and income will occur during the project.
      </Typography>
    </Paper>
  );
};

export default TimelineVisualization; 