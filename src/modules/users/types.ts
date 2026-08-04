export interface Permission {
  uid: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface Role {
  uid: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: string;
  active: boolean;
  roles: Role[];
}

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
}
