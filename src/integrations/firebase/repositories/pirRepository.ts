/**
 * PIR repository for Firebase Firestore integration
 */
import {
  doc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../client';
import { 
  getServerTimestamp, 
  convertDocToModel, 
  prepareDocForFirestore,
  createQuery
} from '../utils';
import { PIR, PIRFilter, PIRStatus, Repository } from '../../../types';

// Collection name
const COLLECTION_NAME = 'pirs';

/**
 * PIR Repository implementation
 */
export class PIRRepository implements Repository<PIR> {
  
  /**
   * Get all PIRs
   */
  async getAll(): Promise<PIR[]> {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => 
      convertDocToModel<PIR>(doc)
    );
  }
  
  /**
   * Get PIR by ID
   */
  async getById(id: string): Promise<PIR | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return convertDocToModel<PIR>(docSnap);
  }
  
  /**
   * Create a new PIR
   */
  async create(data: Omit<PIR, 'id' | 'createdAt' | 'updatedAt'>): Promise<PIR> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to create a PIR');
    }
    
    const docData = {
      ...data,
      status: data.status || PIRStatus.REQUESTED,
      createdBy: currentUser.uid,
      updatedBy: currentUser.uid,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
      version: 1,
      questionCount: 0,
      answeredQuestionCount: 0
    };
    
    const preparedData = prepareDocForFirestore(docData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), preparedData);
    const newDoc = await getDoc(docRef);
    
    return convertDocToModel<PIR>(newDoc);
  }
  
  /**
   * Update an existing PIR
   */
  async update(id: string, data: Partial<Omit<PIR, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PIR> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to update a PIR');
    }
    
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`PIR with ID ${id} not found`);
    }
    
    // Get current version and increment
    const currentPIR = convertDocToModel<PIR>(docSnap);
    const newVersion = (currentPIR.version || 0) + 1;
    
    const updateData = {
      ...data,
      updatedBy: currentUser.uid,
      updatedAt: getServerTimestamp(),
      version: newVersion
    };
    
    // Add special timestamp fields for status changes
    if (data.status) {
      if (data.status === PIRStatus.REVIEWED && !currentPIR.reviewedAt) {
        updateData.reviewedBy = currentUser.uid;
        updateData.reviewedAt = getServerTimestamp();
      } else if (data.status === PIRStatus.ACCEPTED && !currentPIR.acceptedAt) {
        updateData.acceptedBy = currentUser.uid;
        updateData.acceptedAt = getServerTimestamp();
      }
    }
    
    const preparedData = prepareDocForFirestore(updateData);
    await updateDoc(docRef, preparedData);
    
    const updatedDocSnap = await getDoc(docRef);
    return convertDocToModel<PIR>(updatedDocSnap);
  }
  
  /**
   * Delete a PIR
   */
  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting PIR:', error);
      return false;
    }
  }
  
  /**
   * Filter PIRs by various criteria
   */
  async filter(filter: PIRFilter): Promise<PIR[]> {
    const filters = [];
    
    // Add filters based on provided criteria
    if (filter.status) {
      filters.push({ field: 'status', operator: '==', value: filter.status });
    }
    
    if (filter.requester) {
      filters.push({ field: 'requester', operator: '==', value: filter.requester });
    }
    
    if (filter.product) {
      filters.push({ field: 'product', operator: '==', value: filter.product });
    }
    
    if (filter.isUrgent !== undefined) {
      filters.push({ field: 'isUrgent', operator: '==', value: filter.isUrgent });
    }
    
    if (filter.createdAfter) {
      filters.push({ 
        field: 'createdAt', 
        operator: '>=', 
        value: Timestamp.fromDate(filter.createdAfter) 
      });
    }
    
    if (filter.createdBefore) {
      filters.push({ 
        field: 'createdAt', 
        operator: '<=', 
        value: Timestamp.fromDate(filter.createdBefore) 
      });
    }
    
    // Handle tags with array-contains-any (up to 10 tags)
    if (filter.tags && filter.tags.length > 0) {
      // Firestore array-contains-any supports up to 10 values
      const tagsToUse = filter.tags.slice(0, 10);
      filters.push({ 
        field: 'tags', 
        operator: 'array-contains-any', 
        value: tagsToUse 
      });
    }
    
    // Create and execute query
    const q = createQuery(
      COLLECTION_NAME,
      filters,
      [{ field: 'createdAt', direction: 'desc' }]
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocToModel<PIR>(doc));
  }
  
  /**
   * Get PIRs by status
   */
  async getByStatus(status: PIRStatus): Promise<PIR[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocToModel<PIR>(doc));
  }
  
  /**
   * Get PIRs created by a specific user
   */
  async getByRequester(requesterId: string): Promise<PIR[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('requester', '==', requesterId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocToModel<PIR>(doc));
  }
  
  /**
   * Update the question counts for a PIR
   */
  async updateQuestionCounts(
    pirId: string, 
    questionCount: number, 
    answeredQuestionCount: number
  ): Promise<PIR> {
    const docRef = doc(db, COLLECTION_NAME, pirId);
    
    await updateDoc(docRef, {
      questionCount,
      answeredQuestionCount,
      updatedAt: getServerTimestamp()
    });
    
    const updatedDocSnap = await getDoc(docRef);
    return convertDocToModel<PIR>(updatedDocSnap);
  }
}

// Export a singleton instance
export const pirRepository = new PIRRepository();
