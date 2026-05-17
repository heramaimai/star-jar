export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    signInWithOtp: async () => ({ data: null, error: null }),
    verifyOtp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
};
