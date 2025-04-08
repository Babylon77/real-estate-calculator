import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';

function Navbar() {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Real Estate Flip Calculator
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/calculator"
            startIcon={<CalculateIcon />}
          >
            Calculator
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 