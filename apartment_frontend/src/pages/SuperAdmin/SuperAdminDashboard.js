import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";

const BuildingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22V12h6v10" />
        <line x1="8" y1="6" x2="8.01" y2="6" />
        <line x1="16" y1="6" x2="16.01" y2="6" />
        <line x1="8" y1="10" x2="8.01" y2="10" />
        <line x1="16" y1="10" x2="16.01" y2="10" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const StatsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const LockIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CrownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20" />
        <path d="M5 20V10l7-7 7 7v10" />
        <path d="M12 3v4" />
        <circle cx="5" cy="10" r="1" fill="currentColor" />
        <circle cx="19" cy="10" r="1" fill="currentColor" />
    </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

// Plan definitions
const PLANS = [
    {
        key: "STARTER",
        label: "Starter",
        price: 999,
        color: "from-slate-500 to-slate-600",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        features: ["Resident Management", "Notice Board", "Complaint Tracking", "Visitor Logs"]
    },
    {
        key: "PROFESSIONAL",
        label: "Professional",
        price: 1999,
        color: "from-indigo-500 to-blue-600",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
        features: ["All Starter Features", "Maintenance Billing", "Parking Management", "Clubhouse Booking", "Polls & Surveys"]
    },
    {
        key: "ENTERPRISE",
        label: "Enterprise",
        price: 2999,
        color: "from-violet-600 to-purple-700",
        badge: "bg-violet-100 text-violet-700 border-violet-200",
        features: ["All Professional Features", "Tenant & Rent Records", "Security Dashboard", "Advanced Analytics", "Priority Support"]
    }
];

