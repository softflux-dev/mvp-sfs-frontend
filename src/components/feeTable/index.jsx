import { Box, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";

const FeeTable = ({ tableHeader, tableData, displayRows, sx }) => {
    return (
        <Box sx={{ overflowX: "auto", ...sx }}>
            <Table>
                {/* Table Header */}
                <TableHead>
                    <TableRow>
                        {tableHeader.map((head) => (
                            <TableCell
                                key={head.label}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: "#f5f5f5",
                                    textAlign: "center",
                                    paddingY: 1,
                                    borderBottom: "1px solid #e0e0e0",
                                }}
                            >
                                {head.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                    {tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {displayRows.map((key) => (
                                <TableCell
                                    key={key}
                                    sx={{
                                        textAlign: "center",
                                        paddingY: 1,
                                        borderBottom: "1px solid #e0e0e0",
                                    }}
                                >
                                    {key === "registration_status" ? (
                                        <Box
                                            sx={{
                                                display: "inline-block",
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "12px",
                                                backgroundColor:
                                                    row[key] === "Paid" ? "#DFF6E3" : "#FFE3E3",
                                                color: row[key] === "Paid" ? "#27AE60" : "#D32F2F",
                                                fontWeight: 500,
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            {row[key]}
                                        </Box>
                                    ) : (
                                        <Typography>{row[key]}</Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default FeeTable;
