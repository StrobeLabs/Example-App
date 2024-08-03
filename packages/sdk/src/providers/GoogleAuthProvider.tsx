'use client';
import { useEffect, useState, ReactNode } from 'react'
import {
  hasGrantedAllScopesGoogle,
  useGoogleLogin,
  googleLogout,
  UseGoogleLoginOptionsImplicitFlow,
} from '@react-oauth/google';

import { fetchProfile } from '../hooks/useGmailClient';
import GoogleAuthContext from '../contexts/GoogleAuth'

interface ProvidersProps {
  children: ReactNode;
}

const GoogleAuthProvider = ({ children }: ProvidersProps) => {
  const getGoogleAuthTokenKey = () => {
    return `googleAuthToken`;
  }

  const [googleAuthToken, setGoogleAuthToken] = useState<any | null>(null);
  const [isGoogleAuthed, setIsGoogleAuthed] = useState<boolean>(false);
  const [isScopesApproved, setIsScopesApproved] = useState<boolean>(false);
  const [loggedInGmail, setLoggedInGmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if localStorage is available (client-side)
    if (typeof window !== 'undefined') {
      const cachedToken = localStorage.getItem(getGoogleAuthTokenKey());
      if (cachedToken) {
        setGoogleAuthToken(JSON.parse(cachedToken));
      }
    }
  }, []);

  useEffect(() => {
    if (googleAuthToken) {
      const allScope = hasGrantedAllScopesGoogle(
        googleAuthToken,
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      );
      
      setIsScopesApproved(allScope);
    }
  }, [googleAuthToken]);

  useEffect(() => {
    if (googleAuthToken) {
      const fetchData = async () => {
        try {
          const email = await fetchProfile(googleAuthToken.access_token);

          if (email) {
            setLoggedInGmail(email);
            setIsGoogleAuthed(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('loggedInEmail', email);
            }
          }
        } catch (error) {
          console.error('Error in fetching profile data:', error);
        }
      };
    
      fetchData();
    }
  }, [googleAuthToken]);

  const googleLogIn = useGoogleLogin({
    onSuccess: tokenResponse => {
      setGoogleAuthToken(tokenResponse);
      setIsGoogleAuthed(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(getGoogleAuthTokenKey(), JSON.stringify(tokenResponse));
      }
    },
    onError: error => {
      console.error('Error logging in:', error);
    },
    scope: 'email profile https://www.googleapis.com/auth/gmail.readonly',
    flow: 'implicit',
    ux_mode: 'redirect',
  } as UseGoogleLoginOptionsImplicitFlow);

  const googleLogOut = () => {
    setIsScopesApproved(false);
    setGoogleAuthToken(null);
    setIsGoogleAuthed(false);
    setLoggedInGmail(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(getGoogleAuthTokenKey());
      localStorage.removeItem('isGoogleAuthed');
      localStorage.removeItem('loggedInGmail');
    }

    googleLogout();
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        googleAuthToken,
        isGoogleAuthed,
        loggedInGmail,
        scopesApproved: isScopesApproved,
        googleLogIn,
        googleLogOut,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export default GoogleAuthProvider