function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [apartments, setApartments] = useState([]);
    const [availableApartments, setAvailableApartments] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showAptModal, setShowAptModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showEditAptModal, setShowEditAptModal] = useState(false);
    const [editingApt, setEditingApt] = useState({ name: "", address: "" });
    const [editingAdmin, setEditingAdmin] = useState(null);

    // Subscription state
    const [subscriptions, setSubscriptions] = useState([]);
    const [showSubModal, setShowSubModal] = useState(false);
    const [newSub, setNewSub] = useState({ id: null, apartmentId: "", plan: "STARTER", startDate: "", endDate: "" });
    const [subLoading, setSubLoading] = useState(false);

    // Inquiries state
    const [inquiries, setInquiries] = useState([]);

    // Demos state
    const [demos, setDemos] = useState([]);
    const [rescheduleDemoId, setRescheduleDemoId] = useState(null);
    const [newDemoDate, setNewDemoDate] = useState("");

    const [newApt, setNewApt] = useState({ name: "", address: "" });
    const [newAdmin, setNewAdmin] = useState({
        username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN"
    });

    useEffect(() => {
        if (activeTab === "dashboard" || activeTab === "apartments" || activeTab === "admins") fetchInitialData();
        if (activeTab === "subscriptions") fetchSubscriptions();
        if (activeTab === "requests") fetchInquiries();
        if (activeTab === "demos") fetchDemos();
    }, [activeTab]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, aptsRes, adminsRes] = await Promise.all([
                axiosInstance.get("/apartments/overall-dashboard"),
                axiosInstance.get("/apartments?size=100"),
                axiosInstance.get("/users?role=ROLE_ADMIN")
            ]);
            setStats(statsRes.data.data);
            setApartments(aptsRes.data.data.content || []);
            setAdmins(adminsRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableApts = async () => {
        try {
            const res = await axiosInstance.get("/apartments/available");
            let available = res.data.data || [];

            if (editingAdmin && editingAdmin.managedApartmentId) {
                const current = apartments.find(a => a.id === editingAdmin.managedApartmentId);
                if (current && !available.some(a => a.id === current.id)) {
                    available = [current, ...available];
                }
            }
            setAvailableApartments(available);
        } catch (err) { console.error("Error fetching available apartments", err); }
    };

    useEffect(() => {
        if (showAdminModal) {
            fetchAvailableApts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAdminModal, editingAdmin]);

    const handleCreateApartment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/apartments", newApt);
            setShowAptModal(false);
            setNewApt({ name: "", address: "" });
            fetchInitialData();
        } catch (err) { alert("Failed to create apartment"); }
    };

    const handleUpdateApartment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/apartments/${editingApt.id}`, editingApt);
            setShowEditAptModal(false);
            fetchInitialData();
        } catch (err) { alert("Failed to update apartment"); }
    };



    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await axiosInstance.put(`/admin/users/${editingAdmin.id}`, newAdmin);
            } else {
                await axiosInstance.post("/users", newAdmin);
            }
            setShowAdminModal(false);
            setEditingAdmin(null);
            setNewAdmin({ username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN" });
            fetchInitialData();
        } catch (err) { alert("Failed to save admin: " + (err.response?.data?.message || err.message)); }
    };

    const toggleAdminStatus = async (id, currentStatus) => {
        try {
            const action = currentStatus === "APPROVED" ? "deactivate" : "reactivate";
            await axiosInstance.put(`/admin/users/${id}/${action}`);
            fetchInitialData();
        } catch (err) { alert("Failed to toggle admin status"); }
    };

    const toggleAptStatus = async (id, currentStatus) => {
        try {
            const action = currentStatus === "ENABLED" ? "disable" : "enable";
            await axiosInstance.put(`/apartments/${id}/${action}`);
            fetchInitialData();
        } catch (err) { alert("Failed to toggle status"); }
    };

    const fetchSubscriptions = async () => {
        try {
            const res = await axiosInstance.get("/subscriptions");
            setSubscriptions(res.data.data || []);
        } catch (err) { console.error("Failed to load subscriptions", err); }
    };

    const fetchInquiries = async () => {
        try {
            const res = await axiosInstance.get("/admin/inquiries");
            setInquiries(res.data || []);
        } catch (err) { console.error("Failed to load inquiries", err); }
    };

    const updateInquiryStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/admin/inquiries/${id}/status?status=${status}`);
            fetchInquiries();
        } catch (err) { alert("Failed to update status"); }
    };

    const fetchDemos = async () => {
        try {
            const res = await axiosInstance.get("/admin/demos");
            setDemos(res.data || []);
        } catch (err) { console.error("Failed to load demos", err); }
    };

    const updateDemoStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/admin/demos/${id}/status?status=${status}`);
            fetchDemos();
        } catch (err) { alert("Failed to update status"); }
    };

    const handleRescheduleDemo = async (id) => {
        if (!newDemoDate) return;
        try {
            await axiosInstance.put(`/admin/demos/${id}/reschedule?newDateTime=${newDemoDate}`);
            setRescheduleDemoId(null);
            setNewDemoDate("");
            fetchDemos();
        } catch (err) { alert("Failed to reschedule demo"); }
    };

    const handleAssignSubscription = async (e) => {
        e.preventDefault();
        setSubLoading(true);
        try {
            if (newSub.id) {
                await axiosInstance.put(`/subscriptions/${newSub.id}`, {
                    apartmentId: parseInt(newSub.apartmentId),
                    plan: newSub.plan,
                    startDate: newSub.startDate,
                    endDate: newSub.endDate
                });
            } else {
                await axiosInstance.post("/subscriptions", {
                    apartmentId: parseInt(newSub.apartmentId),
                    plan: newSub.plan,
                    startDate: newSub.startDate,
                    endDate: newSub.endDate
                });
            }
            setShowSubModal(false);
            setNewSub({ id: null, apartmentId: "", plan: "STARTER", startDate: "", endDate: "" });
            fetchSubscriptions();
        } catch (err) {
            alert("Failed to save subscription: " + (err.response?.data?.message || err.message));
        } finally {
            setSubLoading(false);
        }
    };

    const handleStartDateChange = (date) => {
        if (!date) return setNewSub({ ...newSub, startDate: date, endDate: "" });
        const start = new Date(date);
        start.setDate(start.getDate() + 30);
        const endDateStr = start.toISOString().split("T")[0];
        setNewSub({ ...newSub, startDate: date, endDate: endDateStr });
    };

    const handleEditSub = (sub) => {
        setNewSub({
            id: sub.id,
            apartmentId: sub.apartmentId,
            plan: sub.plan,
            startDate: sub.startDate,
            endDate: sub.endDate
        });
        setShowSubModal(true);
    };

    const handleDeleteSubscription = async (id) => {
        if (!window.confirm("Delete this subscription record?")) return;
        try {
            await axiosInstance.delete(`/subscriptions/${id}`);
            fetchSubscriptions();
        } catch (err) { alert("Failed to delete subscription"); }
    };

    if (loading && !stats) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-wide animate-pulse">Loading Super Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Sidebar */}
            <aside className={`bg-sidebar text-white flex flex-col shadow-xl z-40 sticky top-0 hidden md:flex h-screen transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-4 flex items-center gap-3 border-b border-white/10 overflow-hidden h-[73px]">
                    <div className="p-2 bg-gradient-to-br from-primary to-indigo-600 rounded-lg shadow-lg shadow-primary/30 shrink-0">
                        <BuildingIcon />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 whitespace-nowrap leading-tight">Secure Gate</span>
                    )}
                </div>

                {/* Desktop Sidebar Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-8 bg-white text-slate-800 p-1 rounded-full shadow-md border border-slate-200 z-50 hover:bg-slate-50 transition-colors hidden md:block"
                >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {[
                        { id: "dashboard", label: "Overview", icon: <StatsIcon /> },
                        { id: "apartments", label: "Apartments", icon: <BuildingIcon /> },
                        { id: "admins", label: "Admins", icon: <UserIcon /> },
                        { id: "subscriptions", label: "Subscriptions", icon: <CrownIcon /> },
                        { id: "requests", label: "Client Inquiries", icon: <StatsIcon /> },
                        { id: "demos", label: "Demo Requests", icon: <StatsIcon /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                                ${activeTab === tab.id
                                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"} ${!isSidebarOpen && 'justify-center'}`}
                            onClick={() => setActiveTab(tab.id)}
                            title={!isSidebarOpen ? tab.label : undefined}
                        >
                            <span className={activeTab === tab.id ? "text-primary" : ""}>{tab.icon}</span>
                            {isSidebarOpen && <span className="whitespace-nowrap">{tab.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className={`w-full py-3 px-4 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl transition-colors duration-200 text-sm font-semibold flex items-center gap-2 justify-center`}
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                        }}
                        title={!isSidebarOpen ? "Logout" : undefined}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-sidebar text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg">
                        <BuildingIcon />
                    </div>
                    <span className="text-lg font-bold">Secure Gate</span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {["dashboard", "apartments", "admins", "subscriptions", "requests", "demos"].map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${activeTab === tab ? "bg-primary-500/20 text-primary-300" : "bg-white/5 text-slate-300"}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto no-scrollbar">
                <header className="bg-sidebar backdrop-blur-md sticky top-0 z-30 border-b border-white/10 px-6 py-3 flex justify-between items-center shadow-sm h-[73px]">
                    <h2 className="text-xl font-bold text-white capitalize tracking-tight">{activeTab}</h2>
                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/90 rounded-full text-sm font-semibold shadow-inner flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        Master Admin
                    </div>
                </header>

                <div className="p-4 md:p-6 flex-1 max-w-7xl mx-auto w-full">
                    {/* Dashboard Tab */}
                    {activeTab === "dashboard" && (
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <StatCard title="Total Communities" value={stats?.totalApartments} icon={<BuildingIcon />} colorFrom="from-indigo-500" colorTo="to-blue-500" shadowColor="shadow-blue-500/20" />
                                <StatCard title="Total Population" value={stats?.totalResidents} icon={<UserIcon />} colorFrom="from-emerald-500" colorTo="to-teal-500" shadowColor="shadow-emerald-500/20" />
                                <StatCard title="Active Subscriptions" value={stats?.totalSubscriptions} icon={<CrownIcon />} colorFrom="from-amber-500" colorTo="to-orange-500" shadowColor="shadow-amber-500/20" />
                                <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString()}`} icon={<StatsIcon />} colorFrom="from-rose-500" colorTo="to-pink-500" shadowColor="shadow-rose-500/20" />
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Inquiry Analytics</h3>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Leads Management</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-3xl font-black text-slate-800">{stats?.totalInquiries}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Inquiries</p>
                                        </div>
                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                            <p className="text-3xl font-black text-amber-600">{stats?.newInquiries}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mt-1">Pending Review</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-3xl font-black text-slate-800">{stats?.totalDemos}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Demos</p>
                                        </div>
                                        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                                            <p className="text-3xl font-black text-indigo-600">{stats?.scheduledDemos}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">Scheduled Slots</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Platform Health</h3>
                                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">System Status</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-indigo-500">
                                                    <BuildingIcon />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-slate-800">{apartments.length}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apartments</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-emerald-500">
                                                    <UserIcon />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-slate-800">{admins.length}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Admins</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 overflow-hidden">
                                            <div className="px-5 py-3 bg-slate-100/50 border-b border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upcoming Plan Expiries</p>
                                            </div>
                                            <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                                                {apartments.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-400 text-xs">No societies registered</div>
                                                ) : (
                                                    apartments.map(apt => {
                                                        const aptSubs = subscriptions.filter(s => (s.apartmentId === apt.id || s.apartment?.id === apt.id));
                                                        const latestSub = aptSubs.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
                                                        const isExpired = latestSub ? new Date(latestSub.endDate) < new Date() : true;

                                                        return (
                                                            <div key={apt.id} className="px-5 py-3 flex justify-between items-center border-b border-slate-100/50 last:border-0 hover:bg-white transition-colors">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{apt.name}</p>
                                                                    <p className="text-[10px] text-slate-400">{latestSub ? latestSub.plan : 'No Plan'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                                        {latestSub ? new Date(latestSub.endDate).toLocaleDateString() : 'N/A'}
                                                                    </p>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expiry</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Apartments Tab */}
                    {activeTab === "apartments" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <p className="text-slate-500 text-lg">Manage societies and communities registered in the system.</p>
                                <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                                    onClick={() => setShowAptModal(true)}>
                                    <PlusIcon /> Add Apartment
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Name</th>
                                                <th className="px-6 py-4 font-semibold">Address</th>
                                                <th className="px-6 py-4 font-semibold text-center mt-auto">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {apartments.map(apt => (
                                                <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{apt.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm max-w-[200px] truncate" title={apt.address}>{apt.address}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none
                                                            ${apt.status === "ENABLED"
                                                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                : "bg-red-100 text-red-700 border border-red-200"}`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                                                onClick={() => {
                                                                    setEditingApt(apt);
                                                                    setShowEditAptModal(true);
                                                                }} title="Edit">
                                                                <EditIcon />
                                                            </button>
                                                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border
                                                                ${apt.status === "ENABLED"
                                                                    ? "text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                                    : "text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                                                                onClick={() => toggleAptStatus(apt.id, apt.status)}>
                                                                <LockIcon /> {apt.status === "ENABLED" ? "Deactivate" : "Enable"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {apartments.length === 0 && (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No apartments found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admins Tab */}
                    {activeTab === "admins" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <p className="text-slate-500 text-lg">Assign Society Admins to handle apartment operations.</p>
                                <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                                    onClick={() => {
                                        setEditingAdmin(null);
                                        setNewAdmin({ username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN" });
                                        setShowAdminModal(true);
                                    }}>
                                    <PlusIcon /> New Admin
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Admin Info</th>
                                                <th className="px-6 py-4 font-semibold">Assigned Community</th>
                                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {admins.map(admin => (
                                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{admin.username}</div>
                                                        <div className="text-sm text-slate-500">{admin.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {admin.managedApartmentName ? (
                                                            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                                                                {admin.managedApartmentName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-sm">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-blue-100 text-blue-700 border border-blue-200">
                                                            {admin.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                                                onClick={() => {
                                                                    setEditingAdmin(admin);
                                                                    setNewAdmin({
                                                                        username: admin.username, email: admin.email,
                                                                        contactNumber: admin.contactNumber,
                                                                        apartmentId: admin.managedApartmentId || "",
                                                                        role: "ROLE_ADMIN"
                                                                    });
                                                                    setShowAdminModal(true);
                                                                }} title="Edit Admin">
                                                                <EditIcon />
                                                            </button>
                                                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border
                                                                ${admin.status === "APPROVED"
                                                                    ? "text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                                    : "text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                                                                onClick={() => toggleAdminStatus(admin.id, admin.status)}>
                                                                <LockIcon /> {admin.status === "APPROVED" ? "Deactivate" : "Activate"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {admins.length === 0 && (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No admins found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === "subscriptions" && (
                        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                            {/* Plan cards */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Available Plans</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {PLANS.map(plan => (
                                        <div key={plan.key} className={`relative bg-gradient-to-br ${plan.color} rounded-2xl p-6 text-white shadow-lg overflow-hidden group`}>
                                            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">{plan.label}</span>
                                                    <CrownIcon />
                                                </div>
                                                <div className="text-4xl font-extrabold mb-1">₹{plan.price.toLocaleString()}</div>
                                                <div className="text-white/60 text-xs mb-4">/month</div>
                                                <ul className="space-y-1.5">
                                                    {plan.features.map(f => (
                                                        <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                                                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assigned subscriptions table */}
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">Assigned Subscriptions</h3>
                                    <button
                                        className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                                        onClick={() => { setNewSub({ id: null, apartmentId: "", plan: "STARTER", startDate: "", endDate: "" }); setShowSubModal(true); }}>
                                        <PlusIcon /> Assign Plan
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                    <th className="px-6 py-4 font-semibold">Community</th>
                                                    <th className="px-6 py-4 font-semibold">Plan</th>
                                                    <th className="px-6 py-4 font-semibold">Period</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Price</th>
                                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {subscriptions.map(sub => {
                                                    const plan = PLANS.find(p => p.key === sub.plan);
                                                    return (
                                                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-4 font-bold text-slate-800">{sub.apartmentName}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${plan?.badge || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                                                    {plan?.label || sub.plan}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                                {sub.startDate} → {sub.endDate}
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-semibold text-slate-800">₹{(sub.pricePaid || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${sub.active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                                                                    {sub.active ? "Active" : "Expired"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                                                                    onClick={() => handleEditSub(sub)} title="Edit">
                                                                    <EditIcon />
                                                                </button>
                                                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                    onClick={() => handleDeleteSubscription(sub.id)} title="Delete">
                                                                    <TrashIcon />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {subscriptions.length === 0 && (
                                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">No subscriptions assigned yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requests / Inquiries Tab */}
                    {activeTab === "requests" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Client Inquiries</h3>
                                    <p className="text-slate-500 text-sm mt-1">Manage leads from the marketing website.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Client Details</th>
                                                <th className="px-6 py-4 font-semibold">Community Info</th>
                                                <th className="px-6 py-4 font-semibold">Requested Plan</th>
                                                <th className="px-6 py-4 font-semibold">Date</th>
                                                <th className="px-6 py-4 font-semibold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {inquiries.map(inq => (
                                                <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{inq.name}</div>
                                                        <div className="text-sm text-slate-500 flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> {inq.phone}</div>
                                                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> {inq.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{inq.apartmentName}</div>
                                                        <div className="text-sm text-slate-500">{inq.numberOfFlats} flats • {inq.city}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 uppercase">
                                                            {inq.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {new Date(inq.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <select
                                                            className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 outline-none appearance-none cursor-pointer ${inq.status === 'NEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                inq.status === 'CONTACTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                }`}
                                                            value={inq.status}
                                                            onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                                                        >
                                                            <option value="NEW">New</option>
                                                            <option value="CONTACTED">Contacted</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                            {inquiries.length === 0 && (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No inquiries found yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Demos Tab */}
                    {activeTab === "demos" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Demo Requests</h3>
                                    <p className="text-slate-500 text-sm mt-1">Manage scheduled platform walk-throughs.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Client Details</th>
                                                <th className="px-6 py-4 font-semibold">Community Info</th>
                                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                                <th className="px-6 py-4 font-semibold">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {demos.map(demo => (
                                                <tr key={demo.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{demo.name}</div>
                                                        <div className="text-sm text-slate-500">{demo.phone} • {demo.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{demo.apartmentName}</div>
                                                        <div className="text-sm text-slate-500">{demo.flatsCount} flats</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {rescheduleDemoId === demo.id ? (
                                                            <div className="flex gap-2">
                                                                <input type="datetime-local" value={newDemoDate} onChange={e => setNewDemoDate(e.target.value)}
                                                                    className="px-2 py-1 border border-slate-200 rounded text-sm outline-none" />
                                                                <button onClick={() => handleRescheduleDemo(demo.id)} className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded">Save</button>
                                                                <button onClick={() => setRescheduleDemoId(null)} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded">X</button>
                                                            </div>
                                                        ) : (
                                                            <div className="font-medium text-slate-700">
                                                                {new Date(demo.preferredDateTime).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 outline-none appearance-none cursor-pointer ${['NEW', 'SCHEDULED', 'RESCHEDULED'].includes(demo.status) ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                demo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    'bg-rose-50 text-rose-700 border-rose-200'
                                                                }`}
                                                            value={demo.status}
                                                            onChange={(e) => updateDemoStatus(demo.id, e.target.value)}
                                                        >
                                                            <option value="NEW">New</option>
                                                            <option value="SCHEDULED">Scheduled</option>
                                                            <option value="RESCHEDULED">Rescheduled</option>
                                                            <option value="COMPLETED">Completed</option>
                                                            <option value="CANCELLED">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { setRescheduleDemoId(demo.id); setNewDemoDate(demo.preferredDateTime.slice(0, 16)); }}
                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                                                                Reschedule
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {demos.length === 0 && (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No demo requests found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Subscription Modal */}
            <ModalOverlay isVisible={showSubModal} onClose={() => setShowSubModal(false)}>
                {showSubModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Assign Subscription Plan</h3>
                        <form onSubmit={handleAssignSubscription} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Community</label>
                                <select required value={newSub.apartmentId}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                                    onChange={e => setNewSub({ ...newSub, apartmentId: e.target.value })} disabled={!!newSub.id}>
                                    <option value="">Select apartment...</option>
                                    {apartments.filter(a => {
                                        if (newSub.id && newSub.apartmentId === a.id) return true; // always show currently selected if editing
                                        // only show apartments without an active plan
                                        return !subscriptions.some(s => s.apartmentId === a.id && s.active);
                                    }).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PLANS.map(plan => (
                                        <button type="button" key={plan.key}
                                            onClick={() => setNewSub({ ...newSub, plan: plan.key })}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${newSub.plan === plan.key ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40"}`}>
                                            <div className="font-bold text-slate-800 text-sm">{plan.label}</div>
                                            <div className="text-primary font-semibold text-xs mt-0.5">₹{plan.price}/mo</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                                    <input type="date" required value={newSub.startDate}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => handleStartDateChange(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                                    <input type="date" required value={newSub.endDate}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewSub({ ...newSub, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                    onClick={() => setShowSubModal(false)}>Cancel</button>
                                <button type="submit" disabled={subLoading}
                                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors disabled:opacity-60">
                                    {subLoading ? "Saving..." : newSub.id ? "Save Changes" : "Assign Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </ModalOverlay>

            {/* Modals */}
            <ModalOverlay isVisible={showAptModal || showEditAptModal || showAdminModal} onClose={() => {
                setShowAptModal(false); setShowEditAptModal(false); setShowAdminModal(false);
            }}>
                {showAptModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Register New Community</h3>
                        <form onSubmit={handleCreateApartment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apartment Name</label>
                                <input type="text" placeholder="e.g. Green Valley Society" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 placeholder-slate-400"
                                    value={newApt.name} onChange={e => setNewApt({ ...newApt, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                                <input type="text" placeholder="Location details..." required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 placeholder-slate-400"
                                    value={newApt.address} onChange={e => setNewApt({ ...newApt, address: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setShowAptModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">Create Apartment</button>
                            </div>
                        </form>
                    </div>
                )}

                {showEditAptModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Edit Community Details</h3>
                        <form onSubmit={handleUpdateApartment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apartment Name</label>
                                <input type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                    value={editingApt.name} onChange={e => setEditingApt({ ...editingApt, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                                <input type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                    value={editingApt.address} onChange={e => setEditingApt({ ...editingApt, address: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setShowEditAptModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                )}

                {showAdminModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingAdmin ? "Edit Society Admin" : "Create Society Admin"}</h3>
                        <form onSubmit={handleAdminSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                                    <input type="text" required value={newAdmin.username}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                    <input type="email" required value={newAdmin.email}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                                </div>
                                {!editingAdmin && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                        <input type="password" required value={newAdmin.password}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number</label>
                                    <input type="text" value={newAdmin.contactNumber}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, contactNumber: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Allocate Apartment</label>
                                    <select required value={newAdmin.apartmentId}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 appearance-none bg-white"
                                        onChange={e => setNewAdmin({ ...newAdmin, apartmentId: e.target.value })}>
                                        <option value="">Select a community...</option>
                                        {availableApartments.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => {
                                    setShowAdminModal(false);
                                    setEditingAdmin(null);
                                }}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">
                                    {editingAdmin ? "Update Admin" : "Create & Allocate"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </ModalOverlay>
        </div>
    );
}

function StatCard({ title, value, icon, colorFrom, colorTo, shadowColor }) {
    return (
        <div className={`bg-gradient-to-br ${colorFrom} ${colorTo} rounded-3xl p-6 text-white shadow-xl ${shadowColor} relative overflow-hidden group`}>
            {/* Background design elements */}
            <div className="absolute -right-8 -top-8 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute right-4 bottom-4 bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-sm group-hover:-translate-y-1 transition-transform duration-300">
                <div className="w-6 h-6 opacity-80">{icon}</div>
            </div>

            <div className="relative z-10">
                <h3 className="text-white/80 font-medium text-sm lg:text-base tracking-wide mb-1 uppercase drop-shadow-sm">{title}</h3>
                <div className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md">
                    {value !== undefined ? value : "..."}
                </div>
            </div>
        </div>
    );
}

function ModalOverlay({ isVisible, onClose, children }) {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100 opacity-100">
                {children}
            </div>
        </div>
    );
}

export default SuperAdminDashboard;
