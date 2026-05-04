// src/components/skeleton/TableSkeleton.jsx
import React from "react";
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const TableFeeSkeleton = ({ columns = 5, rows = 4 }) => {
    return (
        <Box width="100%">
            <Table>
                {/* Table Head Skeleton */}
                <TableHead>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, index) => (
                            <TableCell key={index}>
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={30}
                                    sx={{ borderRadius: 2 }} 
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                {/* Table Body Skeleton */}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height={30}
                                        sx={{ borderRadius: 2 }} // body ke liye bhi rounded
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default TableFeeSkeleton;