import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function PostForm({ user }) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        title,
        link: link.trim() || null,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        score: 0,
        upvotes:0 ,
        downvotes: 0,
        commentsCount: 0,
      });
      setTitle('');
      setLink('');
    } catch (error) {
      alert('Error posting: ' + error.message);
    }
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
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Post
      </button>
    </form>
  );
}
