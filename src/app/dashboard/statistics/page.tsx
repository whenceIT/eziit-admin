'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

import { TotalRevenue } from '@/components/dashboard/statistics/total-revenue';

// Create a custom theme
let theme = createTheme({
  palette: {
    primary: {
      main: '#CBA328', // Gold
    },
    secondary: {
      main: '#5C5346', // Brown
    },
    info: {
      main: '#2196f3', // Blue
    },
    success: {
      main: '#4caf50', // Green
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

theme = responsiveFontSizes(theme);

// Mock data (replace with actual API calls in production)
const revenueData = [
    { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
    { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
  ];

const transactionData = [
  { name: 'User App', value: 400 },
  { name: 'Merchant App', value: 300 },
];

const topMerchants = [
  { name: 'Merchant A', revenue: 50000 },
  { name: 'Merchant B', revenue: 40000 },
  { name: 'Merchant C', revenue: 30000 },
  { name: 'Merchant D', revenue: 20000 },
  { name: 'Merchant E', revenue: 10000 },
  { name: 'Merchant F', revenue: 45000 },
  { name: 'Merchant G', revenue: 35000 },
  { name: 'Merchant H', revenue: 25000 },
  { name: 'Merchant I', revenue: 15000 },
  { name: 'Merchant J', revenue: 5000 },
];

export default function StatisticsPage() {
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom color="secondary">
           Statistics Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Total Revenue */}
          <Grid item xs={12} md={8}>
            <TotalRevenue chartSeries={revenueData} sx={{ height: '100%' }} />
          </Grid>

          {/* Total Transactions */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Total Traffic
                </Typography>
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <Pie
                      data={transactionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {transactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Users and Merchants */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom color="secondary">
                  Active Counts
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Active Clients" secondary="10" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Active Groups" secondary="20" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Active Merchants" secondary="100" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Outstanding Balances */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom color="secondary">
                  Outstanding Balances
                </Typography>
                <Typography variant="h4" color="#E25822">
                  k250,000
                </Typography>
                <Typography variant="subtitle1">
                  Aggregate of unpaid balances
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Group Wallet Usage */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom color="secondary">
                  Group Wallet Usage
                </Typography>
                <Typography variant="h4" color="#E25822">
                  350
                </Typography>
                <Typography variant="subtitle1">
                  Number of active groups
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Merchants */}
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Top Merchants by Revenue
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topMerchants} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#008080" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Outstanding Credit Analysis */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Outstanding Credit Analysis
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Total Outstanding" secondary="K100,000" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Overdue Payments" secondary="15%" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Merchants with Overdue Payments */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary">
                  Merchants with Overdue Payments
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Merchant X" secondary="K5,000 overdue" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Merchant Y" secondary="K3,500 overdue" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Merchant Z" secondary="K2,000 overdue" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}