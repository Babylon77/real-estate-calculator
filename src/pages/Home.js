import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CalculateIcon from '@mui/icons-material/Calculate';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Real Estate Flip Calculator
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
          Analyze your potential real estate investment opportunities
        </Typography>
        <Typography variant="body1" paragraph>
          Our calculator helps you evaluate the profitability of house flipping projects by considering:
        </Typography>
        <Box sx={{ textAlign: 'left', mb: 4 }}>
          <ul>
            <li>Purchase price and financing costs</li>
            <li>Renovation and repair estimates</li>
            <li>Holding costs and carrying expenses</li>
            <li>Expected selling price and closing costs</li>
            <li>Potential profit margins and ROI</li>
          </ul>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<CalculateIcon />}
          onClick={() => navigate('/calculator')}
        >
          Start Calculating
        </Button>
      </Paper>
    </Container>
  );
}

export default Home; 