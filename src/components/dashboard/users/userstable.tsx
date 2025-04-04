// userstable.tsx
import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

export interface User {
  id: string;
  email: string;
  user_type: string; // Changed from enum to string for more flexibility
  first_name: string;
  last_name: string;
}

interface UsersTableProps {
  users: User[];
  onLoginAsUser: (userId: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onLoginAsUser }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.user_type}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onLoginAsUser(user.id)}
                >
                  Login
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};