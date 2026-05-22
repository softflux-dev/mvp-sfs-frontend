const MyDocuments = () => {
  const { user } = useUserStore();

  const {
    documents, loading, actionLoading,
    error, downloadDocument, fetchDocuments,
  } = useSharedDocument();

  const [apiError, setApiError] = useState("");

  useEffect(() => {
  fetchDocuments();
}, []);

  const tableData = documents.map((doc) => ({
    id:         doc._id,
    fileName:   doc.title,
    type:       doc.documentType,
    uploadedBy: doc.uploadedBy?.fullName || "—",
    date:       doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : "—",
    fileSize: doc.fileSize || "—",
  }));

  const menuOptions = [{ value: "download", label: "Download" }];

  const handleMenuAction = (action, row) => {
    if (action === "download") downloadDocument(row.id);
  };

  return (
    <>
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <HeaderText
            title="My Documents"
            subtitle="Documents assigned to you"
          />
        </Grid>
      </Grid>

      {(error || apiError) && (
        <Box mb={2} px={2} py={1.5}
          sx={{ backgroundColor: "#FFF0F0", borderRadius: "10px", border: "1px solid #FFCCCC" }}
        >
          <Typography fontSize={13} color="error">{error || apiError}</Typography>
        </Box>
      )}

      <Filter
        mode="documents"
        onFilterChange={(f) => {
         fetchDocuments({ search: f.search || "", type: f.type || "" });
        }}
      />

      <Box mt={2} bgcolor="#fff" borderRadius="25px" p={1}>
        <PaginatedTable
          tableHeader={tableHeader}
          tableData={tableData}
          displayRows={displayRows}
          menuOptions={menuOptions}
          onMenuAction={handleMenuAction}
          isLoading={loading}
        />
      </Box>
    </>
  );
};

export default MyDocuments;