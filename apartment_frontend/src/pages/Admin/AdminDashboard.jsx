import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  IoPersonOutline as UserIcon,
  IoGridOutline as GridIcon,
  IoNotificationsOutline as BellIcon,
  IoPeopleOutline as UsersIcon,
  IoConstructOutline as WrenchIcon,
  IoBusinessOutline as BuildingIcon,
  IoDocumentTextOutline as FileTextIcon,
  IoEyeOutline as EyeIcon,
  IoHardwareChipOutline as CpuIcon,
  IoHomeOutline as HomeIcon,
  IoBasketballOutline as ClubIcon,
  IoCheckmarkDoneOutline as VoteIcon,
  IoCloseOutline as XIcon,
  IoShieldOutline as ShieldIcon,
  IoCashOutline as RupeeIcon,
  IoAddOutline as PlusIcon,
  IoTimeOutline as ClockIcon,
  IoLogOutOutline as DoorIcon,
  IoCheckmarkCircleOutline as CheckCircleIcon,
  IoCarOutline,
  IoFlashOutline, IoPulseOutline, IoHomeOutline as IoHomeIo, IoNotificationsOutline, IoAlertCircleOutline, IoCalendarOutline, IoShieldCheckmarkOutline, IoPaperPlaneOutline, IoMailUnreadOutline,
  IoStarOutline as CrownIcon,
  IoLockClosedOutline as LockIcon
} from "react-icons/io5";
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";

import ManageUsers from "../../components/Admin/ManageUsers";
import ManageApartments from "../../components/Admin/ManageApartments";
import ManageMaintenance from "../../components/Admin/ManageMaintenance";
import ManageComplaints from "../../components/Admin/ManageComplaints";
import ManagePolls from "../../components/Admin/Polls";
import ManageFacilities from "../../components/Admin/ManageFacilities";
import ManageClubhouse from "../../components/Admin/ManageClubhouse";
import ManageVisitors from "../../components/Admin/ManageVisitors";
import ManageMoveInOut from "../../components/Admin/ManageMoveInOut";
import ManageParking from "../../components/Admin/ManageParking";
import ManageFeedback from "../../components/Admin/ManageFeedback";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Subscription Plan definitions (mirrored from backend) ──────────────────────
const PLANS = [
  {
    key: "STARTER",
    label: "Starter",
    price: 999,
    color: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Essential modules to get started",
    features: ["Resident Management", "Notice Board", "Complaint Tracking", "Visitor Logs", "Staff Management"]
  },
  {
    key: "PROFESSIONAL",
    label: "Professional",
    price: 1999,
    color: "from-indigo-500 to-blue-600",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "Core + extra management features",
    features: ["All Starter Features", "Maintenance Billing", "Parking Management", "Clubhouse Booking", "Polls & Surveys", "Facilities Management"]
  },
  {
    key: "ENTERPRISE",
    label: "Enterprise",
    price: 2999,
    color: "from-violet-600 to-purple-700",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    description: "All features unlocked — full platform",
    features: ["All Professional Features", "Move In/Out Records", "Feedback & Support", "Advanced Analytics", "Priority Support"]
  }
];

// Which sidebar module IDs are accessible per plan
const PLAN_ACCESS = {
  STARTER: ["dashboard", "profile", "notices", "staff", "manageUsers", "manageComplaints", "manageVisitors", "manageApartments", "subscription"],
  PROFESSIONAL: ["dashboard", "profile", "notices", "staff", "manageUsers", "manageComplaints", "manageVisitors", "manageApartments", "manageMaintenance", "manageParking", "manageClubhouse", "managePolls", "manageFacilities", "subscription"],
  ENTERPRISE: ["dashboard", "profile", "notices", "staff", "manageUsers", "manageComplaints", "manageVisitors", "manageApartments", "manageMaintenance", "manageParking", "manageClubhouse", "managePolls", "manageFacilities", "moveInOut", "manageFeedback", "subscription"]
};

const getPlanAccess = (planKey) => PLAN_ACCESS[planKey] || PLAN_ACCESS["STARTER"];

// Fix Cloudinary URLs: PDFs uploaded as'image' type need /raw/upload/ path to be viewable
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

// ── Icons replaced with react-icons ─────────────────────────────────────────────



