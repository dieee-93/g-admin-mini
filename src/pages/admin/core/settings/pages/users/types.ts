/**
 * Types for User Management
 */

export type UserRole = 'CLIENTE' | 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR' | 'SUPER_ADMIN';

export interface UserData {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    user_type: string;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    employee_id: string | null;

    // Joined data
    role?: UserRole;
    role_id?: string;
    team_member?: {
        id: string;
        first_name: string;
        last_name: string;
        position: string;
        email: string | null;
    } | null;
}

export interface InviteUserFormData {
    email: string;
    full_name: string;
    role: UserRole;
    is_employee: boolean;
    link_option?: 'link_existing' | 'create_new';
    selected_employee_id?: string;
}
