export interface User {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

class AuthService {
    private currentUser: User | null = null;

    constructor() {
        this.loadSession();
    }

    private loadSession() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedUser = localStorage.getItem('kanzie_user');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                } catch (e) {
                    console.error('Failed to parse saved session');
                }
            }
        }
    }

    setUser(user: User) {
        this.currentUser = user;
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('kanzie_user', JSON.stringify(user));
        }
    }

    getUser(): User | null {
        return this.currentUser;
    }

    getUserId(): number {
        return this.currentUser?.id ?? 0;
    }

    logout() {
        this.currentUser = null;
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('kanzie_user');
        }
    }
}

export const authService = new AuthService();
