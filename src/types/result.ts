export type ApiResult<TData, TError = string> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      error: TError;
    };

export type CacheRefreshResult = {
  refreshedAt: string;
  familyCount: number;
  isStale: boolean;
};
