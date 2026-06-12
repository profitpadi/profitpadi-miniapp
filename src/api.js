// miniapp/src/api.js
// ============================================================
// API client for Mini App — all calls go through the REST API.
// Mini App NEVER touches the database directly.
// ============================================================

import axios from 'axios';
import { getInitData } from './telegram';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token stored in memory (not localStorage — not supported in artifacts)
let authToken = null;

const client = axios.create({ baseURL: BASE_URL });

// Attach token to every request
client.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// Handle 401 — re-authenticate
client.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      authToken = null;
      await authenticate();
      // Retry original request
      err.config.headers.Authorization = `Bearer ${authToken}`;
      return client(err.config);
    }
    return Promise.reject(err);
  }
);

// ── AUTHENTICATION ─────────────────────────────────────────────

export const authenticate = async () => {
  const initData = getInitData();
  const res = await axios.post(`${BASE_URL}/auth/telegram`, { initData });
  authToken = res.data.token;
  return res.data;
};

export const getProfile = async () => (await client.get('/auth/me')).data;

// ── TRANSACTIONS ───────────────────────────────────────────────

export const getTransactions       = async (limit = 20, offset = 0) => (await client.get(`/transactions?limit=${limit}&offset=${offset}`)).data;
export const getRecentTransactions = async (limit = 5)             => getTransactions(limit, 0);
export const getDailyTotals    = async ()             => (await client.get('/transactions/daily')).data;
export const getWeeklyTotals   = async ()             => (await client.get('/transactions/weekly')).data;
export const getMonthlyTotals  = async (year, month)  => {
  const params = year && month ? `?year=${year}&month=${month}` : '';
  return (await client.get(`/transactions/monthly${params}`)).data;
};
export const createTransaction = async (data)         => (await client.post('/transactions', data)).data;
export const deleteTransaction = async (id)           => (await client.delete(`/transactions/${id}`)).data;

// ── REPORTS ────────────────────────────────────────────────────

export const getPnLReport     = async (start, end)   => (await client.get(`/reports/pnl?start=${start}&end=${end}`)).data;
export const getMonthlyTrend  = async (months = 6)   => (await client.get(`/reports/trend?months=${months}`)).data;
export const getAnnualSummary = async (year)          => (await client.get(`/reports/annual${year ? `?year=${year}` : ''}`)).data;
export const exportPDF        = ()                    => `${BASE_URL}/reports/export/pdf?token=${authToken}`;
export const exportExcel      = ()                    => `${BASE_URL}/reports/export/excel?token=${authToken}`;

// ── INVOICES ───────────────────────────────────────────────────

export const getInvoices       = async (status)      => (await client.get(`/invoices${status ? `?status=${status}` : ''}`)).data;
export const getInvoiceSummary = async ()             => (await client.get('/invoices/summary')).data;
export const createInvoice     = async (data)         => (await client.post('/invoices', data)).data;
export const markInvoiceSent   = async (id)           => (await client.post(`/invoices/${id}/send`)).data;
export const markInvoicePaid   = async (id)           => (await client.post(`/invoices/${id}/paid`)).data;

// ── COMPLIANCE ─────────────────────────────────────────────────

export const getComplianceAssessment = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return (await client.get(`/compliance/assess?${qs}`)).data;
};
export const getComplianceReminders = async () => (await client.get('/compliance/reminders')).data;
export const getFilingGuide         = async (type) => (await client.get(`/compliance/guide/${type}`)).data;

// ── SAVINGS ────────────────────────────────────────────────────

export const getSavingsStatus  = async ()             => (await client.get('/savings')).data;
export const getSavingsHistory = async ()             => (await client.get('/savings/history')).data;
export const addToSavings      = async (amount, note) => (await client.post('/savings/add', { amount, note })).data;
export const withdrawSavings   = async (amount, note) => (await client.post('/savings/withdraw', { amount, note })).data;

// ── ACCOUNT ────────────────────────────────────────────────────

export const updateAccount     = async (data)         => (await client.put('/account', data)).data;
export const getReferralStats  = async ()             => (await client.get('/account/referrals')).data;

// ── SUBSCRIPTIONS ──────────────────────────────────────────────

export const getTiers          = async ()             => (await client.get('/subscriptions/tiers')).data;
export const getCurrentPlan    = async ()             => (await client.get('/subscriptions/current')).data;
export const initiateUpgrade   = async (tier, period) => (await client.post('/subscriptions/upgrade', { tier, period })).data;

// ── HELPERS ────────────────────────────────────────────────────

export const formatMoney = (amount) =>
  `₦${parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
