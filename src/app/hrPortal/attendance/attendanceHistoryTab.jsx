import { Box }        from "@mui/material";
import PaginatedTable from "../../../components/dynamicTable";

const tableHeader = [
  { id: "date",       label: "Date"        },
  { id: "timestamp",  label: "Time Stamp"  },
  { id: "fileName",   label: "File Name"   },
  { id: "fileSize",   label: "File Size"   },
  { id: "records",    label: "Records"     },
  { id: "status",     label: "Status"      },
  { id: "actions",    label: "Actions"     },
];

const displayRows = [
  "imp_date",
  "imp_timestamp",
  "imp_file_name",
  "imp_file_size",
 
  "imp_records",
  "imp_status",
  "imp_actions",
];

const AttendanceHistoryTab = ({ logs = [] }) => {
  return (
    <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
      <PaginatedTable
        tableHeader={tableHeader}
        tableData={logs}
        displayRows={displayRows}
        isLoading={false}
        onDownloadClick={(row) => console.log("Download", row.fileName)}
        onDeleteClick={(row)   => console.log("Delete",   row.id)}
      />
    </Box>
  );
};

export default AttendanceHistoryTab;