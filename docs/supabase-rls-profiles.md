# Recommended RLS Policies for `profiles` Table

## 1. Enable RLS

In Supabase SQL Editor:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## 2. Allow users to read their own profile

```sql
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

## 3. Allow users to update their own profile

```sql
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

## 4. Allow users to insert their own profile (if you insert manually)

If you insert profiles from the client (not via trigger):
```sql
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## 5. (Recommended) Use a trigger to auto-create profile on signup

If you use Supabase's recommended trigger, you may not need the insert policy above.

---

**Note:**  
- Replace `id` with your user ID column if it’s named differently.
- Always test your policies in the Supabase dashboard.
