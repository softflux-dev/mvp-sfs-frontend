// src/app/shared/messages/conversationList.jsx — FULL REPLACEMENT
import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, IconButton, Skeleton, Collapse, Menu, MenuItem } from "@mui/material";
import { Plus, Search, ChevronDown, ChevronRight, RotateCcw, Trash2, MoreVertical } from "lucide-react";
import TextInput          from "../../../components/textInput";
import ConversationItem   from "./conversationItem";
import ConfirmationDialog from "../../../components/popups/confirmation";
import {
  getArchivedConversationsApi,
  restoreConversationApi,
  deleteConversationApi,
} from "../../../api/modules/messages";
import useUserStore from "../../../zustand/useUserStore";

const SectionLabel = ({ label }) => (
  <Typography fontSize="11px" fontWeight={700} color="text.darkGray"
    sx={{ px: 1, pt: 2, pb: 0.75, letterSpacing: "0.8px", textTransform: "uppercase" }}>
    {label}
  </Typography>
);

const ConversationSkeleton = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
    <Skeleton variant="circular" width={42} height={42} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="80%" height={13} sx={{ mt: 0.5 }} />
    </Box>
  </Box>
);

const EmptySection = ({ label }) => (
  <Box px={2} py={1.5}>
    <Typography fontSize="12px" color="text.secondary" fontStyle="italic">
      No {label.toLowerCase()} yet
    </Typography>
  </Box>
);

const ArchivedItem = ({ conversation, onRestore, onDelete }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuBtnRef  = useRef();
  const name        = conversation.name || "Group Chat";
  const archivedAt  = conversation.archivedAt
    ? new Date(conversation.archivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, borderRadius: "12px", backgroundColor: "#FFF8F8", border: "1px solid #FECACA", mb: 0.5 }}>
      <Box sx={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #9CA3AF, #6B7280)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
        {name.charAt(0).toUpperCase()}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize="13px" fontWeight={500} color="text.secondary" noWrap>{name}</Typography>
        {archivedAt && <Typography fontSize="11px" color="#9CA3AF">Archived {archivedAt}</Typography>}
      </Box>
      <IconButton size="small" onClick={() => onRestore(conversation._id)} title="Restore"
        sx={{ color: "#AA2493", flexShrink: 0, "&:hover": { backgroundColor: "#AA249315" } }}>
        <RotateCcw size={14} />
      </IconButton>
      <IconButton ref={menuBtnRef} size="small" onClick={() => setMenuAnchor(menuBtnRef.current)}
        sx={{ color: "#9CA3AF", flexShrink: 0, "&:hover": { color: "#FF3B30" } }}>
        <MoreVertical size={14} />
      </IconButton>
      <Menu
        anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 160 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); onDelete(conversation); }}
          sx={{ fontSize: "13px", gap: 1.5, py: 1, color: "#FF3B30" }}>
          <Trash2 size={14} /> Delete Permanently
        </MenuItem>
      </Menu>
    </Box>
  );
};

