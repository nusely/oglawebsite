import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  Article as StoriesIcon,
  People as UsersIcon,
  Assignment as RequestsIcon,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

interface DashboardStats {
  totalProducts: number;
  totalStories: number;
  totalUsers: number;
  totalRequests: number;
}

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // In a real app, you'd have a dedicated stats endpoint
      // For now, we'll fetch individual data
      const [products, stories, users, requests] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/stories?limit=1'),
        api.get('/users?limit=1'),
        api.get('/requests?limit=1'),
      ]);

      return {
        totalProducts: products.data.data?.pagination?.total || 0,
        totalStories: stories.data.data?.pagination?.total || 0,
        totalUsers: users.data.data?.pagination?.total || 0,
        totalRequests: requests.data.data?.pagination?.total || 0,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <ProductsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Stories',
      value: stats?.totalStories || 0,
      icon: <StoriesIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#dc004e',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <UsersIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total Requests',
      value: stats?.totalRequests || 0,
      icon: <RequestsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
    },
  ];

  const recentActivities = [
    { text: 'New product "Pure Shea Butter" added', time: '2 hours ago' },
    { text: 'User registration: john@example.com', time: '4 hours ago' },
    { text: 'New request submitted: REQ-2024-001', time: '6 hours ago' },
    { text: 'Story "Benefits of Shea Butter" published', time: '1 day ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome to the Ogla Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <ProductsIcon />
                </ListItemIcon>
                <ListItemText primary="Add New Product" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <StoriesIcon />
                </ListItemIcon>
                <ListItemText primary="Create New Story" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <UsersIcon />
                </ListItemIcon>
                <ListItemText primary="View All Users" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <RequestsIcon />
                </ListItemIcon>
                <ListItemText primary="Process Requests" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;



