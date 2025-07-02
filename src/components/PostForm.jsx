import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function PostForm({ user }) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [postedBy, setPostedBy] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const { username, tag } = userDoc.data();
          setPostedBy(`${username}#${tag}`);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        link: link.trim() || null,
        authorId: user.uid,
        postedBy,
        createdAt: serverTimestamp(),
        score: 0,
        upvotes: 0,
        downvotes: 0,
        commentsCount: 0,
      });
      setTitle('');
      setLink('');
    } catch (error) {
      alert('Error posting: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Create a Post</h3>
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
      />
      <input
        type="url"
        placeholder="Optional link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem' }} disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}