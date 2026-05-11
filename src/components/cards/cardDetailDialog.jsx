import { useState } from "react";
import { Box, Typography, Avatar, Chip, Divider, IconButton, TextField } from "@mui/material";
import { X, Plus, Tag, Calendar, CheckSquare, Users, Paperclip, Send } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DialogContainer } from "../../components";
import CustomButton  from "../customButton";
import GlobalStyle   from "../../style/style";

// ── Label colors ──────────────────────────────────────────────────────────
const LABEL_OPTIONS = [
  { id: 1, color: "#04C373", name: ""           },
  { id: 2, color: "#F5A623", name: ""           },
  { id: 3, color: "#FF972F", name: ""           },
  { id: 4, color: "#FF0000", name: "Important"  },
  { id: 5, color: "#AA2493", name: "Low priority"},
  { id: 6, color: "#2B6EFF", name: ""           },
  { id: 7, color: "#04C373", name: "high p"     },
];

const PRIORITY_CONFIG = {
  High:   { bg: "#04C3731A", color: "#04C373" },
  Medium: { bg: "#AA24931A", color: "#AA2493" },
  Low:    { bg: "#2B6EFF1A", color: "#2B6EFF" },
};

const MOCK_MEMBERS = [
  { id: 1, name: "Sarah Johnson",  avatar: "" },
  { id: 2, name: "James Chen",     avatar: "" },
  { id: 3, name: "Aisha Patel",    avatar: "" },
  { id: 4, name: "Michael Williams",avatar:"" },
];

