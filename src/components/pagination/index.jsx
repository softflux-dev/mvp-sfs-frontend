import { Box, Typography, IconButton, MenuItem, Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "../customSelect";

const Pagination = ({
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = page || 1;
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const handlePrevious = () => {
    if (currentPage > 1) {
      // MUI TablePagination uses 0-indexed pages, so we pass currentPage - 2
      onPageChange(null, currentPage - 2);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      // MUI TablePagination uses 0-indexed pages, so we pass currentPage (which is currentPage - 1 in 0-indexed)
      onPageChange(null, currentPage);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(null, pageNumber - 1);
    }
  };

  const handleRowsPerPageChangeLocal = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event, newLimit);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (total === 0) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        flexWrap: "wrap",
        mt: 4,
        pt: 3,
        borderTop: "1px solid #E5E7EB",
        backgroundColor: "#FAFAFA",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      {/* Left side - Rows per page selector */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#6B7280",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Rijen per pagina:
        </Typography>
        <Box sx={{ minWidth: "90px" }}>
          <CustomSelect
            value={limit}
            onChange={handleRowsPerPageChangeLocal}
            inputBgColor="#fff"
            height="38px"
            fullWidth={false}
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </CustomSelect>
        </Box>
      </Box>

      {/* Right side - Page numbers and navigation */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* Previous button */}
        <IconButton
          onClick={handlePrevious}
          disabled={currentPage === 1}
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: currentPage === 1 ? "#E5E7EB" : "#D1D5DB",
            backgroundColor: currentPage === 1 ? "#F9FAFB" : "#fff",
            color: currentPage === 1 ? "#9CA3AF" : "#374151",
            transition: "all 0.2s ease",
            "&:hover:not(:disabled)": {
              backgroundColor: "#F3F4F6",
              borderColor: "#9CA3AF",
            },
            "&.Mui-disabled": {
              backgroundColor: "#F9FAFB",
              borderColor: "#E5E7EB",
              cursor: "not-allowed",
            },
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>

        {/* Page numbers */}
        <Box display="flex" alignItems="center" gap={0.5}>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <Typography
                  key={`ellipsis-${index}`}
                  sx={{
                    px: 1,
                    fontSize: "14px",
                    color: "#6B7280",
                    fontWeight: 500,
                  }}
                >
                  ...
                </Typography>
              );
            }

            const isActive = pageNum === currentPage;
            return (
              <Button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                disabled={isActive}
                sx={{
                  minWidth: "36px",
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#374151" : "#6B7280",
                  backgroundColor: isActive ? "#F3F4F6" : "transparent",
                  border: isActive ? "1px solid #D1D5DB" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover:not(:disabled)": {
                    backgroundColor: "#F9FAFB",
                    borderColor: "#D1D5DB",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#F3F4F6",
                    borderColor: "#D1D5DB",
                    cursor: "default",
                  },
                }}
              >
                {pageNum}
              </Button>
            );
          })}
        </Box>

        {/* Next button */}
        <IconButton
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          sx={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: currentPage >= totalPages ? "#E5E7EB" : "#D1D5DB",
            backgroundColor: currentPage >= totalPages ? "#F9FAFB" : "#fff",
            color: currentPage >= totalPages ? "#9CA3AF" : "#374151",
            transition: "all 0.2s ease",
            "&:hover:not(:disabled)": {
              backgroundColor: "#F3F4F6",
              borderColor: "#9CA3AF",
            },
            "&.Mui-disabled": {
              backgroundColor: "#F9FAFB",
              borderColor: "#E5E7EB",
              cursor: "not-allowed",
            },
          }}
        >
          <ChevronRight size={18} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;

