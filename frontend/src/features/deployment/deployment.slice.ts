import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DeploymentRecord, DeploymentTab, DeviceMode } from './types';

interface DeploymentState {
  currentDeployment: DeploymentRecord | null;
  history: DeploymentRecord[];
  activeTab: DeploymentTab;
  deviceMode: DeviceMode;
}

const STORAGE_KEY_CURRENT = 'deployforge_current_deployment';
const STORAGE_KEY_HISTORY = 'deployforge_deployments_history';

function loadInitialState(): DeploymentState {
  try {
    const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
    const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

    return {
      currentDeployment: rawCurrent ? JSON.parse(rawCurrent) : null,
      history: rawHistory ? JSON.parse(rawHistory) : [],
      activeTab: 'preview',
      deviceMode: 'desktop',
    };
  } catch {
    return {
      currentDeployment: null,
      history: [],
      activeTab: 'preview',
      deviceMode: 'desktop',
    };
  }
}

const initialState: DeploymentState = loadInitialState();

export const deploymentSlice = createSlice({
  name: 'deployment',
  initialState,
  reducers: {
    setCurrentDeployment: (state, action: PayloadAction<DeploymentRecord>) => {
      state.currentDeployment = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(action.payload));
      } catch (e) {
        console.error('Failed to persist current deployment', e);
      }

      // Prepend to history without duplicates
      const filtered = state.history.filter((h) => h.id !== action.payload.id);
      state.history = [action.payload, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
      } catch (e) {
        console.error('Failed to persist history', e);
      }
    },
    setActiveTab: (state, action: PayloadAction<DeploymentTab>) => {
      state.activeTab = action.payload;
    },
    setDeviceMode: (state, action: PayloadAction<DeviceMode>) => {
      state.deviceMode = action.payload;
    },
    clearCurrentDeployment: (state) => {
      state.currentDeployment = null;
      try {
        localStorage.removeItem(STORAGE_KEY_CURRENT);
      } catch (e) {
        console.error(e);
      }
    },
  },
});

export const {
  setCurrentDeployment,
  setActiveTab,
  setDeviceMode,
  clearCurrentDeployment,
} = deploymentSlice.actions;

export default deploymentSlice.reducer;