const CardDetailDialog = ({ open, onClose, card = {}, columnLabel = "", onUpdate }) => {
  const [title,        setTitle]        = useState(card.title        || "");
  const [description,  setDescription]  = useState(card.description  || "");
  const [editingDesc,  setEditingDesc]  = useState(false);
  const [startDate,    setStartDate]    = useState(null);
  const [endDate,      setEndDate]      = useState(null);
  const [showDates,    setShowDates]    = useState(false);
  const [showLabels,   setShowLabels]   = useState(false);
  const [showMembers,  setShowMembers]  = useState(false);
  const [selectedLabels,  setSelectedLabels]  = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [comment,      setComment]      = useState("");
  const [comments,     setComments]     = useState(card.activityLog || [
    { id: 1, author: "You", avatar: "", text: `added this card to ${columnLabel}`, date: "2026-03-18 09:30", isSystem: true },
  ]);
  const [attachments,  setAttachments]  = useState([]);
  const [labelSearch,  setLabelSearch]  = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const pcfg = PRIORITY_CONFIG[card.priority] || { bg: "#F5F5F5", color: "#757575" };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id:       Date.now(),
        author:   "You",
        avatar:   "",
        text:     comment.trim(),
        date:     new Date().toISOString().slice(0, 16).replace("T", " "),
        isSystem: false,
      },
    ]);
    setComment("");
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files.map((f) => ({ id: Date.now() + Math.random(), name: f.name, size: f.size }))]);
  };

  const toggleLabel   = (id) => setSelectedLabels((p)  => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleMember  = (id) => setSelectedMembers((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const filteredLabels  = LABEL_OPTIONS.filter((l) => l.name.toLowerCase().includes(labelSearch.toLowerCase()));
  const filteredMembers = MOCK_MEMBERS.filter((m)  => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogContainer open={open} onClose={onClose} maxWidth="860px" fullWidth>
        <Box sx={{ display: "flex", minHeight: "500px" }}>

          {/* ── LEFT panel ───────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, p: 3, overflowY: "auto", borderRight: "1px solid #F0F0F0" }}>

            {/* Column label chip */}
            <Chip
              label={columnLabel}
              size="small"
              sx={{
                mb: 1.5, fontSize: "12px", fontWeight: 500,
                backgroundColor: "#F5F5F5", color: "#67768B",
                borderRadius: "6px",
              }}
            />

            {/* Title */}
            <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
              <Box
                sx={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "2px solid #D0D0D0", flexShrink: 0, mt: 0.5,
                }}
              />
              <TextField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="standard"
                fullWidth
                multiline
                InputProps={{ disableUnderline: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "22px", fontWeight: 700,
                    color: "#030229", fontFamily: '"Poppins", sans-serif',
                    lineHeight: 1.3,
                  },
                }}
              />
            </Box>

            {/* Priority chip */}
            <Box mb={2}>
              <Chip
                label={card.priority || "Medium"}
                sx={{
                  height: "22px", fontSize: "11px", fontWeight: 500,
                  px: 0.5, borderRadius: "6px",
                  backgroundColor: pcfg.bg, color: pcfg.color,
                }}
              />
            </Box>

            {/* Action buttons */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={2.5}>
              {[
                                         
                { label: "Labels",    icon: <Tag size={14} />,         action: () => { setShowLabels(!showLabels); setShowDates(false); setShowMembers(false); } },
                { label: "Dates",     icon: <Calendar size={14} />,    action: () => { setShowDates(!showDates); setShowLabels(false); setShowMembers(false);  } },
                { label: "Checklist", icon: <CheckSquare size={14} />, action: null                          },
                { label: "Members",   icon: <Users size={14} />,       action: () => { setShowMembers(!showMembers); setShowLabels(false); setShowDates(false); } },
                { label: "Attachment",icon: null,                      isFile: true                          },
              ].map((btn) => (
                btn.isFile ? (
                  <Box key="attachment" component="label" sx={actionBtnSx}>
                    <Paperclip size={14} />
                    <Typography fontSize="13px" fontWeight={500}>Attachment</Typography>
                    <input type="file" hidden multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleAttachment} />
                  </Box>
                ) : (
                  <Box
                    key={btn.label}
                    onClick={btn.action}
                    sx={{
                      ...actionBtnSx,
                      backgroundColor: (btn.label === "Labels" && showLabels) ||
                                        (btn.label === "Dates"  && showDates)  ||
                                        (btn.label === "Members"&& showMembers)
                        ? "#030229" : "#F5F5F5",
                      color: (btn.label === "Labels" && showLabels) ||
                              (btn.label === "Dates"  && showDates)  ||
                              (btn.label === "Members"&& showMembers)
                        ? "#fff" : "#030229",
                    }}
                  >
                    {btn.icon}
                    <Typography fontSize="13px" fontWeight={500}>{btn.label}</Typography>
                  </Box>
                )
              ))}
            </Box>

            {/* ── Labels popover ─────────────────────────────────────────── */}
            {showLabels && (
              <Box sx={popoverSx}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography fontSize="13px" fontWeight={600}>Labels</Typography>
                  <IconButton size="small" onClick={() => setShowLabels(false)}><X size={14} /></IconButton>
                </Box>
                <TextField
                  size="small" fullWidth placeholder="Search labels..."
                  value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)}
                  sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                />
                <Typography fontSize="11px" fontWeight={600} color="text.secondary" mb={1}>Labels</Typography>
                {filteredLabels.map((label) => (
                  <Box
                    key={label.id}
                    display="flex" alignItems="center" gap={1} mb={0.75}
                    sx={{ cursor: "pointer" }}
                    onClick={() => toggleLabel(label.id)}
                  >
                    <Box
                      sx={{
                        width: 16, height: 16, borderRadius: "3px",
                        border: "1.5px solid #D0D0D0",
                        backgroundColor: selectedLabels.includes(label.id) ? "#AA2493" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {selectedLabels.includes(label.id) && (
                        <Box component="svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        flex: 1, height: 32, borderRadius: "6px",
                        backgroundColor: label.color,
                        display: "flex", alignItems: "center", px: 1.5,
                      }}
                    >
                      {label.name && (
                        <Typography fontSize="12px" fontWeight={600} color="#fff">
                          {label.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                <Box
                  sx={{ ...actionBtnSx, width: "100%", justifyContent: "center", mt: 1 }}
                  onClick={() => {}}
                >
                  <Plus size={14} />
                  <Typography fontSize="13px">Create a new label</Typography>
                </Box>
              </Box>
            )}

            {/* ── Dates popover ──────────────────────────────────────────── */}
            {showDates && (
              <Box sx={popoverSx}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography fontSize="13px" fontWeight={600}>Dates</Typography>
                  <IconButton size="small" onClick={() => setShowDates(false)}><X size={14} /></IconButton>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box>
                    <Typography fontSize="12px" color="text.secondary" mb={0.5}>Start Date</Typography>
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                      sx={GlobalStyle.datePickerStyle}
                    />
                  </Box>
                  <Box>
                    <Typography fontSize="12px" color="text.secondary" mb={0.5}>End Date</Typography>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                      sx={GlobalStyle.datePickerStyle}
                    />
                  </Box>
                  <CustomButton btnLabel="Save" variant="gradient" handlePressBtn={() => setShowDates(false)} />
                </Box>
              </Box>
            )}

            {/* ── Members popover ────────────────────────────────────────── */}
            {showMembers && (
              <Box sx={popoverSx}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography fontSize="13px" fontWeight={600}>Members</Typography>
                  <IconButton size="small" onClick={() => setShowMembers(false)}><X size={14} /></IconButton>
                </Box>
                <TextField
                  size="small" fullWidth placeholder="Search members..."
                  value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                  sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13px" } }}
                />
                <Typography fontSize="11px" fontWeight={600} color="text.secondary" mb={1}>Board members</Typography>
                {filteredMembers.map((member) => (
                  <Box
                    key={member.id}
                    display="flex" alignItems="center" gap={1.5} py={0.75}
                    sx={{
                      cursor: "pointer", borderRadius: "8px", px: 1,
                      backgroundColor: selectedMembers.includes(member.id) ? "#F5F5F5" : "transparent",
                      "&:hover": { backgroundColor: "#F5F5F5" },
                    }}
                    onClick={() => toggleMember(member.id)}
                  >
                    <Avatar
                      src={member.avatar}
                      sx={{
                        width: 32, height: 32,
                        background: "linear-gradient(135deg, #AA2493, #022179)",
                        fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      {member.name?.charAt(0)}
                    </Avatar>
                    <Typography fontSize="13px" fontWeight={500} color="text.primary">
                      {member.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Selected labels display */}
            {selectedLabels.length > 0 && (
              <Box mb={2}>
                <Typography fontSize="12px" fontWeight={600} color="text.secondary" mb={1}>Labels</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {selectedLabels.map((id) => {
                    const l = LABEL_OPTIONS.find((x) => x.id === id);
                    return (
                      <Box
                        key={id}
                        sx={{
                          height: 28, px: 1.5, borderRadius: "6px",
                          backgroundColor: l?.color, display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography fontSize="11px" fontWeight={600} color="#fff">
                          {l?.name || ""}
                        </Typography>
                      </Box>
                    );
                  })}
                  <Box
                    sx={{ height: 28, px: 1.5, borderRadius: "6px", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", cursor: "pointer" }}
                    onClick={() => setShowLabels(true)}
                  >
                    <Plus size={14} color="#67768B" />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Attachments list */}
            {attachments.length > 0 && (
              <Box mb={2}>
                <Typography fontSize="12px" fontWeight={600} color="text.secondary" mb={1}>Attachments</Typography>
                {attachments.map((att) => (
                  <Box
                    key={att.id}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      backgroundColor: "#F5F5F5", borderRadius: "10px",
                      px: 2, py: 1.25, mb: 1,
                    }}
                  >
                    <Paperclip size={14} color="#67768B" />
                    <Typography fontSize="13px" color="text.primary">{att.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Description */}
            <Box mb={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box component="svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M2 8h8M2 12h10" stroke="#67768B" strokeWidth="1.5" strokeLinecap="round" />
                  </Box>
                  <Typography fontSize="14px" fontWeight={600} color="text.primary">Description</Typography>
                </Box>
                {!editingDesc && (
                  <Box
                    sx={{ ...actionBtnSx, px: 1.5, py: 0.5 }}
                    onClick={() => setEditingDesc(true)}
                  >
                    <Typography fontSize="12px">Edit</Typography>
                  </Box>
                )}
              </Box>

              {editingDesc ? (
                <Box>
                  <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline rows={4} fullWidth
                    placeholder="Add a more detailed description..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", fontSize: "13px",
                        fontFamily: '"Poppins", sans-serif',
                      },
                    }}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <CustomButton btnLabel="Save" variant="gradient" handlePressBtn={() => setEditingDesc(false)} sx={{ height: "32px", fontSize: "12px" }} />
                    <Box sx={{ ...actionBtnSx, px: 1.5, py: 0.5 }} onClick={() => setEditingDesc(false)}>
                      <Typography fontSize="12px">Cancel</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{ backgroundColor: "#F5F5F5", borderRadius: "10px", px: 2, py: 1.5, cursor: "text", minHeight: 60 }}
                  onClick={() => setEditingDesc(true)}
                >
                  <Typography fontSize="13px" color={description ? "text.primary" : "text.secondary"}>
                    {description || "Add a more detailed description..."}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── RIGHT panel — Comments ────────────────────────────────────── */}
          <Box sx={{ width: 340, p: 3, display: "flex", flexDirection: "column", flexShrink: 0 }}>

            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box component="svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10a2 2 0 0 1-2 2H4l-2 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" stroke="#67768B" strokeWidth="1.5" strokeLinejoin="round" />
                </Box>
                <Typography fontSize="14px" fontWeight={600} color="text.primary">Comments and activity</Typography>
              </Box>
              <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
            </Box>

            {/* Comment input */}
            <Box
              sx={{
                border: "1.5px solid #E0E0E0", borderRadius: "10px",
                px: 1.5, py: 1, mb: 2,
              }}
            >
              <TextField
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                multiline fullWidth
                variant="standard"
                InputProps={{ disableUnderline: true }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "13px", fontFamily: '"Poppins", sans-serif',
                  },
                }}
              />
              {comment.trim() && (
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <CustomButton
                    btnLabel="Send"
                    variant="gradient"
                    handlePressBtn={handleSendComment}
                    startIcon={<Send size={13} />}
                    sx={{ height: "30px", fontSize: "12px" }}
                  />
                </Box>
              )}
            </Box>

            {/* Activity list */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {comments.map((c) => (
                <Box key={c.id} display="flex" gap={1.5} mb={2}>
                  <Avatar
                    src={c.avatar}
                    sx={{
                      width: 28, height: 28, flexShrink: 0,
                      background: "linear-gradient(135deg, #AA2493, #022179)",
                      fontSize: "11px", fontWeight: 600,
                    }}
                  >
                    {c.author?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                      <Typography fontSize="12px" fontWeight={700} color="text.primary">{c.author}</Typography>
                      <Typography fontSize="11px" color="text.secondary">{c.date}</Typography>
                    </Box>
                    <Typography fontSize="12px" color={c.isSystem ? "text.secondary" : "text.primary"}>
                      {c.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContainer>
    </LocalizationProvider>
  );
};

// ── Shared sx helpers ─────────────────────────────────────────────────────
const actionBtnSx = {
  display: "flex", alignItems: "center", gap: 0.75,
  backgroundColor: "#F5F5F5", color: "#030229",
  px: 1.5, py: 0.75, borderRadius: "8px",
  cursor: "pointer", userSelect: "none",
  fontSize: "13px", fontWeight: 500,
  fontFamily: '"Poppins", sans-serif',
  "&:hover": { backgroundColor: "#EBEBEB" },
  transition: "all 0.15s ease",
};

const popoverSx = {
  backgroundColor: "#fff",
  border: "1px solid #F0F0F0",
  borderRadius: "12px",
  p: 2,
  mb: 2,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  maxWidth: 320,
};

export default CardDetailDialog;