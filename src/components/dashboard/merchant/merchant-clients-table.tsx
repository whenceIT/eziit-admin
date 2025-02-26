import type React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import type { MerchantClient } from "@/app/merchant-dashboard/clients/page";

interface MerchantClientsTableProps {
  clients: MerchantClient[];
}

export const MerchantClientsTable: React.FC<MerchantClientsTableProps> = ({ clients }) => {

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="merchant clients table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Float</TableCell>
            <TableCell>Employer</TableCell>
            <TableCell>Ratings</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {client.name}
              </TableCell>
              <TableCell>{client.float}</TableCell>
              <TableCell>{client.employer}</TableCell>
              
              <TableCell>{client.ratings}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};