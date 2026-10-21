import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/tasks.readonly');
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Google Tasks API helper
export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  updated?: string;
}

export const createGoogleTask = async (
  accessToken: string,
  title: string,
  notes: string
): Promise<GoogleTaskItem | null> => {
  try {
    const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        notes,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to create Google Task:', errText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating Google Task:', err);
    return null;
  }
};

export const listGoogleTasks = async (accessToken: string): Promise<GoogleTaskItem[]> => {
  try {
    const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      console.error('Failed to list Google Tasks');
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Error listing Google Tasks:', err);
    return [];
  }
};

export const completeGoogleTask = async (accessToken: string, taskId: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://www.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error completing Google Task:', err);
    return false;
  }
};

// Google Forms API helper
export const createServiceGoogleForm = async (accessToken: string): Promise<{ formId?: string; responderUri?: string } | null> => {
  try {
    const res = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: 'Pure Computers Service Request & Consultation Form',
          documentTitle: 'Pure Computers Service Request',
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to create Google Form:', errText);
      return null;
    }
    const data = await res.json();
    // Add questions to the form
    const formId = data.formId;
    if (formId) {
      await fetch(`https://www.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              createItem: {
                item: {
                  title: 'Your Full Name',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {},
                    },
                  },
                },
                location: { index: 0 },
              },
            },
            {
              createItem: {
                item: {
                  title: 'Phone Number',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {},
                    },
                  },
                },
                location: { index: 1 },
              },
            },
            {
              createItem: {
                item: {
                  title: 'Do you only want remote tech support?',
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: 'RADIO',
                        options: [
                          { value: 'Yes - Remote only' },
                          { value: 'No - On-site / In-shop preferred' },
                        ],
                      },
                    },
                  },
                },
                location: { index: 2 },
              },
            },
          ],
        }),
      });
    }
    return {
      formId: data.formId,
      responderUri: data.responderUri,
    };
  } catch (err) {
    console.error('Error creating Google Form:', err);
    return null;
  }
};
