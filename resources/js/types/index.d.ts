import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    displayMenu?: boolean; // Optional property to control visibility in the sidebar
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    firstname: string;
    middlename?: string;
    lastname: string;
    phone: string;
    status: string; // e.g., 'active', 'inactive', etc.
    email: string;
    profile_img?: File | string;
    email_verified_at: string | null;
    dob: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface TransactionCategory {
    id: number;
    name: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Transaction {
    id: number;
    transaction_date: DateTime;
    amount: number;
    type: 'income' | 'expenses' | 'savings';
    category: TransactionCategory;
    payment_method: string;
    description?: string;
    user_id: number;
    user?: User;
    attachments?: Attachment[];
    created_at: DateTime;
    updated_at: DateTime;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    transaction_id: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Budget {
    id: number;
    user_id: number;
    category_id: number;
    amount: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null;
    purpose?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    auto_reset: boolean;
    [key: string]: unknown;
}