const ConversationList = ({
  directMessages = [],
  projectChats   = [],
  activeId,
  onSelect,
  onNewConversation,
  search,
  onSearchChange,
  loading = false,
  currentUserId,
  currentUserRole,
  onlineUsers = new Set(),
  onConversationDeleted,
  onConversationRestored,
}) => {
  const { user }        = useUserStore();
  const canSeeArchive   = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
  const confirmRef      = useRef();

  const [archiveOpen,    setArchiveOpen]    = useState(false);
  const [archived,       setArchived]       = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const fetchArchived = useCallback(async () => {
    if (!canSeeArchive) return;
    setArchiveLoading(true);
    try {
      const res = await getArchivedConversationsApi();
      if (res?.status === 200 || res?.status === 201) {
        setArchived(res.data.data.conversations || []);
      }
    } catch { /* silent */ }
    finally { setArchiveLoading(false); }
  }, [canSeeArchive]);

  useEffect(() => {
    if (archiveOpen) fetchArchived();
  }, [archiveOpen, fetchArchived]);

  const handleRestore = async (convId) => {
    try {
      const res = await restoreConversationApi(convId);
      if (res?.status === 200 || res?.status === 201) {
        setArchived((prev) => prev.filter((c) => c._id !== convId));
        onConversationRestored?.();
      }
    } catch { /* silent */ }
  };

  const handlePermanentDelete = (conv) => {
    confirmRef.current?.open({
      title:       "Permanently Delete Group?",
      description: `"${conv.name || "Group Chat"}" and all its messages will be permanently deleted. This cannot be undone.`,
      confirmText: "Yes, Delete Permanently",
      cancelText:  "Cancel",
      onConfirm: async () => {
        try {
          const res = await deleteConversationApi(conv._id);
          if (res?.status === 200 || res?.status === 201) {
            setArchived((prev) => prev.filter((c) => c._id !== conv._id));
          }
        } catch { /* silent */ }
      },
    });
  };

  // After archiving a group from sidebar, refresh archived list
  const handleGroupDeleted = (convId) => {
    onConversationDeleted(convId);
    // Refresh archive after a short delay so backend has processed it
    setTimeout(() => {
      if (canSeeArchive) {
        if (!archiveOpen) setArchiveOpen(true);
        else fetchArchived();
      }
    }, 500);
  };

  return (
    <Box sx={{ width: 380, flexShrink: 0, backgroundColor: "#fff", borderRadius: "20px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #F0F0F0" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2.5, pb: 1.5 }}>
        <Typography fontSize="18px" fontWeight={600} color="text.primary">Messages</Typography>
        <IconButton onClick={onNewConversation}
          sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #AA2493, #022179)", borderRadius: "10px",
            "&:hover": { background: "linear-gradient(135deg, #022179, #AA2493)", transform: "scale(1.05)" }, transition: "all 0.2s ease" }}>
          <Plus size={18} color="#fff" />
        </IconButton>
      </Box>

      {/* Search */}
      <Box px={2} pb={1}>
        <TextInput placeholder="Search conversations..." fullWidth inputBgColor="#F5F5F5"
          InputStartIcon={<Search size={15} color="#808080" />}
          value={search} onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>

      {/* Lists */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 2,
        "&::-webkit-scrollbar": { width: "3px" },
        "&::-webkit-scrollbar-thumb": { background: "linear-gradient(#AA2493, #022179)", borderRadius: "4px" } }}>
        {loading ? (
          [...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)
        ) : (
          <>
            <SectionLabel label="Direct Messages" />
            {directMessages.length === 0
              ? <EmptySection label="Direct Messages" />
              : directMessages.map((conv) => (
                  <ConversationItem
                    key={conv._id} conversation={conv}
                    isActive={activeId === conv._id}
                    onClick={() => onSelect(conv)}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onlineUsers={onlineUsers}
                    onDeleted={onConversationDeleted}
                  />
                ))
            }

            <SectionLabel label="Project Chats" />
            {projectChats.length === 0
              ? <EmptySection label="Project Chats" />
              : projectChats.map((conv) => (
                  <ConversationItem
                    key={conv._id} conversation={conv}
                    isActive={activeId === conv._id}
                    onClick={() => onSelect(conv)}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onlineUsers={onlineUsers}
                    onDeleted={handleGroupDeleted}
                  />
                ))
            }

            {/* Archived Groups — Admin + PM only */}
            {canSeeArchive && (
              <Box mt={1}>
                <Box onClick={() => setArchiveOpen((v) => !v)}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, pt: 1.5, pb: 0.75, cursor: "pointer",
                    "&:hover": { "& .archive-label": { color: "#AA2493" } } }}>
                  {archiveOpen ? <ChevronDown size={13} color="#9CA3AF" /> : <ChevronRight size={13} color="#9CA3AF" />}
                  <Typography className="archive-label" fontSize="11px" fontWeight={700} color="text.secondary"
                    sx={{ letterSpacing: "0.8px", textTransform: "uppercase", transition: "color 0.15s" }}>
                    Archived Groups{archived.length > 0 ? ` (${archived.length})` : ""}
                  </Typography>
                </Box>

                <Collapse in={archiveOpen}>
                  <Box px={1}>
                    {archiveLoading ? (
                      <ConversationSkeleton />
                    ) : archived.length === 0 ? (
                      <Box px={1} py={1.5}>
                        <Typography fontSize="12px" color="text.secondary" fontStyle="italic">No archived groups</Typography>
                      </Box>
                    ) : (
                      archived.map((conv) => (
                        <ArchivedItem key={conv._id} conversation={conv}
                          onRestore={handleRestore} onDelete={handlePermanentDelete} />
                      ))
                    )}
                  </Box>
                </Collapse>
              </Box>
            )}
          </>
        )}
      </Box>

      <ConfirmationDialog ref={confirmRef} />
    </Box>
  );
};

export default ConversationList;