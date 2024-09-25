
export class User {
    id?: string;
    fullname?: string;
    password?: string;
    email?: string;
    phone?: string;
    token?: string;
    isAdmin?: true;
    role?: Role;
    expiresAt?: Date; 
    userId?: string;  // Add userId here
    // Use Date type for expiresAt
   }


  export enum Role {
    SuperAdmin = 'Super Admin',
    Teacher = 'Teacher',
    Student = 'Student'
  }