const mockFrom = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: {}, error: null }),
};

const mockSupabase = {
  from: vi.fn(() => mockFrom),
  rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'abc' } },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'abc' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

export const createClient = vi.fn(() => mockSupabase);
