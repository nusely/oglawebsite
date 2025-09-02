import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Users: React.FC = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add user')}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Users List
        </Typography>
        <Typography color="text.secondary">
          User management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Users;



