import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageMoveInOut() {
    const [allotments, setAllotments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ACTIVE"); // "ACTIVE", "VACATED"
    const [ownershipFilter, setOwnershipFilter] = useState("ALL");


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allotRes = await axiosInstance.get("/allotments/history");
            setAllotments(allotRes.data.data || []);
        } catch (error) {
            console.error("Error fetching movement history:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleMoveOut = async (allotmentId) => {
        const result = await Swal.fire({
            title: "Resident Moving Out?",
            text: "This will make the flat available for new residents.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f39c12",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Move Out!"
        });
        if (!result.isConfirmed) return;

        try {
            await axiosInstance.put(`/allotments/${allotmentId}/vacate`);
            toast.success("Resident moved out successfully!");
            fetchData();
        } catch (error) {
            toast.error("Failed to record move out");
        }
    };

    const filteredAllotments = allotments.filter(item => {
        const matchesSearch =
            item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.blockName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = item.status === statusFilter;
        const matchesOwnership = ownershipFilter === "ALL" || item.ownershipStatus === ownershipFilter;

        return matchesSearch && matchesStatus && matchesOwnership;
    });

    // Group allotments by flat to handle resident-tenant duplicates
    const map = new Map();

    filteredAllotments.forEach(item => {
        // Group by flat if they have a flatNumber. Otherwise fallback to ID.
        const key = item.flatNumber ? `${item.apartmentName}-${item.blockName}-${item.flatNumber}` : `id-${item.id}`;
        
        if (!map.has(key)) {
            map.set(key, { ...item, _tenantRecords: [] });
        } else {
            const existing = map.get(key);
            
            // Try to determine which is tenant.
            const isItemTenant = item.ownershipStatus === 'TENANT' || item.role === 'ROLE_TENANT';
            const isExistingTenant = existing.ownershipStatus === 'TENANT' || existing.role === 'ROLE_TENANT';

            if (isItemTenant) {
                existing._tenantRecords.push(item);
            } else if (isExistingTenant) {
                const tenantCopy = { ...existing };
                delete tenantCopy._tenantRecords;
                const newMain = { ...item, _tenantRecords: [tenantCopy, ...(existing._tenantRecords || [])] };
                map.set(key, newMain);
            } else {
                // If neither explicitly says Tenant, but it's a duplicate for the same flat in same status.
                // We force the second one to be displayed as TENANT per user request.
                const tenantItem = { ...item, originalOwnershipStatus: item.ownershipStatus, ownershipStatus: 'TENANT' }; 
                existing._tenantRecords.push(tenantItem);
            }
        }
    });

    const finalAllotments = Array.from(map.values());

    if (loading) {
        return <div className="admin-card">Loading movement records...</div>;
    }

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
            </div>




            <div className="admin-card mt-0">
                <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="filter-group">
                            <label className="filter-label">Status:</label>
                            <select
                                className="inline-form-select"
                                style={{ width: '160px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ACTIVE">Currently In (Active)</option>
                                <option value="VACATED">Moved Out (Vacated)</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Type:</label>
                            <select
                                className="inline-form-select"
                                style={{ width: '150px' }}
                                value={ownershipFilter}
                                onChange={(e) => setOwnershipFilter(e.target.value)}
                            >
                                <option value="ALL">All Ownership</option>
                                <option value="OWNER">Owner</option>
                                <option value="TENANT">Tenant</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
                        <input
                            type="text"
                            placeholder="Search name, flat, or phone..."
                            className="inline-form-input"
                            style={{ maxWidth: '300px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <h3 className="section-title">{statusFilter === 'ACTIVE' ? 'Showing Active Residents' : 'Showing Vacated History'}</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Apartment</th>
                                <th>Flat</th>
                                <th>Ownership</th>
                                <th>Move In</th>
                                {statusFilter === 'VACATED' && <th>Move Out</th>}
                                {statusFilter === 'ACTIVE' && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {finalAllotments.length === 0 ? (
                                <tr><td colSpan={statusFilter === 'VACATED' ? "7" : "8"} className="text-center">No {statusFilter.toLowerCase()} records found</td></tr>
                            ) : (
                                finalAllotments.map(record => (
                                    <tr key={record.id}>
                                        <td>
                                            <strong>{record.username}</strong>
                                            {record._tenantRecords && record._tenantRecords.map(t => (
                                                <div key={`name-${t.id}`} style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                                                    <strong>{t.username}</strong>
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <div>{record.phone || "N/A"}</div>
                                            {record._tenantRecords && record._tenantRecords.map(t => (
                                                <div key={`phone-${t.id}`} style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                                                    {t.phone || "N/A"}
                                                </div>
                                            ))}
                                        </td>
                                        <td>{record.apartmentName || "N/A"}</td>
                                        <td>Flat {record.flatNumber} ({record.blockName})</td>
                                        <td>
                                            <div>
                                                {record.ownershipStatus === "OWNER" 
                                                    ? "OWNER" 
                                                    : "RESIDENT"}
                                            </div>
                                            {record._tenantRecords && record._tenantRecords.map(t => (
                                                <div key={`own-${t.id}`} style={{ marginTop: '8px', fontSize: '0.9em' }}>
                                                    <span className="badge badge-info" style={{ padding: '2px 6px', fontSize: '10px' }}>TENANT</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <div>{record.startDate}</div>
                                            {record._tenantRecords && record._tenantRecords.map(t => (
                                                <div key={`start-${t.id}`} style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                                                    {t.startDate}
                                                </div>
                                            ))}
                                        </td>
                                        {statusFilter === 'VACATED' && (
                                            <td>
                                                <div>{record.endDate}</div>
                                                {record._tenantRecords && record._tenantRecords.map(t => (
                                                    <div key={`end-${t.id}`} style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                                                        {t.endDate}
                                                    </div>
                                                ))}
                                            </td>
                                        )}
                                        {statusFilter === 'ACTIVE' && (
                                            <td>
                                                <div>
                                                    <button
                                                        className="btn btn-warning btn-sm"
                                                        onClick={() => handleMoveOut(record.id)}
                                                    >
                                                        Move Out
                                                    </button>
                                                </div>
                                                {record._tenantRecords && record._tenantRecords.map(t => (
                                                    <div key={`out-${t.id}`} style={{ marginTop: '4px' }}>
                                                        <button
                                                            className="btn btn-outline-warning btn-sm"
                                                            style={{ padding: '2px 8px', fontSize: '11px' }}
                                                            onClick={() => handleMoveOut(t.id)}
                                                        >
                                                            Move Out Tenant
                                                        </button>
                                                    </div>
                                                ))}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
