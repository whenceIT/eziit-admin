'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // do nothing
}

export interface Client {
  id: number;
  user_id: number | null;
  name: string;
  float: number | null;
  merchants: string | null;
  transactions: string | null;
  employer: string | null;
  ratings: number | null;
  comments: string | null;
}

interface ClientsTableProps {
  count?: number;
  page?: number;
  rows?: Client[];
  rowsPerPage?: number;
}

export function ClientsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: ClientsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((client) => client.id), [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Float</TableCell>
              <TableCell>Merchants</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Employer</TableCell>
              <TableCell>Ratings</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user_id ?? 'N/A'}</TableCell>
                  <TableCell>{row.name ?? 'N/A'}</TableCell>
                  <TableCell>{row.float ?? 0}</TableCell>
                  <TableCell>{row.merchants ?? 'N/A'}</TableCell>
                  <TableCell>{row.transactions ?? 'N/A'}</TableCell>
                  <TableCell>{row.employer ?? 'N/A'}</TableCell>
                  <TableCell>{row.ratings ?? 0}</TableCell>
                  <TableCell>{row.comments ?? ''}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
