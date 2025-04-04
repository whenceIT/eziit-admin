import type React from "react";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, TablePagination 
} from "@mui/material";

export interface Merchant {
  id: number;
  user_id: string | null;
  merchant_code: string;
  stores: string | null;
  name: string;
  email: string;
  phone: string | null;
}

interface UnderwriterMerchantsTableProps {
  merchants: Merchant[];
  onViewDetails: (merchantId: number) => void;
  count?: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UnderwriterMerchantsTable: React.FC<UnderwriterMerchantsTableProps> = ({ 
  merchants, 
  onViewDetails,
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {}
}) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="merchants table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Merchant Code</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchants.map((merchant) => (
              <TableRow key={merchant.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{merchant.id}</TableCell>
                <TableCell>{merchant.name}</TableCell>
                <TableCell>{merchant.email}</TableCell>
                <TableCell>{merchant.phone || 'N/A'}</TableCell>
                <TableCell>{merchant.stores || 'N/A'}</TableCell>
                <TableCell>{merchant.merchant_code}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => onViewDetails(merchant.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {count > 0 && (
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </>
  );
};