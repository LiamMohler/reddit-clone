import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomTag() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function getUniqueUsernameAndTag() {
  let username, tag, exists;
  do {
    username = randomString(6);
    tag = randomTag();
    const q = query(
      collection(db, 'users'),
      where('username', '==', username),
      where('tag', '==', tag)
    );
    const snap = await getDocs(q);
    exists = !snap.empty;
  } while (exists);
  return { username, tag };
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Generate unique random username and tag
      const { username, tag } = await getUniqueUsernameAndTag();
      await setDoc(doc(db, 'users', user.uid), {
        username,
        tag
      });
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')}>
          Sign in
        </button>
      </p>
    </div>
  );
}