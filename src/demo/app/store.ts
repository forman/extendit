/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { create } from "zustand";

export interface AppState {
  viewId: string | null;
}

export interface AppMethods {
  selectView(viewId: string | null): void;
}

export const useAppStore = create<AppState & AppMethods>()((set) => ({
  viewId: null,
  selectView: (viewId: string | null) => set({ viewId }),
}));

export function useAppContext(): Record<string, unknown> {
  return useAppStore() as unknown as Record<string, unknown>;
}

export function selectView(viewId: string | null) {
  useAppStore.getState().selectView(viewId);
}

export function clearView() {
  useAppStore.getState().selectView(null);
}
