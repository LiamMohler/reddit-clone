import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Memoize styles outside the component to avoid re-creating on every render
const activeUpvoteStyle = {
  color: 'white',
  backgroundColor: '#27ae60',
  border: '2px solid #14532d',
  borderRadius: 6,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.3rem 0.7rem',
  marginRight: 8,
  boxShadow: '0 0 5px #14532d',
  transition: 'all 0.3s ease',
};

const activeDownvoteStyle = {
  color: 'white',
  backgroundColor: '#c0392b',
  border: '2px solid #7f1d1d',
  borderRadius: 6,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.3rem 0.7rem',
  marginRight: 8,
  boxShadow: '0 0 5px #7f1d1d',
  transition: 'all 0.3s ease',
};

const inactiveStyle = {
  color: 'black',
  backgroundColor: 'transparent',
  border: '2px solid transparent',
  borderRadius: 6,
  fontWeight: 'normal',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.3rem 0.7rem',
  marginRight: 8,
  transition: 'all 0.3s ease',
};

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('score', 'desc'),
      orderBy('upvotes', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (postId, value) => {
    if (!user) return alert('Login required to vote');

    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(db, 'posts', postId, 'votes', user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        const voteDoc = await transaction.get(voteRef);

        if (!postDoc.exists()) throw new Error('Post does not exist!');

        const prevVote = voteDoc.exists() ? voteDoc.data().value : 0;
        const scoreChange = value - prevVote;

        const upvoteChange = (value === 1 ? 1 : 0) - (prevVote === 1 ? 1 : 0);
        const downvoteChange =
          (value === -1 ? 1 : 0) - (prevVote === -1 ? 1 : 0);

        if (prevVote === value) {
          // Toggle off
          transaction.delete(voteRef);
          transaction.update(postRef, {
            score: increment(-value),
            upvotes: increment(value === 1 ? -1 : 0),
            downvotes: increment(value === -1 ? -1 : 0),
          });
        } else {
          // New vote or change vote
          transaction.set(voteRef, { value });
          transaction.update(postRef, {
            score: increment(scoreChange),
            upvotes: increment(upvoteChange),
            downvotes: increment(downvoteChange),
          });
        }
      });
    } catch (e) {
      console.error('Transaction failed: ', e);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) throw new Error('Post does not exist!');
        if (postDoc.data().authorId !== user.uid) throw new Error('Unauthorized');

        transaction.delete(postRef);
      });
    } catch (e) {
      alert('Failed to delete post: ' + e.message);
      console.error(e);
    }
  };

  return (
    <div>
      <h3>Recent Posts</h3>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          onVote={handleVote}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

function PostCard({ post, user, onVote, onDelete }) {
  const [userVote, setUserVote] = useState(0);
  const [hoverTrash, setHoverTrash] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserVote(0);
      return;
    }
    const userVoteRef = doc(db, 'posts', post.id, 'votes', user.uid);

    const unsubscribe = onSnapshot(userVoteRef, (docSnap) => {
      setUserVote(docSnap.exists() ? docSnap.data().value : 0);
    });

    return () => unsubscribe();
  }, [post.id, user]);

  const trashButtonStyle = useMemo(() => ({
    background: 'none',
    border: 'none',
    color: hoverTrash ? '#e74c3c' : '#c0392b',
    cursor: 'pointer',
    fontSize: '1.4rem',
    marginLeft: '1rem',
    transition: 'color 0.3s ease, transform 0.3s ease',
    transform: hoverTrash ? 'scale(1.2)' : 'scale(1)',
  }), [hoverTrash]);

  return (
    <div
      style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem 0', position: 'relative' }}
    >
      <h4 style={{ display: 'inline-block' }}>{post.title}</h4>
      {user && user.uid === post.authorId && (
        <button
          onClick={() => onDelete(post.id)}
          style={trashButtonStyle}
          title="Delete Post"
          aria-label="Delete Post"
          onMouseEnter={() => setHoverTrash(true)}
          onMouseLeave={() => setHoverTrash(false)}
        >
          🗑️
        </button>
      )}
      {post.link && (
        <p>
          🔗 <a href={post.link} target="_blank" rel="noopener noreferrer">{post.link}</a>
        </p>
      )}
      <p>Posted by: {post.postedBy}</p>
      <p>Score: {post.score ?? 0}</p>
      <p>Upvotes: {post.upvotes ?? 0}</p>
      <p>Downvotes: {post.downvotes ?? 0}</p>
      <button
        onClick={() => onVote(post.id, 1)}
        style={userVote === 1 ? activeUpvoteStyle : inactiveStyle}
        aria-label="Upvote"
      >
        👍
      </button>
      <button
        onClick={() => onVote(post.id, -1)}
        style={userVote === -1 ? activeDownvoteStyle : inactiveStyle}
        aria-label="Downvote"
      >
        👎
      </button>
    </div>
  );
}
