import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tabs,
  Tab,
  FormLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';

// Renovation cost estimates per square foot by condition
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

function Calculator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Purchase Details
    purchasePrice: '',
    downPayment: '20',
    interestRate: '7.5',
    loanTerm: '30',
    
    // Renovation Details
    renovationMethod: 'manual', // 'manual' or 'estimate'
    renovationCost: '',
    holdingPeriod: '6',
    monthlyExpenses: '',
    
    // Renovation Breakdown
    renovationBreakdown: {
      roof: '0',
      siding: '0',
      kitchen: '0',
      bathroom: '0',
      windows: '0',
      doors: '0',
      flooring: '0',
      electrical: '0',
      plumbing: '0',
      hvac: '0',
      painting: '0',
      landscaping: '0',
      other: '0',
    },
    useBreakdown: false,
    
    // Renovation Estimator
    houseSize: '1500',
    houseCondition: 'fair',
    location: 'NJ',
    diyLevel: 'minimal',
    
    // Selling Details
    expectedSellingPrice: '',
    sellingCosts: '8',
    expectedMonthlyRent: '',
    
    // Timeline Details (for Gantt chart)
    timelineEstimates: {
      closingTime: '30', // days until closing
      permitTime: '15', // days to get permits
      demoTime: '7', // days for demolition
      roughInTime: '14', // days for rough-in work
      finishTime: '21', // days for finishing work
      listingTime: '45', // days on market
    }
  });

  const [openBreakdown, setOpenBreakdown] = useState(false);
  const [openEstimator, setOpenEstimator] = useState(false);
  const [renovationTab, setRenovationTab] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBreakdownChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      renovationBreakdown: {
        ...prev.renovationBreakdown,
        [name]: value
      }
    }));
  };

  const handleBreakdownOpen = () => {
    setOpenBreakdown(true);
  };

  const handleBreakdownClose = () => {
    setOpenBreakdown(false);
  };

  const handleEstimatorOpen = () => {
    setOpenEstimator(true);
  };

  const handleEstimatorClose = () => {
    setOpenEstimator(false);
  };

  const applyBreakdownTotal = () => {
    const total = Object.values(formData.renovationBreakdown)
      .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      renovationCost: total.toString(),
      useBreakdown: true,
      renovationMethod: 'manual'
    }));
    
    setOpenBreakdown(false);
  };

  const calculateRenovationEstimate = () => {
    const size = parseFloat(formData.houseSize) || 1500;
    const condition = formData.houseCondition || 'fair';
    const location = formData.location || 'TX';
    const diyLevel = formData.diyLevel || 'minimal';
    
    const baseCost = RENOVATION_COST_ESTIMATES[condition].base;
    const regionalMultiplier = REGIONAL_MULTIPLIERS[location] || 1.0;
    const diyFactor = DIY_FACTORS[diyLevel] || 1.0;
    
    const estimatedCost = Math.round(size * baseCost * regionalMultiplier * diyFactor / 100) * 100;
    
    setFormData(prev => ({
      ...prev,
      renovationCost: estimatedCost.toString(),
      renovationMethod: 'estimate',
      useBreakdown: false
    }));
    
    setOpenEstimator(false);
  };

  const handleTabChange = (event, newValue) => {
    setRenovationTab(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/results', { state: { formData } });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Real Estate Flip Calculator
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
          Fields marked with * are required
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Purchase Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Purchase Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="The amount you'll pay to purchase the property" placement="top">
                <TextField
                  fullWidth
                  label="Purchase Price *"
                  name="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Percentage of the purchase price you'll pay upfront" placement="top">
                <TextField
                  fullWidth
                  label="Down Payment (%) *"
                  name="downPayment"
                  type="number"
                  value={formData.downPayment}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>%</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Annual interest rate for your loan" placement="top">
                <TextField
                  fullWidth
                  label="Interest Rate (%) *"
                  name="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>%</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Length of the mortgage in years" placement="top">
                <TextField
                  fullWidth
                  label="Loan Term (years) *"
                  name="loanTerm"
                  type="number"
                  value={formData.loanTerm}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>years</Box>,
                  }}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Renovation Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Renovation Details
              </Typography>
              <Tabs 
                value={renovationTab} 
                onChange={handleTabChange}
                sx={{ mb: 2 }}
              >
                <Tab label="Manual Entry" />
                <Tab label="Condition Estimator" />
              </Tabs>
            </Grid>

            {renovationTab === 0 ? (
              // Manual Renovation Input
              <Grid item xs={12} sm={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Tooltip title="Total cost for all repairs and improvements" placement="top">
                    <TextField
                      fullWidth
                      label="Renovation Cost *"
                      name="renovationCost"
                      type="number"
                      value={formData.renovationCost}
                      onChange={handleChange}
                      required
                      disabled={formData.useBreakdown}
                      InputProps={{
                        startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                      }}
                    />
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<BuildIcon />}
                    onClick={handleBreakdownOpen}
                    sx={{ whiteSpace: 'nowrap', height: '56px' }}
                  >
                    Breakdown
                  </Button>
                </Box>
                {formData.useBreakdown && (
                  <Typography variant="caption" color="text.secondary">
                    Using breakdown total. Click 'Breakdown' to modify.
                  </Typography>
                )}
              </Grid>
            ) : (
              // Renovation Estimator Button
              <Grid item xs={12} sm={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Tooltip title="Estimated cost based on property condition and location" placement="top">
                    <TextField
                      fullWidth
                      label="Estimated Renovation Cost *"
                      name="renovationCost"
                      type="number"
                      value={formData.renovationCost}
                      onChange={handleChange}
                      required
                      disabled={formData.renovationMethod === 'estimate'}
                      InputProps={{
                        startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                      }}
                    />
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<CalculateIcon />}
                    onClick={handleEstimatorOpen}
                    sx={{ whiteSpace: 'nowrap', height: '56px' }}
                  >
                    Estimate
                  </Button>
                </Box>
                {formData.renovationMethod === 'estimate' && (
                  <Typography variant="caption" color="text.secondary">
                    Using estimated cost. Click 'Estimate' to recalculate.
                  </Typography>
                )}
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Tooltip title="How many months you'll hold the property before selling" placement="top">
                <TextField
                  fullWidth
                  label="Holding Period (months) *"
                  name="holdingPeriod"
                  type="number"
                  value={formData.holdingPeriod}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>months</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Monthly costs including utilities, insurance, property taxes, loan payments, HOA fees, and any other recurring expenses" placement="top">
                <TextField
                  fullWidth
                  label="Monthly Expenses *"
                  name="monthlyExpenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Selling Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Selling Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="The expected selling price after renovations (After Repair Value)" placement="top">
                <TextField
                  fullWidth
                  label="Expected Selling Price *"
                  name="expectedSellingPrice"
                  type="number"
                  value={formData.expectedSellingPrice}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Percentage of selling price that covers realtor commissions, closing costs, transfer taxes, etc." placement="top">
                <TextField
                  fullWidth
                  label="Selling Costs (%) *"
                  name="sellingCosts"
                  type="number"
                  value={formData.sellingCosts}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>%</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Tooltip title="Expected monthly rent if property is held as a rental (optional)" placement="top">
                <TextField
                  fullWidth
                  label="Expected Monthly Rent (optional)"
                  name="expectedMonthlyRent"
                  type="number"
                  value={formData.expectedMonthlyRent}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              type="submit"
              size="large"
            >
              Calculate
            </Button>
          </Box>
        </form>

        {/* Renovation Breakdown Dialog */}
        <Dialog 
          open={openBreakdown} 
          onClose={handleBreakdownClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Renovation Cost Breakdown
            <IconButton
              aria-label="close"
              onClick={handleBreakdownClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Roof"
                  name="roof"
                  type="number"
                  value={formData.renovationBreakdown.roof}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Siding"
                  name="siding"
                  type="number"
                  value={formData.renovationBreakdown.siding}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Kitchen"
                  name="kitchen"
                  type="number"
                  value={formData.renovationBreakdown.kitchen}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Bathroom"
                  name="bathroom"
                  type="number"
                  value={formData.renovationBreakdown.bathroom}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Windows"
                  name="windows"
                  type="number"
                  value={formData.renovationBreakdown.windows}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Doors"
                  name="doors"
                  type="number"
                  value={formData.renovationBreakdown.doors}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Flooring"
                  name="flooring"
                  type="number"
                  value={formData.renovationBreakdown.flooring}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Electrical"
                  name="electrical"
                  type="number"
                  value={formData.renovationBreakdown.electrical}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Plumbing"
                  name="plumbing"
                  type="number"
                  value={formData.renovationBreakdown.plumbing}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="HVAC"
                  name="hvac"
                  type="number"
                  value={formData.renovationBreakdown.hvac}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Painting"
                  name="painting"
                  type="number"
                  value={formData.renovationBreakdown.painting}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Landscaping"
                  name="landscaping"
                  type="number"
                  value={formData.renovationBreakdown.landscaping}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Other"
                  name="other"
                  type="number"
                  value={formData.renovationBreakdown.other}
                  onChange={handleBreakdownChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total: ${Object.values(formData.renovationBreakdown)
                  .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
                  .toLocaleString(undefined, {maximumFractionDigits: 0})}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBreakdownClose}>Cancel</Button>
            <Button onClick={applyBreakdownTotal} variant="contained">Apply Total</Button>
          </DialogActions>
        </Dialog>

        {/* Renovation Estimator Dialog */}
        <Dialog
          open={openEstimator}
          onClose={handleEstimatorClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Renovation Cost Estimator
            <IconButton
              aria-label="close"
              onClick={handleEstimatorClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="House Size (sq ft)"
                  name="houseSize"
                  type="number"
                  value={formData.houseSize}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: <Box component="span" sx={{ ml: 1 }}>sq ft</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>House Condition</InputLabel>
                  <Select
                    name="houseCondition"
                    value={formData.houseCondition}
                    onChange={handleChange}
                    label="House Condition"
                  >
                    <MenuItem value="teardown">
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>Teardown</span>
                        <Tooltip title="Complete gut renovation, structural issues, may need all new systems">
                          <InfoIcon fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                    </MenuItem>
                    <MenuItem value="poor">
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>Poor</span>
                        <Tooltip title="Needs new roof, windows, HVAC, kitchen, bathrooms, and major repairs">
                          <InfoIcon fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                    </MenuItem>
                    <MenuItem value="fair">
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>Fair</span>
                        <Tooltip title="Needs new paint, kitchen/bath updates, some repairs but overall structure is sound">
                          <InfoIcon fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                    </MenuItem>
                    <MenuItem value="good">
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>Good</span>
                        <Tooltip title="Needs cosmetic updates, paint, staging, minimal repairs">
                          <InfoIcon fontSize="small" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    label="Location"
                  >
                    {Object.keys(REGIONAL_MULTIPLIERS).sort().map(state => (
                      <MenuItem key={state} value={state}>
                        {state} {REGIONAL_MULTIPLIERS[state] > 1 ? '(Higher Cost)' : 
                              REGIONAL_MULTIPLIERS[state] < 1 ? '(Lower Cost)' : '(Average Cost)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>DIY Level</InputLabel>
                  <Select
                    name="diyLevel"
                    value={formData.diyLevel}
                    onChange={handleChange}
                    label="DIY Level"
                  >
                    <MenuItem value="significant">Significant DIY (40% savings)</MenuItem>
                    <MenuItem value="minimal">Minimal DIY (15% savings)</MenuItem>
                    <MenuItem value="gc">You as General Contractor (10% savings)</MenuItem>
                    <MenuItem value="none">Hire Full Service GC (No savings)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Estimated Cost Range:</Typography>
                  {(() => {
                    const size = parseFloat(formData.houseSize) || 1500;
                    const condition = formData.houseCondition || 'fair';
                    const location = formData.location || 'TX';
                    const diyLevel = formData.diyLevel || 'minimal';
                    
                    const [minCost, maxCost] = RENOVATION_COST_ESTIMATES[condition].range;
                    const regionalMultiplier = REGIONAL_MULTIPLIERS[location] || 1.0;
                    const diyFactor = DIY_FACTORS[diyLevel] || 1.0;
                    
                    const minEstimate = Math.round(size * minCost * regionalMultiplier * diyFactor / 100) * 100;
                    const maxEstimate = Math.round(size * maxCost * regionalMultiplier * diyFactor / 100) * 100;
                    
                    return (
                      <Typography variant="h5" align="center" color="primary.main">
                        ${minEstimate.toLocaleString(undefined, {maximumFractionDigits: 0})} - ${maxEstimate.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </Typography>
                    );
                  })()}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEstimatorClose}>Cancel</Button>
            <Button onClick={calculateRenovationEstimate} variant="contained">Apply Estimate</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default Calculator; 