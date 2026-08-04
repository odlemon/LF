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

export interface RoleInput {
  name: string;
  description: string;
  permissionsUids: string[];
  firmUid?: string;
}
