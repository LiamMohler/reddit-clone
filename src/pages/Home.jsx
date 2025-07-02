import React from 'react';
import Navbar from '../components/Navbar';
import PostForm from '../components/PostForm';
import PostFeed from '../components/PostFeed';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to create or view posts.</p>;

  return (
    <div>
      <Navbar />
      <h2>Welcome to the Feed</h2>
      <PostForm user={user} />
      <PostFeed />
    </div>
  );
}
