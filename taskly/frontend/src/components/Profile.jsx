import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from "./Profile.module.css";

// const API_BASE = "http://localhost/taskly/taskly/backend/";
const API_BASE = process.env.REACT_APP_API_URL;

export default function Profile({ user: currentUser, onUserUpdate }) {
  const [user, setUser] = useState({ id: "", name: "", email: "", profilePic: "" });
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success"); // "success" | "error"

  useEffect(() => {
    console.log('Profile component received user:', currentUser);
    if (currentUser?.id) {
      // Fetch user profile from backend
      fetch(`${API_BASE}get_profile.php?id=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Profile API response:', data);
          if (data.success) {
            setUser({
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
              profilePic: data.data.profile_pic || ""
            });
          } else {
            // Fallback to current user data
            console.log('Using fallback user data');
            setUser({
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              profilePic: ""
            });
          }
        })
        .catch((error) => {
          // Fallback to current user data on error
          console.log('Profile API error, using fallback:', error);
          setUser({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            profilePic: ""
          });
        });
    } else {
      console.log('No current user provided to Profile');
    }
  }, [currentUser]);

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
        // Notify parent component of user update
        if (onUserUpdate) {
          onUserUpdate(updated);
        }

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
        {user.profilePic && user.profilePic !== 'null' ? (
          <img src={`${user.profilePic}?t=${Date.now()}`} alt="Profile" className={styles.profilePic} />
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

