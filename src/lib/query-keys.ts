/**
 * TanStack Query のキーファクトリ
 * invalidation 漏れを防ぐために一元管理する
 */

export const taskKeys = {
  all:   ['tasks']                          as const,
  lists: ()           => [...taskKeys.all, 'list']     as const,
  list:  (date: string) => [...taskKeys.lists(), date] as const,
  detail:(id: string) => [...taskKeys.all, 'detail', id] as const,
}

export const completionKeys = {
  all:  ['task_completions']                        as const,
  date: (date: string) => [...completionKeys.all, date] as const,
}

export const eventKeys = {
  all:   ['events']                          as const,
  lists: ()           => [...eventKeys.all, 'list']    as const,
  range: (start: string, end: string) => [...eventKeys.lists(), start, end] as const,
  detail:(id: string) => [...eventKeys.all, 'detail', id] as const,
}
