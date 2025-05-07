/**
 * Firebase utility functions
 */
import { 
  Timestamp, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './client';

/**
 * Convert a Firestore Timestamp to a JavaScript Date
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Get the server timestamp for use in document creation/updates
 */
export const getServerTimestamp = () => {
  return serverTimestamp();
};

/**
 * Get a collection reference
 */
export const getCollectionRef = (collectionName: string) => {
  return collection(db, collectionName);
};

/**
 * Create a query with filters
 */
export const createQuery = (
  collectionName: string,
  filters: Array<{ field: string; operator: string; value: any }> = [],
  sortBy: Array<{ field: string; direction: 'asc' | 'desc' }> = [],
  limitCount: number = 0
) => {
  let baseQuery = query(collection(db, collectionName));

  // Add filters
  filters.forEach(filter => {
    baseQuery = query(
      baseQuery,
      where(filter.field, filter.operator as any, filter.value)
    );
  });

  // Add sorting
  sortBy.forEach(sort => {
    baseQuery = query(
      baseQuery,
      orderBy(sort.field, sort.direction)
    );
  });

  // Add limit if specified
  if (limitCount > 0) {
    baseQuery = query(baseQuery, limit(limitCount));
  }

  return baseQuery;
};

/**
 * Convert a Firestore document to an application model
 */
export const convertDocToModel = <T>(
  doc: any,
  dateFields: string[] = ['createdAt', 'updatedAt']
): T => {
  if (!doc) return null as any;

  const data = doc.data();
  if (!data) return null as any;

  const result: any = {
    id: doc.id,
    ...data
  };

  // Convert timestamp fields to dates
  dateFields.forEach(field => {
    if (data[field] && data[field] instanceof Timestamp) {
      result[field] = timestampToDate(data[field]);
    }
  });

  return result as T;
};

/**
 * Prepare document data for Firestore by converting Dates to Timestamps
 */
export const prepareDocForFirestore = (
  data: any,
  dateFields: string[] = ['createdAt', 'updatedAt', 'dueDate']
): any => {
  const result = { ...data };

  // Convert date fields to timestamps
  dateFields.forEach(field => {
    if (result[field] instanceof Date) {
      result[field] = dateToTimestamp(result[field]);
    }
  });

  return result;
};
