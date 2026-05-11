import React, { useState } from"react";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import axiosInstance from"../../utils/axiosConfig";
import { toast } from"react-toastify";
import"./AdminShared.css";
import {
  IoPersonOutline,
  IoStarOutline,
  IoKeyOutline,
  IoShieldCheckmarkOutline,
  IoHomeOutline,
  IoSearchOutline,
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoPencilOutline,
  IoAddOutline,
  IoCheckmarkOutline
} from "react-icons/io5";


const getDocUrl = (url) => {
  if (!url) return url;
  let fixed = url.replace(/^http:\/\//,"https://");
  if (fixed.toLowerCase().endsWith(".pdf") && fixed.includes("/image/upload/")) {
    fixed = fixed.replace("/image/upload/","/raw/upload/");
  }
  return fixed;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reactivateUserId, setReactivateUserId] = useState(null);
  const [flatIdToAllocate, setFlatIdToAllocate] = useState("");
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);
  const [flatIdError, setFlatIdError] = useState("");
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    username:"",
    email:"",
    password:"",
    confirmPassword:"",
    role:"ROLE_SECURITY",
    phoneNumber:"",
    apartmentId:""
  });
  const [activeTab, setActiveTab] = useState("all"); //"all","residents","requests"
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/profile");
      return res.data?.data;
    }
  });

  const currentUserRole = profile?.role ||"";

  const { data: apartments = [] } = useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/apartments");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    },
    enabled: currentUserRole ==="ROLE_SUPER_ADMIN"
  });

  const { data: flats = [] } = useQuery({
    queryKey: ["flats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/flats");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/users");
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  const availableFlats = flats.filter(f => f.status ==="AVAILABLE");

  // Mutations
  const userMutation = useMutation({
    mutationFn: async ({ isEditing, id, payload }) => {
      if (isEditing) {
        return axiosInstance.put(`/admin/users/${id}`, payload);
      }
      return axiosInstance.post("/admin/users", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["users"]);
      if (variables.isEditing) {
        toast.success("User updated successfully!");
      } else if (variables.payload.role ==="ROLE_RESIDENT") {
        toast.success("Resident created! Check'Approve Requests' to allocate a flat.");
      } else {
        toast.success("User created successfully!");
      }
      resetForm();
      if (selectedUser && selectedUser.id === editUserId) setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ||"Operation failed");
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setDeactivateConfirmId(null);
      toast.success("User deactivated successfully!");
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async ({ userId, flatId, type }) => {
      if (type ==="approve") {
        return axiosInstance.put(`/admin/users/${userId}/approve`, null, { params: { flatId } });
      } else if (type ==="allocate") {
        return axiosInstance.put(`/admin/users/${userId}/allocate/${flatId}`);
      } else {
        return axiosInstance.put(`/admin/users/${userId}/reactivate`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setReactivateUserId(null);
      setFlatIdToAllocate("");
      setActiveTab("all");
      toast.success("User reactivated/approved successfully!");
    },
    onError: (error) => {
      setFlatIdError(error.response?.data?.message ||"Failed to approve/allocate.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.info("User request rejected.");
    },
    onError: () => {
      toast.error("Failed to reject user.");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    if (!userData.username.trim()) newErrors.username ="Username is required";
    if (!userData.email.trim()) {
      newErrors.email ="Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email ="Please enter a valid email";
    }
    if (!isEditing) {
      if (!userData.password) {
        newErrors.password ="Password is required";
      } else if (userData.password.length < 6) {
        newErrors.password ="Password must be at least 6 characters";
      }
    }
    if (!isEditing && userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword ="Passwords do not match";
    }
    if (!userData.phoneNumber.trim()) newErrors.phoneNumber ="Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setUserData({
      username:"",
      email:"",
      password:"",
      confirmPassword:"",
      role:"ROLE_SECURITY",
      phoneNumber:"",
      apartmentId:""
    });
    setErrors({});
    setIsEditing(false);
    setEditUserId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { 
      ...userData, 
      contactNumber: userData.phoneNumber,
      apartmentId: userData.apartmentId || null 
    };
    delete payload.confirmPassword;
    delete payload.phoneNumber;

    if (isEditing) delete payload.password;

    userMutation.mutate({ isEditing, id: editUserId, payload });
  };

  const handleDeactivate = (userId) => {
    setDeactivateConfirmId(userId);
  };

  const confirmDeactivate = (userId) => {
    deactivateMutation.mutate(userId);
  };

  const cancelDeactivate = () => {
    setDeactivateConfirmId(null);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setDeactivateConfirmId(null);
    setReactivateUserId(null);
  };

  const reactivateNonResident = (user) => {
    reactivateMutation.mutate({ userId: user.id, type:"reactivate" });
  };

  const submitReactivate = (user) => {
    if (!flatIdToAllocate) {
      setFlatIdError("Please select a Flat.");
      return;
    }
    setFlatIdError("");
    const type = user.status ==="PENDING" ?"approve" :"allocate";
    reactivateMutation.mutate({ userId: user.id, flatId: flatIdToAllocate, type });
  };

  const handleReject = (userId) => {
    rejectMutation.mutate(userId);
  };

  const handleEdit = (user) => {
    setUserData({
      username: user.username ||"",
      email: user.email ||"",
      password:"",
      confirmPassword:"",
      role: user.role || (user.roles && user.roles[0]?.name) ||"ROLE_SECURITY",
      phoneNumber: user.contactNumber ||"",
      apartmentId: user.managedApartmentId ||""
    });
    setIsEditing(true);
    setEditUserId(user.id);
    setShowForm(true);

  };

  const getRole = (u) => u.role || (u.roles && u.roles[0]?.name);

  const allActiveUsers = users.filter(u => u.status !=="DEACTIVATED" && u.status !=="PENDING");
  const residentUsers = users.filter(u => getRole(u) ==="ROLE_RESIDENT" && u.status !=="DEACTIVATED" && u.status !=="PENDING");
  const pendingUsers = users.filter(u => u.status ==="PENDING");
  const deactivatedUsers = users.filter(u => u.status ==="DEACTIVATED");

  const matchSearch = (u) => {
    const q = searchQuery.toLowerCase();
    const matchName = (u.username && u.username.toLowerCase().includes(q));

    if (activeTab ==="residents") {
      return matchName || (u.flatNumber && u.flatNumber.toString().includes(q));
    }
    return matchName;
  };

  const processedUsers = (
    activeTab ==="all" ? allActiveUsers :
      activeTab ==="residents" ? residentUsers :
        activeTab ==="requests" ? pendingUsers :
          deactivatedUsers
  );

  const flatGroups = new Map();
  const displayedUsersMap = new Map();

  processedUsers.forEach(u => {
    const r = getRole(u);
    if ((r ==="ROLE_RESIDENT" || r ==="ROLE_TENANT") && u.flatNumber) {
        const key = `${u.flatNumber}-${u.managedApartmentName || u.apartmentName || u.managedApartmentId || u.apartmentId}`;
        if (!flatGroups.has(key)) {
            flatGroups.set(key, u);
            displayedUsersMap.set(u.id, u);
        } else {
            const currentHead = flatGroups.get(key);
            if (u.id < currentHead.id) {
                displayedUsersMap.delete(currentHead.id);
                flatGroups.set(key, u);
                displayedUsersMap.set(u.id, u);
            }
        }
    } else {
        displayedUsersMap.set(u.id, u);
    }
  });

  const displayedUsers = Array.from(displayedUsersMap.values()).filter(u => matchSearch(u));

  return (
    <div className="fade-in-up space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <button 
          className="px-8 py-3.5 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center gap-2 active:scale-95" 
          onClick={() => { if (!showForm) { resetForm(); } setShowForm(!showForm); }}
>
          {showForm ? '✕ Close Form' : (isEditing ? <><IoPencilOutline className="inline mr-1" /> Edit Profile</> : <><IoAddOutline className="inline mr-1" /> Enroll User</>)}
        </button>
      </div>

      {/* Enrollment Form */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <div className="p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-inner"><IoPersonOutline size={24} /></div>
              <div className="">
                <h4 className="text-xl font-black text-slate-800">{isEditing ?'Modify Account' :'Register New User'}</h4>
                <p className="text-sm text-slate-500 font-medium">{isEditing ?'Update access levels and contact info' :'Add a new member to the society ecosystem'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  className={`w-full px-5 py-4 rounded-2xl border ${errors.username ?'border-rose-400 bg-rose-50' :'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                  placeholder="Enter username"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                />
                {errors.username && <p className="text-[10px] font-black text-rose-500">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  className={`w-full px-5 py-4 rounded-2xl border ${errors.email ?'border-rose-400 bg-rose-50' :'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                  placeholder="name@example.com"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
                {errors.email && <p className="text-[10px] font-black text-rose-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  className={`w-full px-5 py-4 rounded-2xl border ${errors.phoneNumber ?'border-rose-400 bg-rose-50' :'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                  placeholder="+91 XXXXX XXXXX"
                  value={userData.phoneNumber}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                />
                {errors.phoneNumber && <p className="text-[10px] font-black text-rose-500">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Role <span className="text-rose-500">*</span></label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
>
                  {currentUserRole ==="ROLE_SUPER_ADMIN" && (
                    <option value="ROLE_SUPER_ADMIN"><IoStarOutline className="inline mr-2" /> Master Admin</option>
                  )}
                  <option value="ROLE_ADMIN"><IoKeyOutline className="inline mr-2" /> Society Admin</option>
                  <option value="ROLE_SECURITY"><IoShieldCheckmarkOutline className="inline mr-2" /> Staff Member</option>
                  <option value="ROLE_RESIDENT"><IoHomeOutline className="inline mr-2" /> Resident</option>
                </select>
              </div>

              {(userData.role ==="ROLE_ADMIN" || userData.role ==="ROLE_SECURITY") && apartments.length> 0 && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Apartment <span className="text-rose-500">*</span></label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                    value={userData.apartmentId}
                    onChange={(e) => setUserData({ ...userData, apartmentId: e.target.value })}
                    required
>
                    <option value="">Select an apartment complex...</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!isEditing && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password <span className="text-rose-500">*</span></label>
                    <input
                      type="password"
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.password ?'border-rose-400 bg-rose-50' :'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                      placeholder="Minimum 6 characters"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    />
                    {errors.password && <p className="text-[10px] font-black text-rose-500">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification <span className="text-rose-500">*</span></label>
                    <input
                      type="password"
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.confirmPassword ?'border-rose-400 bg-rose-50' :'border-slate-200 bg-slate-50'} focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                      placeholder="Repeat password"
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                    />
                    {errors.confirmPassword && <p className="text-[10px] font-black text-rose-500">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end gap-4 border-t border-slate-50 pt-8">
                <button 
                  type="button" 
                  className="px-8 py-3.5 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all" 
                  onClick={() => { resetForm(); setShowForm(false); }}
>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3.5 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95" 
                  disabled={userMutation.isPending}
>
                  {userMutation.isPending ?'Processing...' : (isEditing ?'Update Profile' :'Enroll Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Control Strip */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto">
          <button className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab ==='all' ?'bg-white text-indigo-600 shadow-sm' :'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab("all")}>All ({allActiveUsers.length})</button>
          <button className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab ==='residents' ?'bg-white text-indigo-600 shadow-sm' :'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab("residents")}>Residents ({residentUsers.length})</button>
          <button className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab ==='requests' ?'bg-white text-amber-600 shadow-sm' :'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab("requests")}>Requests ({pendingUsers.length})</button>
          <button className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab ==='deactivated' ?'bg-white text-rose-600 shadow-sm' :'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab("deactivated")}>Hidden ({deactivatedUsers.length})</button>
        </div>

        <div className="relative w-full md:w-96">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IoSearchOutline size={18} /></span>
          <input
            type="text"
            placeholder={activeTab ==="residents" ?"Filter by name or flat..." :"Quick search members..."}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700  text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: User Directory Scroll */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-bottom border-slate-50 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Member Directory</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {displayedUsers.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4"><IoPersonOutline size={48} className="mx-auto" /></div>
                <p className="text-slate-400 font-bold">No members match your criteria</p>
              </div>
            ) : (
              displayedUsers.map((user) => {
                const isDeactivated = user.status ==="DEACTIVATED" || user.status ==="PENDING";
                const userRole = getRole(user);
                const isSelected = selectedUser && selectedUser.id === user.id;

                const roleStyles = {
                  ROLE_ADMIN:'bg-purple-100 text-purple-600 border-purple-200',
                  ROLE_SECURITY:'bg-blue-100 text-blue-600 border-blue-200',
                  ROLE_RESIDENT:'bg-emerald-100 text-emerald-600 border-emerald-200',
                  ROLE_SUPER_ADMIN:'bg-indigo-100 text-indigo-600 border-indigo-200'
                };

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 border  ${
                      isSelected 
                      ?'bg-indigo-50 border-indigo-100 shadow-sm' 
                      :'border-transparent hover:bg-slate-50'
                    }`}
>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-lg font-black text-slate-400 overflow-hidden shadow-inner">
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      {!isDeactivated && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{user.username}</h4>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border  ${roleStyles[userRole] ||'bg-slate-100 text-slate-600'}`}>
                      {userRole.replace('ROLE_','')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Member Profile */}
        <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-md overflow-hidden min-h-[700px] flex flex-col">
          {selectedUser ? (() => {
            const u = displayedUsers.find(du => du.id === selectedUser.id) || selectedUser;
            const isDeactivated = u.status ==="DEACTIVATED" || u.status ==="PENDING";
            const userRole = getRole(u);

            const sameFlatUsers = (userRole ==="ROLE_RESIDENT" && u.flatNumber)
              ? users.filter(x =>
                  x.id !== u.id &&
                  x.flatNumber === u.flatNumber &&
                  (x.managedApartmentName === u.managedApartmentName || x.apartmentName === u.apartmentName) &&
                  (x.status !=="DEACTIVATED" && x.status !=="PENDING")
                )
              : [];

            return (
              <div className="flex-1 animate-in fade-in duration-500">
                {/* Profile Banner */}
                <div className="h-32 bg-slate-900 relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'24px 24px' }}></div>
                  <div className="absolute -bottom-12 left-10 p-1.5 bg-white rounded-[2.5rem]">
                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl  overflow-hidden">
                      {u.profilePictureUrl ? (
                         <img src={u.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : u.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mt-16 px-10 pb-10">
                  <div className="flex justify-between items-start">
                    <div className="">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{u.username}</h2>
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]  ${
                          isDeactivated ?'bg-rose-100 text-rose-600' :'bg-emerald-100 text-emerald-600'
                        }`}>
                          {u.status ||"ACTIVE"}
                        </span>
                      </div>
                      <p className="text-slate-400 font-bold mt-1">Reference ID: <span className="text-indigo-500">#{u.id}</span></p>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all" onClick={() => handleEdit(u)}>Edit Profile</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Role</p>
                        <p className="text-sm font-black text-slate-700">{userRole.replace('ROLE_','')}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-sm font-black text-slate-700">{u.email}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-black text-slate-700">{u.contactNumber ||"UNLISTED"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apartment Details</p>
                        <p className="text-sm font-black text-slate-700">{u.managedApartmentName || u.apartmentName ||"EXTERNAL"}</p>
                     </div>
                     {u.flatNumber && (
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flat Details</p>
                           <p className="text-sm font-black text-slate-700">FLAT {u.flatNumber} {u.blockName ? `(${u.blockName})` :''}</p>
                        </div>
                     )}
                     <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aadhar Verified</p>
                           {u.aadharUrl ? (
                              <a href={getDocUrl(u.aadharUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 flex items-center gap-2">
                                 <IoDocumentTextOutline className="inline mr-1" /> VIEW DOCUMENT <span className="text-[10px]">→</span>
                              </a>
                           ) : <span className="text-xs font-bold text-slate-300">NOT PROVIDED</span>}
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAN Verified</p>
                           {u.panCardUrl ? (
                              <a href={getDocUrl(u.panCardUrl)} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 flex items-center gap-2">
                                 <IoDocumentTextOutline className="inline mr-1" /> VIEW DOCUMENT <span className="text-[10px]">→</span>
                              </a>
                           ) : <span className="text-xs font-bold text-slate-300">NOT PROVIDED</span>}
                        </div>
                     </div>
                  </div>

                  {/* Dependent/Tenant Records */}
                  {sameFlatUsers.length> 0 && (
                    <div className="mt-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Co-Residents / Tenants</h4>
                        <div className="h-px bg-slate-100 flex-1"></div>
                      </div>
                      <div className="space-y-4">
                        {sameFlatUsers.map(tenantUser => (
                          <div key={tenantUser.id} className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex justify-between items-center">
                             <div className="">
                                <p className="text-sm font-black text-slate-800">{tenantUser.username}</p>
                                <p className="text-[10px] font-bold text-slate-400  font-mono uppercase tracking-tighter">TENANT • {tenantUser.email}</p>
                             </div>
                             <div className="">
                                {deactivateConfirmId === tenantUser.id ? (
                                  <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase" onClick={() => confirmDeactivate(tenantUser.id)}>Confirm</button>
                                    <button className="text-slate-400 font-bold text-[10px] uppercase" onClick={cancelDeactivate}>Cancel</button>
                                  </div>
                                ) : (
                                  <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline" onClick={() => handleDeactivate(tenantUser.id)}>Deactivate</button>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Protection Actions */}
                  <div className="mt-auto pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Account Management</h4>
                    
                    {!isDeactivated ? (
                      <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                        {deactivateConfirmId === u.id ? (
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="">
                               <p className="text-rose-800 font-black text-sm">UNRECOVERABLE ACTION WARNING</p>
                               <p className="text-rose-600 text-xs font-bold">Are you sure you want to deactivate this primary account?</p>
                            </div>
                            <div className="flex gap-3">
                              <button className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-rose-200" onClick={() => confirmDeactivate(u.id)} disabled={deactivateMutation.isPending}>
                                {deactivateMutation.isPending ?"PROTECTING..." :"CONFIRM DEACTIVATION"}
                              </button>
                              <button className="px-8 py-3 bg-white text-slate-600 rounded-xl font-black text-xs uppercase" onClick={cancelDeactivate}>ABORT</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                             <div className="">
                                <p className="text-rose-800 font-black text-sm">Deactivate Account</p>
                                <p className="text-rose-600 text-[10px] font-bold">Suspends all building access and system permissions immediately.</p>
                             </div>
                             <button className="px-6 py-2.5 bg-rose-100 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                        {reactivateUserId === u.id ? (
                          <div className="space-y-6">
                            <div className="">
                               <p className="text-indigo-800 font-black text-sm">RESTORING ACCESS PRIVILEGES</p>
                               <p className="text-indigo-500 text-xs font-bold">Please verify domain allocation before confirming.</p>
                            </div>

                            {userRole ==="ROLE_RESIDENT" && (
                              <div className="max-w-md">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">Flat Allocation Required</label>
                                <select
                                  className="w-full px-5 py-4 rounded-2xl border border-indigo-100 bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
                                  value={flatIdToAllocate}
                                  onChange={(e) => setFlatIdToAllocate(e.target.value)}
>
                                  <option value="">Select available capacity...</option>
                                  {availableFlats.map(flat => (
                                    <option key={flat.id} value={flat.id}>Flat {flat.flatNumber} ({flat.blockName})</option>
                                  ))}
                                </select>
                                {flatIdError && <p className="text-[10px] font-black text-rose-500 mt-2">{flatIdError}</p>}
                              </div>
                            )}

                            <div className="flex gap-4">
                              <button className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-600/20" onClick={() => submitReactivate(u)}>
                                {u.status ==="PENDING" ? <><IoCheckmarkOutline className="inline mr-1" /> APPROVE ENTRY</> : <><IoRefreshOutline className="inline mr-1" /> RESTORE ACCESS</>}
                              </button>
                              <button className="px-10 py-3.5 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase" onClick={() => { setReactivateUserId(null); setFlatIdToAllocate(""); setFlatIdError(""); }}>Discard</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                             <div className="">
                                <p className="text-indigo-800 font-black text-sm">Restore Account Access</p>
                                <p className="text-indigo-600 text-[10px] font-bold  font-mono uppercase">Awaiting reactivation sequence initiation.</p>
                             </div>
                             <div className="flex gap-4">
                              {u.status ==="PENDING" ? (
                                <>
                                  <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200" onClick={() => setReactivateUserId(u.id)}>Approve Request</button>
                                  <button className="px-8 py-3 bg-white text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-100" onClick={() => handleReject(u.id)} disabled={rejectMutation.isPending}>
                                    {rejectMutation.isPending ?"Declining..." :"Reject"}
                                  </button>
                                </>
                              ) : (
                                <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200" onClick={() => (userRole ==="ROLE_RESIDENT" ? setReactivateUserId(u.id) : reactivateNonResident(u))}>
                                   Reactivate Access
                                </button>
                              )}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner"><IoPersonOutline size={24} /></div>
              <h3 className="text-2xl font-black text-slate-800 mb-2  uppercase tracking-tight">Select a Member</h3>
              <p className="text-slate-400 font-medium max-w-sm">Select a member from the directory to analyze their detailed profile, permissions, and residency status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
