-- ═══════════════════════════════════════════════════════════════
-- レビュー指摘事項修正マイグレーション
-- Supabase SQL Editor で実行すること
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────
-- 1. task_completions に user_id を追加
--    （RLSをシンプルにするため）
-- ───────────────────────────────────────────────────
ALTER TABLE task_completions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;

-- 既存レコードを埋める（tasks テーブルから引く）
UPDATE task_completions tc
SET user_id = t.user_id
FROM tasks t
WHERE tc.task_id = t.id
  AND tc.user_id IS NULL;

-- NOT NULL 制約を後付け（既存が埋まってから）
ALTER TABLE task_completions
  ALTER COLUMN user_id SET NOT NULL;

-- DEFAULT を設定（以後のINSERTで自動セット）
ALTER TABLE task_completions
  ALTER COLUMN user_id SET DEFAULT auth.uid();


-- ───────────────────────────────────────────────────
-- 2. RLS ポリシーを OPERATION 別に再定義
--    （WITH CHECK を全 INSERT/UPDATE に追加）
-- ───────────────────────────────────────────────────

-- tasks
DROP POLICY IF EXISTS "users can only access own tasks" ON tasks;

CREATE POLICY "tasks: select own"  ON tasks FOR SELECT  USING  (user_id = auth.uid());
CREATE POLICY "tasks: insert own"  ON tasks FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks: update own"  ON tasks FOR UPDATE  USING  (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks: delete own"  ON tasks FOR DELETE  USING  (user_id = auth.uid());

-- task_completions（user_id が追加されたのでシンプルに書ける）
DROP POLICY IF EXISTS "users can only access own completions" ON task_completions;

CREATE POLICY "tc: select own" ON task_completions FOR SELECT  USING  (user_id = auth.uid());
CREATE POLICY "tc: insert own" ON task_completions FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "tc: update own" ON task_completions FOR UPDATE  USING  (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tc: delete own" ON task_completions FOR DELETE  USING  (user_id = auth.uid());

-- events
DROP POLICY IF EXISTS "users can only access own events" ON events;

CREATE POLICY "events: select own" ON events FOR SELECT  USING  (user_id = auth.uid());
CREATE POLICY "events: insert own" ON events FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "events: update own" ON events FOR UPDATE  USING  (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "events: delete own" ON events FOR DELETE  USING  (user_id = auth.uid());


-- ───────────────────────────────────────────────────
-- 3. user_id の DEFAULT を設定
--    （クライアントから user_id を送らなくてよくなる）
-- ───────────────────────────────────────────────────
ALTER TABLE tasks  ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE events ALTER COLUMN user_id SET DEFAULT auth.uid();


-- ───────────────────────────────────────────────────
-- 4. パフォーマンスインデックス
-- ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_user_id       ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due      ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_active    ON tasks(due_date) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_user_id      ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_start   ON events(user_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_tc_task_completed   ON task_completions(task_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_tc_user_id          ON task_completions(user_id);


-- ───────────────────────────────────────────────────
-- 5. CHECK 制約（DBバリデーション）
-- ───────────────────────────────────────────────────
ALTER TABLE tasks
  ADD CONSTRAINT IF NOT EXISTS tasks_title_not_empty  CHECK (trim(title) <> ''),
  ADD CONSTRAINT IF NOT EXISTS tasks_title_length     CHECK (char_length(title) <= 500),
  ADD CONSTRAINT IF NOT EXISTS tasks_memo_length      CHECK (memo IS NULL OR char_length(memo) <= 10000);

ALTER TABLE events
  ADD CONSTRAINT IF NOT EXISTS events_title_not_empty CHECK (trim(title) <> ''),
  ADD CONSTRAINT IF NOT EXISTS events_title_length    CHECK (char_length(title) <= 500),
  ADD CONSTRAINT IF NOT EXISTS events_valid_range     CHECK (start_at < end_at),
  ADD CONSTRAINT IF NOT EXISTS events_memo_length     CHECK (memo IS NULL OR char_length(memo) <= 10000);


-- ───────────────────────────────────────────────────
-- 6. updated_at カラム + 自動更新トリガー
-- ───────────────────────────────────────────────────
ALTER TABLE tasks  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at  ON tasks;
DROP TRIGGER IF EXISTS events_updated_at ON events;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ───────────────────────────────────────────────────
-- 7. RLS 有効確認クエリ（実行して全行 true を確認）
-- ───────────────────────────────────────────────────
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
