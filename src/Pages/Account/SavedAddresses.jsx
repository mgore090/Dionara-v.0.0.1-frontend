import React, { useEffect, useState } from "react";
import AccountLayout from "./AccountLayout";
import { apiRequest, getLoggedInUser } from "./accountCommon";

const emptyForm = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India", postalCode: "", addressType: "HOME", defaultAddress: false };

export default function SavedAddresses() {
  const user = getLoggedInUser();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    if (!user?.id) { setError("Please login again to manage addresses."); setLoading(false); return; }
    try { const data = await apiRequest(`/users/${user.id}/addresses`); setAddresses(Array.isArray(data) ? data : data?.data || []); }
    catch (err) { setError(err.message || "Unable to load addresses."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadAddresses(); }, []);

  function startAdd() { setEditingId(null); setForm({ ...emptyForm, fullName: user?.fullName || "", phone: user?.phone || "" }); setError(""); setMessage(""); setShowForm(true); }
  function startEdit(address) { setEditingId(address.id); setForm({ ...emptyForm, ...address, defaultAddress: Boolean(address.defaultAddress) }); setError(""); setMessage(""); setShowForm(true); }
  function change(e) { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); }

  async function save(e) {
    e.preventDefault(); setError(""); setMessage("");
    if (!user?.id) return setError("Customer ID missing. Login again.");
    setSaving(true);
    try {
      const path = `/users/${user.id}/addresses${editingId ? `/${editingId}` : ""}`;
      await apiRequest(path, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      setShowForm(false); setEditingId(null); setMessage(editingId ? "Address updated." : "Address saved."); await loadAddresses();
    } catch (err) { setError(err.message || "Unable to save address."); }
    finally { setSaving(false); }
  }

  async function setDefault(id) {
    setError(""); setMessage("");
    try { await apiRequest(`/users/${user.id}/addresses/${id}/default`, { method: "PATCH" }); setMessage("Default address updated."); await loadAddresses(); }
    catch (err) { setError(err.message || "Could not set default address."); }
  }

  async function removeAddress(id) {
    if (!window.confirm("Delete this saved address?")) return;
    setError(""); setMessage("");
    try { await apiRequest(`/users/${user.id}/addresses/${id}`, { method: "DELETE" }); setMessage("Address deleted."); await loadAddresses(); }
    catch (err) { setError(err.message || "Could not delete address."); }
  }

  return <AccountLayout title="Saved Addresses" subtitle="Manage your delivery locations">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><div><h2 className="d-panel-title">Address Book</h2><p className="d-panel-subtitle">Use saved addresses for faster checkout.</p></div><button className="d-account-primary" type="button" onClick={startAdd}>+ Add Address</button></div>
    {message && <div className="d-account-alert">{message}</div>}{error && <div className="d-account-alert error">{error}</div>}
    {showForm && <form onSubmit={save} style={{border:"1px solid #e9e1d9",padding:18,marginBottom:22}}>
      <h3 style={{font:"normal 21px Georgia,serif",margin:"0 0 18px"}}>{editingId ? "Edit Address" : "Add New Address"}</h3>
      <div className="d-form-grid">
        <div className="d-form-field"><label>Full Name *</label><input name="fullName" value={form.fullName} onChange={change} required maxLength={100}/></div>
        <div className="d-form-field"><label>Mobile Number *</label><input name="phone" value={form.phone} onChange={change} required maxLength={20}/></div>
        <div className="d-form-field full"><label>House / Building Name *</label><input name="addressLine1" value={form.addressLine1} onChange={change} required maxLength={255}/></div>
        <div className="d-form-field full"><label>Road / Area / Colony</label><input name="addressLine2" value={form.addressLine2 || ""} onChange={change} maxLength={255}/></div>
        <div className="d-form-field"><label>City *</label><input name="city" value={form.city} onChange={change} required maxLength={100}/></div>
        <div className="d-form-field"><label>State *</label><input name="state" value={form.state} onChange={change} required maxLength={100}/></div>
        <div className="d-form-field"><label>Country *</label><input name="country" value={form.country} onChange={change} required maxLength={100}/></div>
        <div className="d-form-field"><label>Pincode *</label><input name="postalCode" value={form.postalCode} onChange={change} required maxLength={10}/></div>
        <div className="d-form-field"><label>Address Type *</label><select name="addressType" value={form.addressType} onChange={change}><option value="HOME">Home</option><option value="WORK">Work</option><option value="OTHER">Other</option></select></div>
        <div className="d-form-field full"><label style={{display:"flex",alignItems:"center",gap:8,fontWeight:400}}><input type="checkbox" name="defaultAddress" checked={form.defaultAddress} onChange={change} style={{width:"auto"}}/> Set as default address</label></div>
      </div>
      <div className="d-form-actions"><button className="d-account-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Address"}</button><button className="d-account-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
    </form>}
    {loading ? <div className="d-loading">Loading saved addresses...</div> : addresses.length === 0 ? <div className="d-loading">No saved addresses yet. Add your first address.</div> : <div className="d-address-list">{addresses.map((address) => <article className="d-address-card" key={address.id}>
      <div className="d-address-card-top"><div><h3>{address.fullName || user?.fullName || "Customer"} <span className="d-address-badge">{address.addressType || "HOME"}</span></h3><p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br/>{address.city}, {address.state} {address.postalCode}<br/>{address.country}<br/>Mobile: {address.phone}</p></div>{address.defaultAddress && <span className="d-address-badge">Default</span>}</div>
      <div className="d-address-actions"><button className="d-account-secondary" type="button" onClick={() => startEdit(address)}>Edit</button>{!address.defaultAddress && <button className="d-account-secondary" type="button" onClick={() => setDefault(address.id)}>Set Default</button>}<button className="d-account-danger" type="button" onClick={() => removeAddress(address.id)}>Delete</button></div>
    </article>)}</div>}
  </AccountLayout>;
}