export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Queries
  const { data: adminProfile = { username: "", email: "", phone: "", role: "" }, isPending: isProfilePending } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/profile");
      return response.data.data;
    }
  });

  // Active subscription for this admin's apartment
  const { data: activeSub = null, refetch: refetchSub } = useQuery({
    queryKey: ["activeSub", adminProfile?.managedApartmentId],
    queryFn: async () => {
      if (!adminProfile?.managedApartmentId) return null;
      const res = await axiosInstance.get(`/subscriptions/apartment/${adminProfile.managedApartmentId}/active`);
      return res.data.data || null;
    },
    enabled: !!adminProfile?.managedApartmentId
  });

  const currentPlanKey = activeSub?.plan || null;
  const allowedViews = currentPlanKey ? getPlanAccess(currentPlanKey) : getPlanAccess("STARTER");

  const { data: flats = [] } = useQuery({
    queryKey: ["flats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/flats");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const res = await axiosInstance.get("/blocks");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/apartments");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    },
    enabled: adminProfile.role === "ROLE_SUPER_ADMIN"
  });

  const { data: notices = [] } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/notices");
      const data = response.data.data || response.data || [];
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: staffData = { active: [], deactivated: [] } } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const [activeRes, deactiveRes] = await Promise.all([
        axiosInstance.get("/admin/staff"),
        axiosInstance.get("/admin/staff/deactivated")
      ]);
      return {
        active: Array.isArray(activeRes.data.data || activeRes.data) ? (activeRes.data.data || activeRes.data) : [],
        deactivated: Array.isArray(deactiveRes.data.data || deactiveRes.data) ? (deactiveRes.data.data || deactiveRes.data) : []
      };
    }
  });

  const staff = staffData.active;
  const deactivatedStaff = staffData.deactivated;

  const { data: visitors = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/visitors");
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/vehicles");
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    username: adminProfile.username || "",
    email: adminProfile.email || "",
    phone: adminProfile.contactNumber || adminProfile.phone || ""
  });

  // Sync profile form data when adminProfile is loaded
  useEffect(() => {
    if (adminProfile.username) {
      setProfileFormData({
        username: adminProfile.username,
        email: adminProfile.email,
        phone: adminProfile.contactNumber || adminProfile.phone || ""
      });
    }
  }, [adminProfile]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);


  const [staffTab, setStaffTab] = useState("active");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({ title: "", description: "", month: "", year: new Date().getFullYear(), type: "NOTICE", eventDate: "", eventLocation: "", rsvpEnabled: false });
  const [staffFormData, setStaffFormData] = useState({ username: "", email: "", phone: "", designation: "SECURITY_GUARD", role: "SECURITY", password: "" });
  const [staffSearch, setStaffSearch] = useState("");
  const [staffSort, setStaffSort] = useState("username");
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [noticeFile, setNoticeFile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [uploadingNoticeFile, setUploadingNoticeFile] = useState(false);

  const [viewImage, setViewImage] = useState(null);

  const [noticeResponses, setNoticeResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  // Form validation errors
  const [noticeErrors, setNoticeErrors] = useState({});
  const [staffErrors, setStaffErrors] = useState({});

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Quick Actions toggle
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Form validation functions
  const validateNoticeForm = () => {
    const errors = {};
    if (!noticeFormData.title.trim()) {
      errors.title = "Notice title is required";
    }
    if (!noticeFormData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!noticeFormData.month) {
      errors.month = "Month is required";
    }
    setNoticeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStaffForm = () => {
    const errors = {};
    if (!staffFormData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!staffFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffFormData.email)) {
      errors.email = "Invalid email format";
    }
    if (!isEditingStaff) {
      if (!staffFormData.password) {
        errors.password = "Password is required";
      } else if (staffFormData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }
    setStaffErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadNoticeResponses = async (noticeId) => {
    if (expandedNoticeId === noticeId) {
      setExpandedNoticeId(null);
      return;
    }

    setExpandedNoticeId(noticeId);
    if (!noticeResponses[noticeId]) {
      setLoadingResponses(true);
      try {
        const res = await axiosInstance.get(`/admin/notices/${noticeId}/responses`);
        const data = res.data.data || res.data || [];
        setNoticeResponses(prev => ({ ...prev, [noticeId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error("Failed to fetch notice responses", err);
      } finally {
        setLoadingResponses(false);
      }
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfilePicture(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axiosInstance.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = uploadRes.data;

      // Update profile with new image URL
      await axiosInstance.put("/admin/update-profile", {
        ...profileFormData,
        profilePictureUrl: imageUrl
      });

      addToast("success", "Success", "Profile picture updated!");
      queryClient.invalidateQueries(["adminProfile"]);
    } catch (err) {
      addToast("error", "Error", "Failed to upload profile picture");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNoticeModal && noticeModalRef.current && !noticeModalRef.current.contains(event.target)) {
        setShowNoticeModal(false);
        setNoticeErrors({});
      }
      if (showStaffModal && staffModalRef.current && !staffModalRef.current.contains(event.target)) {
        setShowStaffModal(false);
        setStaffErrors({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNoticeModal, showStaffModal]);

  // Modal refs for click outside detection
  const noticeModalRef = useRef(null);
  const staffModalRef = useRef(null);

  // Mutations
  const profileMutation = useMutation({
    mutationFn: (payload) => axiosInstance.put("/admin/update-profile", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProfile"]);
      setIsEditingProfile(false);
      addToast("success", "Success", "Profile updated successfully!");
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to update profile");
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (payload) => axiosInstance.put("/admin/change-password", payload),
    onSuccess: () => {
      addToast("success", "Success", "Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to change password");
    }
  });

  const noticeMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/admin/notices", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["notices"]);
      addToast("success", "Success", "Notice published successfully!");
      setShowNoticeModal(false);
      setNoticeFormData({
        title: "",
        description: "",
        month: "",
        year: new Date().getFullYear(),
        type: "NOTICE",
        eventDate: "",
        eventLocation: "",
        rsvpEnabled: false
      });
      setNoticeFile(null);
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to publish notice");
    }
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/admin/notices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notices"]);
      addToast("success", "Success", "Notice deleted successfully!");
    },
    onError: () => addToast("error", "Error", "Failed to delete notice")
  });

  const staffMutation = useMutation({
    mutationFn: (payload) => {
      if (isEditingStaff) {
        return axiosInstance.put(`/admin/staff/${editStaffId}`, payload);
      }
      return axiosInstance.post("/admin/staff", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      addToast("success", "Success", "Staff record updated!");
      closeStaffModal();
    },
    onError: (error) => addToast("error", "Error", error.response?.data?.message || "Operation failed")
  });

  const staffStatusMutation = useMutation({
    mutationFn: ({ id, action }) => axiosInstance.put(`/admin/staff/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      addToast("success", "Success", "Staff status updated!");
    },
    onError: () => addToast("error", "Error", "Failed to update staff status")
  });

  const addToast = (type, title, message) => {
    // using console instead of toast to avoid extra imports
    console.log(`[${type}] ${title}: ${message}`);
  };



  const handleProfileUpdate = () => {
    profileMutation.mutate({
      username: profileFormData.username,
      email: profileFormData.email,
      contactNumber: profileFormData.phone
    });
  };

  const handlePasswordChange = () => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      addToast("error", "Error", "Please fill all password fields");
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      addToast("error", "Error", "New passwords do not match");
      return;
    }
    passwordMutation.mutate(passwordFormData);
  };

  const handleNoticeSubmit = async () => {
    if (!validateNoticeForm()) return;

    let attachmentUrl = "";
    if (noticeFile) {
      setUploadingNoticeFile(true);
      const fileData = new FormData();
      fileData.append("file", noticeFile);
      try {
        const uploadRes = await axiosInstance.post("/files/upload", fileData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        attachmentUrl = uploadRes.data;
      } catch (uploadErr) {
        addToast("error", "Error", "File upload failed.");
      } finally {
        setUploadingNoticeFile(false);
      }
    }

    const payload = { ...noticeFormData, attachmentUrl };
    noticeMutation.mutate(payload);
  };

  const handleNoticeDelete = (id) => deleteNoticeMutation.mutate(id);

  const handleStaffSubmit = () => {
    if (!validateStaffForm()) return;
    staffMutation.mutate({
      username: staffFormData.username,
      email: staffFormData.email,
      contactNumber: staffFormData.phone,
      designation: staffFormData.designation,
      role: staffFormData.role,
      password: staffFormData.password
    });
  };

  const handleStaffDeactivate = (id) => staffStatusMutation.mutate({ id, action: "deactivate" });
  const handleStaffReactivate = (id) => staffStatusMutation.mutate({ id, action: "reactivate" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const closeNoticeModal = () => {
    setShowNoticeModal(false);
    setNoticeErrors({});
    setNoticeFormData({ title: "", description: "", month: "", year: new Date().getFullYear() });
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setIsEditingStaff(false);
    setEditStaffId(null);
    setStaffErrors({});
    setStaffFormData({ username: "", email: "", phone: "", designation: "SECURITY_GUARD", role: "SECURITY", password: "" });
    setShowPassword(false);
  };

  const handleEditStaff = (member) => {
    setStaffFormData({
      username: member.username || "",
      email: member.email || "",
      phone: member.contactNumber || "",
      designation: member.designation || "HOUSE KEEPING",
      role: member.role || "SECURITY",
      password: ""
    });
    setEditStaffId(member.id);
    setIsEditingStaff(true);
    setShowStaffModal(true);
  };

  const sidebarItems = [
    // — Overview
    { id: "dashboard", label: "Dashboard", icon: <GridIcon /> },
    { id: "notices", label: "Notices", icon: <BellIcon /> },
    // — Residents & Users
    { id: "manageUsers", label: "Manage Residents", icon: <UserIcon /> },
    { id: "manageApartments", label: "Apartments & Flats", icon: <BuildingIcon /> },
    { id: "moveInOut", label: "Move In / Move Out", icon: <DoorIcon /> },
    // — Finance
    { id: "manageMaintenance", label: "Maintenance Billing", icon: <RupeeIcon /> },
    // — Operations
    { id: "staff", label: "Staff Management", icon: <UsersIcon /> },
    { id: "manageVisitors", label: "Visitors & Vehicles", icon: <EyeIcon /> },
    { id: "manageParking", label: "Parking", icon: <ShieldIcon /> },
    { id: "manageComplaints", label: "Complaints", icon: <FileTextIcon /> },
    // — Community
    { id: "manageClubhouse", label: "Clubhouse", icon: <ClubIcon /> },
    { id: "manageFacilities", label: "Facilities", icon: <CpuIcon /> },
    { id: "managePolls", label: "Polls & Surveys", icon: <VoteIcon /> },
    { id: "manageFeedback", label: "Feedback & Support", icon: <FileTextIcon /> },
    // — Account
    { id: "subscription", label: "Subscription", icon: <CrownIcon /> },
  ];

  if (isProfilePending) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-indigo-600 rounded-full animate-spin shadow-inner"></div>
        <p className="mt-6 text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">Initializing Admin Session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary/10 selection:text-primary">
      {/* SIDEBAR */}
      <aside className={`bg-sidebar text-white flex flex-col shadow-2xl z-40 sticky top-0 hidden md:flex h-screen transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5 overflow-hidden h-[73px]">
          <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20 shrink-0">
            <BuildingIcon />
          </div>
          {isSidebarOpen && (
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap leading-tight">Secure Gate</span>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-white text-slate-800 p-1.5 rounded-full shadow-lg border border-slate-200 z-50 hover:bg-slate-50 transition-all hidden md:block group"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''} group-hover:scale-110`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* ── Unlocked modules ── */}
          {sidebarItems
            .filter(item => {
              if (item.id === "manageApartments" &&
                adminProfile.role !== "ROLE_SUPER_ADMIN" &&
                adminProfile.role !== "ROLE_ADMIN") return false;
              const locked = !allowedViews.includes(item.id) && item.id !== "subscription";
              return !locked;
            })
            .map(item => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative
                    ${activeView === item.id
                    ? "bg-primary text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"} ${!isSidebarOpen && 'justify-center'}`}
                onClick={() => setActiveView(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <span className={`${activeView === item.id ? "text-white" : "group-hover:text-white"} transition-colors`}>{item.icon}</span>
                {isSidebarOpen && <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>}
              </button>
            ))}

          {/* ── Locked modules section ── */}
          {sidebarItems.some(item => {
            if (item.id === "subscription") return false;
            const locked = !allowedViews.includes(item.id);
            return locked;
          }) && (
              <>
                <div className={`pt-3 pb-1 ${!isSidebarOpen && 'hidden'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap flex items-center gap-1">
                      <LockIcon style={{ width: 8, height: 8 }} /> Locked
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </div>
                {sidebarItems
                  .filter(item => {
                    if (item.id === "subscription") return false;
                    if (item.id === "manageApartments" &&
                      adminProfile.role !== "ROLE_SUPER_ADMIN" &&
                      adminProfile.role !== "ROLE_ADMIN") return false;
                    return !allowedViews.includes(item.id);
                  })
                  .map(item => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed opacity-40 text-slate-500 ${!isSidebarOpen && 'justify-center'}`}
                      onClick={() => setActiveView("subscription")}
                      title={`Upgrade plan to access ${item.label}`}
                    >
                      <span>{item.icon}</span>
                      {isSidebarOpen && <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>}
                      {isSidebarOpen && <LockIcon style={{ width: 11, height: 11 }} className="shrink-0" />}
                    </button>
                  ))}
              </>
            )}
        </nav>

        <div className="p-4 border-t border-white/5 bg-sidebar/50">
          <button className="w-full py-2.5 px-4 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2 justify-center border border-white/5 hover:border-red-500/30"
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar text-white px-6 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <BuildingIcon />
          </div>
          <span className="text-xl font-black  tracking-tight uppercase tracking-[0.05em]">Secure Gate</span>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <XIcon /> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isSidebarOpen && (
        <div className="md:hidden bg-sidebar/95 backdrop-blur-xl fixed inset-0 z-50 p-6 pt-24 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="space-y-3">
            {sidebarItems
              .filter(item => {
                if (item.id === "manageApartments" &&
                  adminProfile.role !== "ROLE_SUPER_ADMIN" &&
                  adminProfile.role !== "ROLE_ADMIN") return false;
                return true;
              })
              .map(item => {
                const locked = !allowedViews.includes(item.id) && item.id !== "subscription";
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-sm font-black uppercase tracking-widest 
                        ${activeView === item.id
                        ? "bg-primary text-white shadow-lg shadow-indigo-600/30"
                        : locked
                          ? "text-slate-500 bg-white/5 border border-white/5 opacity-50 cursor-not-allowed"
                          : "text-slate-400 bg-white/5 border border-white/5"}`}
                    onClick={() => { if (locked) return; setActiveView(item.id); setIsSidebarOpen(false); }}
                  >
                    <span className={activeView === item.id ? "text-white" : ""}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {locked && <LockIcon className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            <button className="w-full mt-10 py-4 px-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2" onClick={handleLogout}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto bg-slate-50">
        {/* TOP COMPACT HEADER */}
        <header className="bg-sidebar backdrop-blur-xl sticky top-0 z-30 border-b border-white/10 px-8 py-3 flex justify-between items-center shadow-sm h-[73px]">
          <h2 className="text-xl font-bold text-white capitalize tracking-tight">{activeView.replace(/([A-Z])/g, ' $1').trim()}</h2>

          <div
            className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-primary-light transition-all bg-white shadow-sm group"
            onClick={() => setActiveView("profile")}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary text-white flex items-center justify-center font-bold shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {adminProfile.profilePictureUrl ? (
                <img src={adminProfile.profilePictureUrl} alt="P" className="w-full h-full object-cover" />
              ) : (
                adminProfile.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">{adminProfile.username || "Admin"}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-tight">
                {adminProfile.role === "ROLE_SUPER_ADMIN" ? "Master Admin" : "Society Admin"}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 flex-1 max-w-7xl mx-auto w-full">

          {/* PROFILE SECTION */}
          {activeView === "profile" && (
            <div className="fade-in-up space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden border border-slate-100">
                  <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-12 flex flex-col md:flex-row items-center gap-8 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                        {adminProfile.profilePictureUrl ? (
                          <img src={adminProfile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-bold text-primary">{adminProfile.username?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <label className="absolute bottom-1 right-1 bg-white text-primary p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <input type="file" hidden accept="image/*" onChange={handleProfilePictureUpload} disabled={uploadingProfilePicture} />
                      </label>
                    </div>
                    <div className="flex-1 text-center md:text-left z-10">
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2">{adminProfile.username}</h2>
                      <p className="text-white/80 font-medium mb-4">{adminProfile.email}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{adminProfile.role.replace('ROLE_', '').replace('_', '')}</span>
                        <span className="bg-emerald-400/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button onClick={() => { setIsEditingProfile(!isEditingProfile); setIsChangingPassword(false); }} className="px-6 py-2.5 bg-white text-primary rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-slate-50 transition-all">
                        {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                      </button>
                      <button onClick={() => { setIsChangingPassword(!isChangingPassword); setIsEditingProfile(false); }} className="px-6 py-2.5 bg-primary/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                        {isChangingPassword ? "Cancel Change" : "Change Password"}
                      </button>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    {isChangingPassword && (
                      <div className="mb-10 p-8 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-500">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <ShieldIcon stroke={2} size={20} /> Update Security Password
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                            <input type="password" value={passwordFormData.currentPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Enter current password" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                            <input type="password" value={passwordFormData.newPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Min 6 characters" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                            <input type="password" value={passwordFormData.confirmPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Repeat new password" />
                          </div>
                        </div>
                        <button onClick={handlePasswordChange} className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-primary-hover transition-all">Update Password</button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="group">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Username</label>
                          {isEditingProfile ? (
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" value={profileFormData.username} onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })} />
                          ) : (
                            <p className="text-slate-800 font-bold text-lg">{adminProfile.username}</p>
                          )}
                        </div>
                        <div className="group">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Email Address</label>
                          {isEditingProfile ? (
                            <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" value={profileFormData.email} onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })} />
                          ) : (
                            <p className="text-slate-800 font-bold text-lg">{adminProfile.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="group">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Contact Number</label>
                          {isEditingProfile ? (
                            <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" value={profileFormData.phone} onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })} />
                          ) : (
                            <p className="text-slate-800 font-bold text-lg">{adminProfile.contactNumber || "Not set"}</p>
                          )}
                        </div>
                        <div className="group">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Apartment Name</label>
                          <p className="text-primary font-black text-lg">{adminProfile.managedApartmentName || "Not Assigned"}</p>
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                        <button onClick={handleProfileUpdate} className="px-10 py-3.5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">Save Changes</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD SECTION */}
          {activeView === "dashboard" && (
            <div className="fade-in-up p-8 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminProfile.role === 'ROLE_SUPER_ADMIN' && (
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all"><BuildingIcon /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Apartments</p>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{apartments.length}</h3>
                    </div>
                  </div>
                )}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all"><HomeIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Blocks</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{blocks.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-violet-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-all"><DoorIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Flats</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{flats.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-teal-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all"><CheckCircleIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Available</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{flats.filter(f => f.status === 'AVAILABLE').length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all"><UsersIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Staff Members</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{staff.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-rose-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all"><BellIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Active Notices</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{notices.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-primary/100/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all"><EyeIcon /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Visitors</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{visitors.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-pink-500/5 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-all">
                    <IoCarOutline size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Vehicles</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{vehicles.length}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <h3 className="text-xl font-bold text-slate-800"><IoFlashOutline size={24} className="text-primary inline mr-2" />Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
                  {[
                    { id: "manageUsers", icon: <UsersIcon />, label: "Users", color: "bg-primary-light text-primary hover:bg-primary" },
                    { id: "manageMaintenance", icon: <RupeeIcon />, label: "Billing", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600" },
                    { id: "manageComplaints", icon: <WrenchIcon />, label: "Service", color: "bg-rose-50 text-rose-600 hover:bg-rose-600" },
                    { id: "manageVisitors", icon: <ClockIcon />, label: "Entry", color: "bg-primary/10 text-primary hover:bg-primary" },
                    { id: "manageApartments", icon: <BuildingIcon />, label: "Units", color: "bg-violet-50 text-violet-600 hover:bg-violet-600" },
                    { id: "manageFacilities", icon: <ClubIcon />, label: "Club", color: "bg-amber-50 text-amber-600 hover:bg-amber-600" },
                    { id: "notices", icon: <BellIcon />, label: "Notice", color: "bg-pink-50 text-pink-600 hover:bg-pink-600" }
                  ].map(action => (
                    <button key={action.label} onClick={() => setActiveView(action.id)} className="flex flex-col items-center gap-3 group transition-transform active:scale-95">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 ${action.color}`}>
                        {action.icon}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest leading-none">{action.label}</span>
                    </button>
                  ))}
                  <button onClick={() => setShowMoreActions(!showMoreActions)} className="flex flex-col items-center gap-3 group transition-transform active:scale-95">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 ${showMoreActions ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-800'}`}>
                      {showMoreActions ? <XIcon /> : <PlusIcon />}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest leading-none">{showMoreActions ? 'Less' : 'More'}</span>
                  </button>
                </div>

                {showMoreActions && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 mt-6 pt-6 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                    {[
                      { id: "managePolls", icon: <VoteIcon />, label: "Polls", color: "bg-blue-50 text-blue-600 hover:bg-blue-600" },
                      { id: "manageClubhouse", icon: <ClubIcon />, label: "Clubhouse", color: "bg-orange-50 text-orange-600 hover:bg-orange-600" },
                      { id: "manageParking", icon: <ShieldIcon />, label: "Parking", color: "bg-teal-50 text-teal-600 hover:bg-teal-600" },
                      { id: "staff", icon: <UsersIcon />, label: "Staff", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600" },
                      { id: "moveInOut", icon: <DoorIcon />, label: "Records", color: "bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-600" },
                      { id: "manageFeedback", icon: <FileTextIcon />, label: "Feedback", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-600" }
                    ].map(action => (
                      <button key={action.label} onClick={() => setActiveView(action.id)} className="flex flex-col items-center gap-3 group transition-transform active:scale-95">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 ${action.color}`}>
                          {action.icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest leading-none">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center  text-xl shadow-inner"><IoPulseOutline size={24} /></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight  uppercase tracking-[0.1em]">Facility Health</h3>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-colors group">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Workforce</span>
                      <span className="px-4 py-1.5 bg-primary text-white rounded-lg font-black text-xs shadow-md shadow-primary/30">{staff.length} Active</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors group">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Occupancy</span>
                      <span className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-xs shadow-md shadow-emerald-200">{flats.length > 0 ? Math.round(((flats.length - flats.filter(f => f.status === 'AVAILABLE').length) / flats.length) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors group">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Availability</span>
                      <span className="px-4 py-1.5 bg-amber-500 text-white rounded-lg font-black text-xs shadow-md shadow-amber-200">{flats.filter(f => f.status === 'AVAILABLE').length} Units</span>
                    </div>
                  </div>


                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center  text-xl shadow-inner"><IoHomeIo size={24} /></div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight  uppercase tracking-[0.1em]">Live Occupancy Analytics</h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Pie Chart */}
                  <div className="flex-1 min-h-[300px] w-full">
                    {flats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Occupied', value: flats.length - flats.filter(f => f.status === 'AVAILABLE').length },
                              { name: 'Available', value: flats.filter(f => f.status === 'AVAILABLE').length }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell key="cell-0" fill="url(#colorOccupied)" />
                            <Cell key="cell-1" fill="url(#colorAvailable)" />
                          </Pie>
                          <defs>
                            <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#e11d48" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-400 font-bold">No data telemetry available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTICES SECTION */}
          {activeView === "notices" && (
            <div className="fade-in-up space-y-8 p-8">
              <div className="flex justify-end items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <button className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${showNoticeModal ? 'bg-slate-100 text-slate-600' : 'bg-primary text-white shadow-indigo-600/20 hover:bg-primary-hover'}`} onClick={() => setShowNoticeModal(!showNoticeModal)}>
                  {showNoticeModal ? '✕ Cancel Posting' : '+ Create New Notice'}
                </button>
              </div>

              {/* Notice Inline Form */}
              {showNoticeModal && (
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-600/10 border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-500">
                  <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600"></div>
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-inner"><IoNotificationsOutline size={24} /></div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Draft Official Notice</h3>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Notice Title <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          className={`w-full px-5 py-4 rounded-2xl border ${noticeErrors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400`}
                          placeholder="e.g., Annual Maintenance Fee 2024"
                          value={noticeFormData.title}
                          onChange={(e) => {
                            setNoticeFormData({ ...noticeFormData, title: e.target.value });
                            if (noticeErrors.title) setNoticeErrors({ ...noticeErrors, title: '' });
                          }}
                        />
                        {noticeErrors.title && <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-2"><span><IoAlertCircleOutline size={14} /></span> {noticeErrors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Description <span className="text-rose-500">*</span></label>
                        <textarea
                          className={`w-full px-5 py-4 rounded-2xl border ${noticeErrors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 min-h-[150px]`}
                          placeholder="Detail the notice content clearly for all residents..."
                          value={noticeFormData.description}
                          onChange={(e) => {
                            setNoticeFormData({ ...noticeFormData, description: e.target.value });
                            if (noticeErrors.description) setNoticeErrors({ ...noticeErrors, description: '' });
                          }}
                        />
                        {noticeErrors.description && <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-2"><span><IoAlertCircleOutline size={14} /></span> {noticeErrors.description}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">Target Month <span className="text-rose-500">*</span></label>
                          <select
                            className={`w-full px-5 py-4 rounded-2xl border ${noticeErrors.month ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 appearance-none bg-no-repeat bg-[right_1.25rem_center]`}
                            value={noticeFormData.month}
                            onChange={(e) => {
                              setNoticeFormData({ ...noticeFormData, month: e.target.value });
                              if (noticeErrors.month) setNoticeErrors({ ...noticeErrors, month: '' });
                            }}
                          >
                            <option value="">Select Month</option>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Year</label>
                          <select
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                            value={noticeFormData.year}
                            onChange={(e) => setNoticeFormData({ ...noticeFormData, year: parseInt(e.target.value) })}
                          >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Notice Type</label>
                          <select
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700"
                            value={noticeFormData.type}
                            onChange={(e) => setNoticeFormData({ ...noticeFormData, type: e.target.value })}
                          >
                            <option value="NOTICE">General Notice</option>
                            <option value="EVENT">Building Event</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Attachment</label>
                          <input
                            type="file"
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-light file:text-primary hover:file:bg-primary-light transition-all cursor-pointer"
                            onChange={(e) => setNoticeFile(e.target.files[0])}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </div>
                      </div>

                      {noticeFormData.type === 'EVENT' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary-light/50 rounded-3xl border border-primary/20 animate-in fade-in zoom-in-95 duration-300">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Event Timing</label>
                            <input type="datetime-local" className="w-full px-5 py-4 rounded-2xl border border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 bg-white" value={noticeFormData.eventDate} onChange={(e) => setNoticeFormData({ ...noticeFormData, eventDate: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Event Venue</label>
                            <input type="text" className="w-full px-5 py-4 rounded-2xl border border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 bg-white" placeholder="e.g., Community Hall" value={noticeFormData.eventLocation} onChange={(e) => setNoticeFormData({ ...noticeFormData, eventLocation: e.target.value })} />
                          </div>
                        </div>
                      )}
                      <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-100 pt-10">
                        <button className="px-8 py-4 rounded-2xl font-black text-teal-600 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 transition-all active:scale-95" onClick={closeNoticeModal}>Discard</button>
                        <button className={`px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center gap-3 ${noticeMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={handleNoticeSubmit} disabled={noticeMutation.isPending}>
                          {noticeMutation.isPending ? 'Publishing...' : <><span className="text-xl"><IoPaperPlaneOutline size={20} /></span> Publish to Residents</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notices List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {notices.length === 0 ? (
                  <div className="lg:col-span-2 bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"><IoMailUnreadOutline size={40} /></div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">No Notices Yet</h4>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">When you publish notices or events, they will appear here for residents to view.</p>
                  </div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${notice.type === 'EVENT' ? 'bg-amber-100 text-amber-600' : 'bg-primary-light text-primary'}`}>
                            {notice.type === 'EVENT' ? <IoCalendarOutline size={20} /> : <IoNotificationsOutline size={20} />}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-800 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{notice.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notice.month} {notice.year}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-[10px] font-black  text-primary uppercase tracking-widest">{notice.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {notice.attachmentUrl && (
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors" onClick={() => setViewImage(getReceiptUrl(notice.attachmentUrl))} title="View Attachment">
                              <EyeIcon size={20} />
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors" onClick={() => handleNoticeDelete(notice.id)} title="Delete Notice">
                            <XIcon size={20} />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium mb-6 flex-1 line-clamp-3">{notice.description}</p>

                      {notice.type === 'EVENT' && (
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2 border border-slate-100">
                          <div className="flex items-center gap-2 text-sm">
                            <ClockIcon size={14} />
                            <span className="font-bold text-slate-700">{new Date(notice.eventDate).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <ShieldIcon size={14} />
                            <span className="font-medium text-slate-600">Venue: <span className="font-bold text-slate-800">{notice.eventLocation}</span></span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end mt-auto pt-6 border-t border-slate-50">
                        <button className="text-sm font-black text-primary hover:translate-x-1 transition-transform flex items-center gap-1 uppercase tracking-widest" onClick={() => loadNoticeResponses(notice.id)}>
                          {expandedNoticeId === notice.id ? 'Close details' : 'View Response'} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </button>
                      </div>

                      {expandedNoticeId === notice.id && (
                        <div className="mt-6 p-4 bg-primary-light/30 rounded-2xl border border-primary/20/50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Response Statistics</p>
                          {loadingResponses ? (
                            <div className="animate-pulse flex gap-2"><div className="h-4 w-20 bg-primary-light rounded"></div><div className="h-4 w-20 bg-primary-light rounded"></div></div>
                          ) : (
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-xl font-black text-primary">{noticeResponses[notice.id]?.filter(r => r.responseType === 'GOING').length || 0}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter">Going</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-black text-slate-600">{noticeResponses[notice.id]?.filter(r => r.responseType === 'MAYBE').length || 0}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Maybe</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-black text-rose-600">{noticeResponses[notice.id]?.filter(r => r.responseType === 'NOT_GOING').length || 0}</p>
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">Declined</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STAFF MANAGEMENT SECTION */}
          {activeView === "staff" && (
            <div className="fade-in-up space-y-8 p-8">
              <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <EyeIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by name or role..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-600 bg-slate-50" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} />
                  </div>
                  <select className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-500 outline-none focus:border-primary transition-all" value={staffSort} onChange={(e) => setStaffSort(e.target.value)}>
                    <option value="username">Sort by Name</option>
                    <option value="designation">Sort by Role</option>
                  </select>
                  <button className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-primary-hover transition-all flex items-center gap-2 active:scale-95" onClick={() => setShowStaffModal(true)}>
                    <PlusIcon size={18} /> Enroll
                  </button>
                </div>
              </div>

              {/* Staff Enrollment Form Modal */}
              {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div ref={staffModalRef} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
                    <div className="p-10">
                      <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-2xl shadow-inner"><IoShieldCheckmarkOutline size={24} /></div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditingStaff ? 'Update Staff Member' : 'Enroll New Staff'}</h3>
                        </div>
                        <button onClick={closeStaffModal} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">✕</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name <span className="text-rose-500">*</span></label>
                          <input type="text" className={`w-full px-5 py-4 rounded-2xl border ${staffErrors.username ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700`} value={staffFormData.username} onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address <span className="text-rose-500">*</span></label>
                          <input type="email" className={`w-full px-5 py-4 rounded-2xl border ${staffErrors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700`} value={staffFormData.email} onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                          <input type="tel" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700" value={staffFormData.phone} onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                          <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700" value={staffFormData.designation} onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}>
                            <option value="SECURITY_GUARD">Security Guard</option>
                            <option value="FACILITY_MANAGER">Facility Manager</option>
                            <option value="HOUSE_KEEPING">House Keeper</option>
                            <option value="MAINTENANCE">Maintenance Staff</option>
                            <option value="ELECTRICIAN">Electrician</option>
                            <option value="PLUMBER">Plumber</option>
                          </select>
                        </div>
                        {!isEditingStaff && (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Password <span className="text-rose-500">*</span></label>
                            <div className="relative">
                              <input type={showPassword ? "text" : "password"} className={`w-full px-5 py-4 pr-12 rounded-2xl border ${staffErrors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700`} value={staffFormData.password} onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })} />
                              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-12 flex justify-end gap-4 border-t border-slate-100 pt-8">
                        <button className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all" onClick={closeStaffModal}>Cancel</button>
                        <button className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-primary-hover transition-all active:scale-95" onClick={handleStaffSubmit}>
                          {isEditingStaff ? 'Update Profile' : 'Enroll Member'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff List Tabs */}
              <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                <button className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${staffTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setStaffTab('active')}>Active ({staff.length})</button>
                <button className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${staffTab === 'deactivated' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setStaffTab('deactivated')}>Deactivated ({deactivatedStaff.length})</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(() => {
                  const currentStaff = staffTab === "active" ? staff : deactivatedStaff;
                  const filtered = currentStaff.filter(s => (s.username?.toLowerCase().includes(staffSearch.toLowerCase()) || s.designation?.toLowerCase().includes(staffSearch.toLowerCase())));

                  if (filtered.length === 0) return (
                    <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                      <p className="text-slate-400 font-bold  text-center w-full">No {staffTab} staff members found matching your search.</p>
                    </div>
                  );

                  return filtered.map(member => (
                    <div key={member.id} className={`bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col items-center  ${staffTab === 'deactivated' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                      <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-primary-light text-primary flex items-center justify-center text-4xl font-black shadow-lg shadow-primary/20/50 group-hover:scale-110 transition-transform">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center  ${staffTab === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                      </div>

                      <h4 className="text-xl font-black text-slate-800 mb-1">{member.username}</h4>
                      <span className="text-[10px] font-black  text-primary uppercase tracking-widest mb-6 leading-none bg-primary-light px-3 py-1 rounded-full">{member.designation.replace('_', '')}</span>

                      <div className="space-y-2 mb-8 w-full border-t border-slate-50 pt-6">
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                          <span className="">{member.contactNumber || 'Contact N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-auto w-full">
                        <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all" onClick={() => handleEditStaff(member)}>Profile</button>
                        {staffTab === 'active' ? (
                          <button className="flex-1 py-3 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-100" onClick={() => handleStaffDeactivate(member.id)}>Deactivate</button>
                        ) : (
                          <button className="flex-1 py-3 bg-emerald-50 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100" onClick={() => handleStaffReactivate(member.id)}>Restore</button>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* COMPONENT ROUTING */}
          <div className="p-8">
            {activeView === "manageUsers" && <ManageUsers />}
            {activeView === "manageMaintenance" && <ManageMaintenance flats={flats} apartments={apartments} blocks={blocks} staff={staff} />}
            {activeView === "manageApartments" && (
              <ManageApartments
                admin={adminProfile}
                apartments={apartments}
                blocks={blocks}
                flats={flats}
                loadApartments={() => queryClient.invalidateQueries(["apartments"])}
                loadBlocks={() => queryClient.invalidateQueries(["blocks"])}
                loadFlats={() => queryClient.invalidateQueries(["flats"])}
              />
            )}
            {activeView === "manageComplaints" && <ManageComplaints />}
            {activeView === "manageParking" && <ManageParking />}
            {activeView === "manageFacilities" && <ManageFacilities />}
            {activeView === "manageClubhouse" && <ManageClubhouse />}
            {activeView === "manageVisitors" && <ManageVisitors />}
            {activeView === "managePolls" && <ManagePolls />}
            {activeView === "moveInOut" && <ManageMoveInOut />}
            {activeView === "manageFeedback" && <ManageFeedback />}
            {activeView === "subscription" && (
              <SubscriptionView
                activeSub={activeSub}
                currentPlanKey={currentPlanKey}
                adminProfile={adminProfile}
                onRefresh={refetchSub}
              />
            )}
          </div>
        </div>
      </main>

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-sidebar/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewImage(null)}>
          <div className="relative max-w-5xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 transition-all z-10 font-black text-xl shadow-xl"
            >
              ✕
            </button>
            <div className="p-4 bg-slate-50 flex items-center justify-center min-h-[400px]">
              <img src={viewImage} alt="Preview" className="max-w-full max-h-[80vh] rounded-2xl shadow-lg border border-slate-200" />
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Document Preview Mode</p>
              <a href={viewImage} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition-all">Open Original</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subscription View Component ──────────────────────────────────────────────
function SubscriptionView({ activeSub, currentPlanKey, adminProfile, onRefresh }) {
  const currentPlan = PLANS.find(p => p.key === currentPlanKey);
  const upgradePlans = PLANS.filter(p => p.key !== currentPlanKey);

  const daysLeft = activeSub?.endDate
    ? Math.max(0, Math.ceil((new Date(activeSub.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const urgencyColor = daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="space-y-8 fade-in-up">
      {/* Current Plan Card */}
      <div className={`relative bg-gradient-to-br ${currentPlan?.color || "from-slate-500 to-slate-600"} rounded-3xl p-8 text-white shadow-2xl overflow-hidden`}>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute right-6 bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CrownIcon className="w-6 h-6" />
              <span className="text-white/70 text-sm font-bold uppercase tracking-widest">Current Plan</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-1">
              {currentPlan?.label || "No Plan"} Plan
            </h2>
            <p className="text-white/70 text-sm mb-4">{currentPlan?.description || "Contact Master Admin to assign a plan"}</p>
            <div className="flex flex-wrap gap-3">
              {activeSub ? (
                <>
                  <span className="px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-bold">
                    ₹{(activeSub.pricePaid || 0).toLocaleString()}/month
                  </span>
                  <span className="px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-bold">
                    Expires: {activeSub.endDate}
                  </span>
                  <span className={`px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-bold`}>
                    <span className={urgencyColor}>{daysLeft} days left</span>
                  </span>
                </>
              ) : (
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-bold text-red-200">
                  No active subscription
                </span>
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 min-w-[220px]">
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Included Features</div>
            <ul className="space-y-2">
              {(currentPlan?.features || ["Contact Master Admin to get a plan"]).map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg className="w-3.5 h-3.5 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Module Access Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Module Access with Current Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { id: "notices", label: "Notice Board" },
            { id: "staff", label: "Staff Management" },
            { id: "manageUsers", label: "Manage Residents" },
            { id: "manageComplaints", label: "Complaints" },
            { id: "manageVisitors", label: "Visitors/Vehicles" },
            { id: "manageMaintenance", label: "Maintenance Billing" },
            { id: "manageParking", label: "Parking Management" },
            { id: "manageClubhouse", label: "Clubhouse Booking" },
            { id: "managePolls", label: "Polls & Surveys" },
            { id: "manageFacilities", label: "Facilities" },
            { id: "moveInOut", label: "Move In/Out Records" },
            { id: "manageFeedback", label: "Feedback & Support" },
          ].map(mod => {
            const allowed = allowedModule(currentPlanKey, mod.id);
            return (
              <div key={mod.id} className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-colors
                ${allowed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"}`}>
                {allowed
                  ? <svg className="w-4 h-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  : <LockIcon className="w-4 h-4 shrink-0" />}
                {mod.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Plans */}
      {upgradePlans.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Upgrade Your Plan</h3>
          <p className="text-slate-500 text-sm mb-5">Contact your Master Admin to switch plans and unlock more modules.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {PLANS.filter(p => p.key !== currentPlanKey).map(plan => {
              const isHigher = PLANS.findIndex(p => p.key === plan.key) > PLANS.findIndex(p => p.key === currentPlanKey);
              return (
                <div key={plan.key} className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${isHigher ? "border-indigo-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100" : "border-slate-200 opacity-70"}`}>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-4 ${plan.badge}`}>
                    {plan.label}
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 mb-0.5">₹{plan.price.toLocaleString()}<span className="text-base font-medium text-slate-400">/mo</span></div>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-3.5 h-3.5 shrink-0 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isHigher && (
                    <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-700 font-semibold text-center border border-indigo-100">
                      📧 Contact Master Admin to upgrade to this plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: check if a module is accessible for a given plan
function allowedModule(planKey, moduleId) {
  return getPlanAccess(planKey || "STARTER").includes(moduleId);
}
