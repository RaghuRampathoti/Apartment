import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

// Fix Cloudinary URLs: PDFs uploaded as 'image' type need /raw/upload/ path to be viewable
const getReceiptUrl = (url) => {
  if (!url) return url;
  // Ensure HTTPS
  let fixed = url.replace(/^http:\/\//, "https://");
  // PDFs stored under /image/upload/ won't render - fix to /raw/upload/
  if (fixed.toLowerCase().endsWith(".pdf") && fixed.includes("/image/upload/")) {
    fixed = fixed.replace("/image/upload/", "/raw/upload/");
  }
  return fixed;
};

export default function ManageMaintenance({ flats, apartments, blocks, staff }) {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [mainTab, setMainTab] = useState("billing"); // "billing" or "requests"
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    flatId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadMaintenanceRecords();
    loadServiceRequests();
  }, []);

  const filteredMaintenance = maintenanceRecords.filter(m => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return m.paymentStatus === "PENDING";
    if (activeTab === "overdue") return m.paymentStatus === "OVERDUE";
    if (activeTab === "paid") return m.paymentStatus === "PAID";
    return true;
  });

  const loadMaintenanceRecords = async () => {
    try {
      const response = await axiosInstance.get("/admin/maintenance");
      let data = response.data;
      if (data?.data) data = data.data;
      if (data?.content) data = data.content;
      setMaintenanceRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading maintenance:", error);
      setMaintenanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const response = await axiosInstance.get("/admin/maintenance-requests");
      setServiceRequests(response.data.data || []);
    } catch (error) {
      console.error("Error loading service requests:", error);
    }
  };

  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceUpdateData, setServiceUpdateData] = useState({
    allocatedSlot: "",
    assignedStaffId: "",
    status: ""
  });

  const handleUpdateServiceRequest = async () => {
    try {
      setSubmitting(true);
      await axiosInstance.put(`/admin/maintenance-requests/${selectedServiceRequest.id}`, serviceUpdateData);
      toast.success("Service request updated successfully!");
      setShowServiceModal(false);
      loadServiceRequests();
    } catch (err) {
      toast.error("Failed to update service request");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteServiceRequest = async (id) => {
    const result = await Swal.fire({
      title: "Delete Service Request?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/admin/maintenance-requests/${id}`);
      toast.success("Service request deleted!");
      loadServiceRequests();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.flatId) newErrors.flatId = "Please select a flat";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Please enter a valid amount";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.year) newErrors.year = "Year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      flatId: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (maintenance) => {
    setIsEditing(true);
    setEditId(maintenance.id);

    // Attempt to match flatId for the <select> element or fallback if not available
    const matchedFlatId = maintenance.flatId || flats.find(f => f.flatNumber === maintenance.flatNumber)?.id || "";

    setFormData({
      flatId: matchedFlatId,
      amount: maintenance.amount || "",
      month: maintenance.month || new Date().getMonth() + 1,
      year: maintenance.year || new Date().getFullYear()
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { ...formData, flatId: Number(formData.flatId) };

      if (isEditing) {
        await axiosInstance.put(`/admin/maintenance/${editId}`, payload);
        toast.success("Maintenance updated successfully!");
      } else {
        await axiosInstance.post("/admin/maintenance", payload);
        toast.success("Maintenance bill created successfully!");
      }

      resetForm();
      setShowForm(false);
      loadMaintenanceRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save maintenance request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedMaintenance) return;

    try {
      setSubmitting(true);
      let receiptUrl = "";

      if (receiptFile) {
        setUploadingReceipt(true);
        const formData = new FormData();
        formData.append("file", receiptFile);

        const uploadRes = await axiosInstance.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        receiptUrl = uploadRes.data;
        setUploadingReceipt(false);
      }

      await axiosInstance.put(`/admin/maintenance/${selectedMaintenance.id}/mark-paid?paymentMethod=${paymentMethod}${receiptUrl ? `&receiptUrl=${encodeURIComponent(receiptUrl)}` : ''}`);
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setReceiptFile(null);
      loadMaintenanceRecords();
    } catch (error) {
      toast.error("Failed to update status");
      setUploadingReceipt(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Removed custom showToast helper — using react-toastify instead

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/maintenance/${id}`);
      toast.success("Maintenance bill deleted!");
      loadMaintenanceRecords();
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error("Failed to delete maintenance request");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleSendReminders = async () => {
    const result = await Swal.fire({
      title: "Send Payment Reminders?",
      text: "This will notify all pending/overdue residents.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f39c12",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, send reminders!"
    });
    if (!result.isConfirmed) return;
    setSendingReminders(true);
    try {
      const res = await axiosInstance.post("/admin/maintenance/send-reminders");
      toast.success(res.data?.message || "Reminders sent successfully!");
    } catch (error) {
      toast.error("Failed to send reminders");
    } finally {
      setSendingReminders(false);
    }
  };

  const handleSendSingleReminder = async (m) => {
    setSendingReminderId(m.id);
    try {
      const res = await axiosInstance.post(`/admin/maintenance/${m.id}/send-reminder`);
      toast.success(res.data?.message || `Reminder sent to Flat ${m.flatNumber}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reminder");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleViewSummary = async () => {
    try {
      const res = await axiosInstance.get("/admin/maintenance/summary");
      setSummary(res.data?.data);
      setShowSummary(true);
    } catch (error) {
      toast.error("Failed to fetch summary");
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const res = await axiosInstance.get("/admin/maintenance/report/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "payment_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download report");
    } finally {
      setDownloadingReport(false);
    }
  }; const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: 'bg-amber-100 text-amber-600 border-amber-200',
      PAID: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      OVERDUE: 'bg-rose-100 text-rose-600 border-rose-200',
      CANCELLED: 'bg-slate-100 text-slate-400 border-slate-200',
      ACCEPTED: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      COMPLETED: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border  ${statusMap[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 ">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4 "></div>
        <p className="text-slate-400 font-bold ">Loading payment records...</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up space-y-8 ">
      {/* Category Toggle Strip */}
      <div className="flex p-1.5 bg-white rounded-2xl w-fit shadow-sm border border-slate-100 ">
        <button className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mainTab === 'billing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ' : 'text-slate-500 hover:text-slate-700 '}`} onClick={() => setMainTab("billing")}>💸 Billing Cycle</button>
        <button className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mainTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ' : 'text-slate-500 hover:text-slate-700 '}`} onClick={() => setMainTab("requests")}>🔧 Service Requests</button>
      </div>

      {mainTab === "billing" ? (
        <>
          {/* Billing Header Controls */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 ">
            <div className="flex flex-wrap items-center gap-3 ">
              <button className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all " onClick={handleSendReminders} disabled={sendingReminders}>
                {sendingReminders ? 'Sending...' : '🔔 Reminders'}
              </button>
              <button className="px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all " onClick={handleViewSummary}>
                📊 Summary
              </button>
              <button className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all " onClick={handleDownloadReport} disabled={downloadingReport}>
                {downloadingReport ? 'Generating...' : '⬇️ Reports'}
              </button>
            </div>
            <button className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 " onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}>
              {showForm ? '✕ Close Form' : '+ New Billing Entry'}
            </button>
          </div>

          {/* New Billing Form */}
          {showForm && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-500 ">
              <div className="h-2 bg-emerald-500 "></div>
              <div className="p-10 ">
                <div className="flex items-center gap-4 mb-10 ">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner ">💰</div>
                  <div className="">
                    <h4 className="text-xl font-black text-slate-800 ">{isEditing ? 'Adjust Billing Entry' : 'Issue New Invoice'}</h4>
                    <p className="text-sm text-slate-500 font-medium ">Manually record or allocate maintenance dues for a resident flat.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ">
                  <div className="space-y-2 ">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Target Asset <span className="text-rose-500 ">*</span></label>
                    <select
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.flatId ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700 `}
                      value={formData.flatId}
                      onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                      disabled={isEditing}
                    >
                      <option value="">Select Flat</option>
                      {flats && flats.filter(f => f.status === 'ALLOCATED').map(flat => (
                        <option key={flat.id} value={flat.id}>Flat {flat.flatNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 ">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Invoice Amount <span className="text-rose-500 ">*</span></label>
                    <div className="relative ">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 ">₹</span>
                      <input
                        type="number"
                        className={`w-full pl-10 pr-5 py-4 rounded-2xl border ${errors.amount ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700`}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 ">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Fiscal Month <span className="text-rose-500 ">*</span></label>
                    <select
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700 "
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    >
                      {[...Array(12).keys()].map(i => (
                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 ">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Fiscal Year <span className="text-rose-500 ">*</span></label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="md:col-span-2 xl:col-span-4 flex justify-end gap-4 border-t border-slate-50 pt-8 ">
                    <button type="button" className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all " onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
                    <button type="submit" className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 " disabled={submitting}>
                      {submitting ? 'Processing...' : (isEditing ? 'Adjust Entry' : 'Create Invoice')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ledger Table Section */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden ">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 ">
              <h3 className="text-lg font-black text-slate-800 ">Payment Records</h3>
              <div className="flex p-1 bg-slate-100 rounded-xl ">
                {['all', 'pending', 'overdue', 'paid'].map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm ' : 'text-slate-500 '}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full text-left border-collapse ">
                <thead className="bg-slate-50 ">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Asset / Reference</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Net Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Total Due</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Period</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-right bg-indigo-50/30">Orchestration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 ">
                  {filteredMaintenance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-20 text-center ">
                        <div className="text-3xl mb-4 ">🔎</div>
                        <p className="text-slate-400 font-bold ">No payment records found for this period.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenance.map((maintenance) => (
                      <tr key={maintenance.id} className="hover:bg-slate-50/50 transition-colors group ">
                        <td className="px-8 py-6 ">
                          <p className="font-black text-slate-800 text-sm ">Flat {maintenance.flatNumber || maintenance.flatId}</p>
                          <p className="text-[10px] font-medium text-slate-400 ">#{maintenance.id}</p>
                        </td>
                        <td className="px-8 py-6  font-bold text-slate-600 text-xs ">₹{maintenance.amount}</td>
                        <td className="px-8 py-6  ">
                          <p className="font-black text-slate-800 text-sm ">₹{maintenance.totalAmount || maintenance.amount}</p>
                          {maintenance.interest > 0 && <p className="text-[10px] font-black text-rose-500 ">+₹{maintenance.interest} Interest</p>}
                        </td>
                        <td className="px-8 py-6 ">
                          <span className="text-[10px] font-black text-slate-500 uppercase ">{new Date(0, maintenance.month - 1).toLocaleString('default', { month: 'short' })} '{maintenance.year.toString().slice(-2)}</span>
                        </td>
                        <td className="px-8 py-6 ">{getStatusBadge(maintenance.paymentStatus)}</td>
                        <td className="px-8 py-6 ">
                          <span className="text-[10px] font-bold text-slate-400 ">{maintenance.paymentMethod || "—"}</span>
                        </td>
                        <td className="px-8 py-6 text-right ">
                          <div className="flex justify-end gap-2 ">
                            {(maintenance.paymentStatus === "PENDING" || maintenance.paymentStatus === "OVERDUE") && (
                              <>
                                <button className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all " onClick={() => handleEdit(maintenance)}>✏️</button>
                                <button className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all " onClick={() => { setSelectedMaintenance(maintenance); setShowPaymentModal(true); }}>Settle</button>
                                <button className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all " onClick={() => handleSendSingleReminder(maintenance)} disabled={sendingReminderId === maintenance.id}>
                                  {sendingReminderId === maintenance.id ? '...' : '🔔'}
                                </button>
                              </>
                            )}
                            {maintenance.paymentStatus === "PAID" && maintenance.receiptUrl && (
                              <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all " onClick={() => window.open(getReceiptUrl(maintenance.receiptUrl), "_blank")}>Receipt</button>
                            )}
                            <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all " onClick={() => handleDelete(maintenance.id)}>✕</button>
                          </div>
                          {deleteConfirmId === maintenance.id && (
                            <div className="mt-2 flex justify-end gap-2 ">
                              <button className="px-3 py-1 bg-rose-600 text-white rounded-md text-[9px] font-black uppercase " onClick={() => confirmDelete(maintenance.id)}>Confirm</button>
                              <button className="text-[9px] font-black text-slate-400 " onClick={cancelDelete}>Abort</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Recognition Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 ">
                <div className="p-10 ">
                  <div className="flex justify-between items-center mb-8 ">
                    <h3 className="text-xl font-black text-slate-800 ">Record Settlement</h3>
                    <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 ">✕</button>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 ">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ">Asset Identified</p>
                    <p className="text-lg font-black text-slate-800  uppercase">Flat {selectedMaintenance?.flatNumber}</p>
                    <p className="text-[10px] font-bold text-indigo-500 mt-3 ">DUE AMOUNT: ₹{selectedMaintenance?.totalAmount || selectedMaintenance?.amount}</p>
                  </div>

                  <div className="space-y-6 ">
                    <div className="space-y-2 ">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Settlement Channel</label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-slate-700 text-xs " value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="CASH">Physical Cash</option>
                        <option value="UPI">Digital Wallet (UPI)</option>
                        <option value="NET_BANKING">Bank Transfer</option>
                        <option value="CREDIT_CARD">Credit Card Swipe</option>
                      </select>
                    </div>

                    <div className="space-y-2 ">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Document Capture (Optional)</label>
                      <input type="file" className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files[0])} />
                    </div>
                  </div>

                  <button className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 " onClick={handleStatusUpdate} disabled={submitting || uploadingReceipt}>
                    {uploadingReceipt ? 'Uploading...' : submitting ? 'Recording...' : 'Finalize Settlement'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ledger Summary Visualizer */}
          {showSummary && summary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden  animate-in zoom-in-95">
                <div className="h-2 bg-indigo-600 "></div>
                <div className="p-10 ">
                  <div className="flex justify-between items-center mb-10 ">
                    <h3 className="text-2xl font-black text-slate-800 ">Fiscal Synopsis</h3>
                    <button onClick={() => setShowSummary(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8 ">
                    {[
                      { label: 'Total Issued', value: summary.totalBills, color: 'slate' },
                      { label: 'Resolved', value: summary.paid, color: 'emerald' },
                      { label: 'Awaiting', value: summary.pending, color: 'amber' },
                      { label: 'Defaulted', value: summary.overdue, color: 'rose' },
                    ].map(item => (
                      <div key={item.label} className={`p-6 rounded-[2rem] bg-${item.color}-50/50 border border-${item.color}-100 `}>
                        <p className={`text-[10px] font-black text-${item.color}-600 uppercase tracking-widest mb-1 `}>{item.label}</p>
                        <p className="text-3xl font-black text-slate-800 ">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4 ">
                    <div className="flex justify-between items-end ">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Capital Collected</p>
                      <p className="text-2xl font-black text-emerald-400 ">₹{Number(summary.totalCollected).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-end ">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Outstanding Principal</p>
                      <p className="text-xl font-black text-amber-400 ">₹{Number(summary.totalOutstanding).toLocaleString()}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-end ">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Total Interest Accrued</p>
                      <p className="text-lg font-black text-rose-400 ">₹{Number(summary.totalInterest).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4 ">
                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200" onClick={handleDownloadReport} disabled={downloadingReport}>CSV Export</button>
                    <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20" onClick={() => setShowSummary(false)}>Close View</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Service Requests View */
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden ">
          <div className="p-8 border-b border-slate-50 ">
            <h3 className="text-lg font-black text-slate-800 ">Operations Queue</h3>
          </div>

          <div className="overflow-x-auto ">
            <table className="w-full text-left border-collapse ">
              <thead className="bg-slate-50 ">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Source asset</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Classification</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Costing</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Temporal slot</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Assigned unit</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right ">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 ">
                {serviceRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center ">
                      <div className="text-3xl mb-4 ">🔧</div>
                      <p className="text-slate-400 font-bold ">Operational queue is currently empty.</p>
                    </td>
                  </tr>
                ) : (
                  serviceRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group ">
                      <td className="px-8 py-6 ">
                        <p className="font-black text-slate-800 text-sm ">Flat {req.flatNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 ">{req.residentName}</p>
                      </td>
                      <td className="px-8 py-6 ">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest ">{req.serviceType}</span>
                      </td>
                      <td className="px-8 py-6  font-bold text-slate-600 text-xs ">₹{req.basicCharges}</td>
                      <td className="px-8 py-6 ">
                        <p className="font-black text-slate-700 text-[10px] ">{req.allocatedSlot || req.preferredSlot || "PENDING"}</p>
                      </td>
                      <td className="px-8 py-6 ">
                        <p className="font-black text-slate-500 text-[10px]  uppercase">{req.assignedStaffName || "UNASSIGNED"}</p>
                      </td>
                      <td className="px-8 py-6 ">{getStatusBadge(req.status)}</td>
                      <td className="px-8 py-6 text-right ">
                        <div className="flex justify-end gap-2 ">
                          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all " onClick={() => {
                            setSelectedServiceRequest(req);
                            setServiceUpdateData({
                              allocatedSlot: req.allocatedSlot || "",
                              assignedStaffId: "",
                              status: req.status
                            });
                            setShowServiceModal(true);
                          }}>Control</button>
                          <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all " onClick={() => deleteServiceRequest(req.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operations Management Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 ">
            <div className="p-10 ">
              <div className="flex justify-between items-center mb-8 ">
                <h3 className="text-xl font-black text-slate-800 ">Operational Control</h3>
                <button onClick={() => setShowServiceModal(false)} className="text-slate-400 ">✕</button>
              </div>

              <div className="space-y-6 ">
                <div className="space-y-2 ">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Temporal Allocation</label>
                  <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 " placeholder="e.g. 26th March, 2 PM" value={serviceUpdateData.allocatedSlot} onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, allocatedSlot: e.target.value })} />
                </div>

                <div className="space-y-2 ">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Assigned Personnel</label>
                  <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-slate-700 text-xs " value={serviceUpdateData.assignedStaffId} onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, assignedStaffId: e.target.value })}>
                    <option value="">Select Staff</option>
                    {staff && staff.map(s => <option key={s.id} value={s.id}>{s.username} ({s.designation})</option>)}
                  </select>
                </div>

                <div className="space-y-2 ">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Execution State</label>
                  <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-slate-700 text-xs " value={serviceUpdateData.status} onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, status: e.target.value })}>
                    <option value="PENDING">Pending Approval</option>
                    <option value="ACCEPTED">Dispatched / Accepted</option>
                    <option value="COMPLETED">Execution Finished</option>
                    <option value="CANCELLED">Voided / Cancelled</option>
                  </select>
                </div>
              </div>

              <button className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 " onClick={handleUpdateServiceRequest} disabled={submitting}>
                {submitting ? 'Updating Dispatch...' : 'Commit Operational Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
