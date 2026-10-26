import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export interface ConsultationRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceCategory: string;
  remoteOnly: boolean;
  details: string;
  phone: string;
  status: 'Pending Review' | 'Scheduled' | 'In Progress' | 'Completed';
  createdAt?: any;
}

export const saveConsultationRequest = async (
  req: Omit<ConsultationRequest, 'id' | 'createdAt' | 'status'>
): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'consultations'), {
      ...req,
      status: 'Pending Review',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Error saving consultation request:', err);
    return null;
  }
};

export const fetchUserConsultations = async (userId: string): Promise<ConsultationRequest[]> => {
  try {
    const q = query(collection(db, 'consultations'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: ConsultationRequest[] = [];
    snapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as ConsultationRequest);
    });
    return results;
  } catch (err) {
    console.error('Error fetching user consultations:', err);
    return [];
  }
};
