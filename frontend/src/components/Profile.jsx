import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from "./Profile.module.css";

const API_BASE = "http://localhost/taskly/taskly/backend/";

export default function Profile() {
  const [user, setUser] = useState({ id: "", name: "", email: "", profilePic: "" });
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success"); // "success" | "error"

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const profilePic = localStorage.getItem("profilePic");
    if (id && name && email) {
      setUser({ id, name, email, profilePic: profilePic || "" });
    }
  }, []);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUser({ ...user, profilePic: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user.id) {
      setMsgType("error");
      setMsg("No user ID found.");
      return;
    }
    setLoading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("name", newName || user.name);
    if (newFile) formData.append("profilePic", newFile);

    try {
      const res = await fetch(`${API_BASE}update_profile.php`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        const updated = {
          ...user,
          name: newName || user.name,
          profilePic: data.profilePicUrl || user.profilePic,
        };
        setUser(updated);
        localStorage.setItem("userName", updated.name);
        if (updated.profilePic) localStorage.setItem("profilePic", updated.profilePic);

        setMsgType("success");
        setMsg("Profile updated successfully ✅");
        setEditing(false);
      } else {
        setMsgType("error");
        setMsg(data.message || "Update failed.");
      }
    } catch (err) {
      setMsgType("error");
      setMsg("Network error. Check server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.profilePicContainer}>
        {user.profilePic ? (
          <img src={user.profilePic} alt="Profile" className={styles.profilePic} />
        ) : (
          <div className={styles.profilePicPlaceholder}>👤</div>
        )}
        {editing && (
          <>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handlePicChange}
            />
            <label htmlFor="fileInput" className={styles.editIconOverlay}>
              <FontAwesomeIcon icon={faEdit} />
            </label>
          </>
        )}
      </div>

      {!editing ? (
        <div className={styles.profileInfo}>
          <p className={styles.name}>{user.name}</p>
          <p className={styles.email}>{user.email}</p>

          {/* Message above Edit button */}
          {msg && <p className={styles.infoMsg}>{msg}</p>}

          <button
            className={styles.editBtn}
            onClick={() => setEditing(true)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className={styles.editForm}>
          <input
            type="text"
            defaultValue={user.name}
            onChange={(e) => setNewName(e.target.value)}
            className={`${styles.inputField} form-control mb-2`}
          />
          <input
            type="email"
            value={user.email}
            disabled
            className={`${styles.inputField} form-control mb-2`}
          />

          {/* Message above Save/Cancel buttons */}
          {msg && <p className={styles.infoMsg}>{msg}</p>}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.editBtn} m-1`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className={`${styles.cancelButton} m-1`}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
