import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState('');
  const [tag, setTag] = useState('');
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
          setTag(userDoc.data().tag);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleEdit = () => {
    setNewUsername(username || '');
    setNewTag(tag || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!newUsername.trim() || !/^\d{4}$/.test(newTag)) {
      alert('Username required and tag must be 4 digits.');
      return;
    }
    setSaving(true);
    // Check uniqueness
    const q = query(
      collection(db, 'users'),
      where('username', '==', newUsername.trim()),
      where('tag', '==', newTag)
    );
    const snap = await getDocs(q);
    if (!snap.empty && snap.docs[0].id !== user.uid) {
      alert('That username#tag is already taken.');
      setSaving(false);
      return;
    }
    await setDoc(doc(db, 'users', user.uid), {
      username: newUsername.trim(),
      tag: newTag
    });

    // Update all posts by this user
    const postsQuery = query(collection(db, 'posts'), where('authorId', '==', user.uid));
    const postsSnap = await getDocs(postsQuery);
    const batch = writeBatch(db);
    postsSnap.forEach((docSnap) => {
      batch.update(docSnap.ref, { postedBy: `${newUsername.trim()}#${newTag}` });
    });
    await batch.commit();

    // Update all comments by this user (loop through all posts)
    const allPostsSnap = await getDocs(collection(db, 'posts'));
    for (const postDoc of allPostsSnap.docs) {
      const commentsQuery = query(
        collection(db, 'posts', postDoc.id, 'comments'),
        where('authorId', '==', user.uid)
      );
      const commentsSnap = await getDocs(commentsQuery);
      if (!commentsSnap.empty) {
        const commentBatch = writeBatch(db);
        commentsSnap.forEach((commentDoc) => {
          commentBatch.update(commentDoc.ref, { postedBy: `${newUsername.trim()}#${newTag}` });
        });
        await commentBatch.commit();
      }
    }

    setUsername(newUsername.trim());
    setTag(newTag);
    setEditing(false);
    setSaving(false);
  };

  if (!user) return null;

  return (
    <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: 8 }}>
      {editing ? (
        <div>
          <input
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="Username"
            style={{ width: 100 }}
            disabled={saving}
          />
          <span>#</span>
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            style={{ width: 40 }}
            disabled={saving}
          />
          <button onClick={handleSave} disabled={saving}>Save</button>
          <button onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
        </div>
      ) : (
        <div>
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>
            {username ? `${username}#${tag}` : 'Set username'}
          </span>
          <button onClick={handleEdit} style={{ marginRight: 8 }}>Edit</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}