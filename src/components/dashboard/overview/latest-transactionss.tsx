import { format } from "date-fns"
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { useRouter } from "next/navigation"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  user_type: string | null
  organisation_name: string | null
}

interface Transaction {
  id: number
  paid_by: string
  paid_to: string
  store: string | null
  paid_by_type: string | null
  paid_to_type: string | null
  amount: number
  time_stamp: string
  transaction_type: string | null
  paid_by_user: User | null
  paid_to_user: User | null
}

export const LatestOrders = ({ transactions = [], sx }: { transactions: Transaction[]; sx?: object }) => {
  const router = useRouter()
  const formatName = (user: User | null, type: string | null) => {
    if (!user) return "N/A"
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.organisation_name || user.email
    return `${name} (${type || user.user_type || "N/A"})`
  }

  const handleViewAll = () => {
    router.push("/dashboard/transactions")
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Latest Transactions" />
      <Box sx={{ overflow: "auto", maxHeight: 400 }}>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>Paid By</TableCell>
                <TableCell>Paid To</TableCell>
                <TableCell sortDirection="desc">Date</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => {
                const createdAt = format(new Date(transaction.time_stamp), "dd/MM/yyyy")

                return (
                  <TableRow hover key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{formatName(transaction.paid_by_user, transaction.paid_by_type)}</TableCell>
                    <TableCell>{formatName(transaction.paid_to_user, transaction.paid_to_type)}</TableCell>
                    <TableCell>{createdAt}</TableCell>
                    <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          variant="text"
          onClick={handleViewAll}
        >
          View all
        </Button>
      </CardActions>
    </Card>
  )
}

