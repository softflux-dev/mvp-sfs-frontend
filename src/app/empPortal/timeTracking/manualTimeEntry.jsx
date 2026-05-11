import { useState } from "react";
import { Box, Typography, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import CustomSelect  from "../../../components/customSelect";
import TextInput     from "../../../components/textInput";
import CustomButton  from "../../../components/customButton";
import GlobalStyle   from "../../../style/style";
import { TimePicker }           from "@mui/x-date-pickers/TimePicker";

const taskOptions = [
  { v: "task1", l: "Build user authentication module" },
  { v: "task2", l: "Design product listing page"      },
  { v: "task3", l: "Setup CI/CD pipeline"             },
  { v: "task4", l: "Patient records API"              },
  { v: "task5", l: "Write unit tests for auth module" },
];

const ManualTimeEntry = ({ onAddEntry }) => {
  const [task, setTask]   = useState("");
  const [date, setDate]   = useState(null);
  const [time, setTime]   = useState("");
  const [note, setNote]   = useState("");

  const handleAdd = () => {
    if (!task || !time) return;
    onAddEntry?.({
      task,
      date: date ? date.toLocaleDateString("en-GB") : "",
      duration: time,
      note,
      type: "Manual",
    });
    setTask(""); setDate(null); setTime(""); setNote("");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: "#F5F5F5", borderRadius: "25px", p: 3, mb: 3 }}>
        <Typography fontSize="18px" fontWeight={700} color="text.primary" mb={2}>
          Manual Time Entry
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Task select */}
          <Box flex="1" minWidth="180px">
            <CustomSelect
              placeholder="Select task"
              fullWidth
              height="48px"
              inputBgColor="#fff"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            >
              {taskOptions.map((op) => (
                <MenuItem key={op.v} value={op.v}>{op.l}</MenuItem>
              ))}
            </CustomSelect>
          </Box>

          {/* Date picker */}
          <Box flex="1" minWidth="160px">
           <DatePicker
                onChange={(val) => {}}
                format="dd/MM/yyyy"
                slotProps={{
                    textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                        ...GlobalStyle.datePickerStyle,
                        "& .MuiPickersInputBase-root": {
                        backgroundColor: "#fff !important",
                        borderRadius: "14px !important",
                        },
                       
                        "& .MuiPickersSectionList-root": {
                        padding: "14px",
                        },
                    },
                    },
                }}
                />
          </Box>

          {/* Duration HH:MM */}
          <Box flex="1" minWidth="120px">
           <TimePicker
            ampm={false}
            format="HH:mm"
            slotProps={{
                textField: {
                size: "small",
                fullWidth: true,
                sx: {
                    ...GlobalStyle.datePickerStyle,
                    "& .MuiPickersInputBase-root": {
                    backgroundColor: "#fff !important",
                    borderRadius: "14px !important",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                    },
                    "& .MuiPickersSectionList-root": {
                    padding: "14px",
                    },
                },
                },
            }}
            />
          </Box>

          {/* Note */}
          <Box flex="2" minWidth="180px">
            <TextInput
              placeholder="Note/Description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              inputBgColor="#fff"
              height="48px"
              fullWidth
            />
          </Box>

          {/* Add button */}
          <CustomButton
            btnLabel="+ Add Entry"
            variant="gradient"
            handlePressBtn={handleAdd}
            sx={{ height: "48px", minWidth: "130px", whiteSpace: "nowrap" }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ManualTimeEntry;