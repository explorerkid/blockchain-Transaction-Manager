import React, { useState, useEffect, useContext } from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminVerification = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/verify-transactions`,
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );
                setTransactions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching verification data:', error);
                setError('Failed to fetch verification data');
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Transaction Verification
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>MongoDB Status</TableCell>
                            <TableCell>Blockchain Status</TableCell>
                            <TableCell>Verification</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((txn) => (
                            <TableRow key={txn._id}>
                                <TableCell>{txn._id}</TableCell>
                                <TableCell>
                                    {txn.amount}
                                    {txn.amount !== txn.blockchainData?.amount && (
                                        <Alert severity="error" sx={{ mt: 1 }}>
                                            Blockchain: {txn.blockchainData?.amount}
                                        </Alert>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {txn.description}
                                    {txn.description !== txn.blockchainData?.description && (
                                        <Alert severity="error" sx={{ mt: 1 }}>
                                            Blockchain: {txn.blockchainData?.description}
                                        </Alert>
                                    )}
                                </TableCell>
                                <TableCell>{txn.approved ? 'Approved' : 'Pending'}</TableCell>
                                <TableCell>{txn.blockchainData?.approved ? 'Approved' : 'Pending'}</TableCell>
                                <TableCell>
                                    {txn.verified ? (
                                        <Alert severity="success">Verified</Alert>
                                    ) : (
                                        <Alert severity="error">Mismatch</Alert>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default AdminVerification; 