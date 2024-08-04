import React, { useEffect } from 'react';
import { useState } from 'react';
import { signInWithGoogle, logOut, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Auth({ setUser }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {!auth.currentUser ? (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      ) : (
        <div>
          <p>Welcome, {auth.currentUser.displayName}</p>
          <button onClick={logOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}
