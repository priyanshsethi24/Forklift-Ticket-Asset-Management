import { baseURL } from "./baseUrl";

export const API_END_POINTS = {
  login: `${baseURL}/auth/login/`,
  assets: `${baseURL}/assets/`,
  logout: `${baseURL}/auth/logout/`,
  createAssets: `${baseURL}/assets/create/`,
  dashboard: `${baseURL}/dashboard/`,
  customers: `${baseURL}/customers/`,
  createOffer: `${baseURL}/sales-offers/`,
  viewOffer: `${baseURL}/sales-offers/`,
  financeReport: `${baseURL}/finance/records/`,
  warehouses: `${baseURL}/warehouses/`,
  maintenance: `${baseURL}/maintenance/schedule/`,
  assetSummary: `${baseURL}/assets-summary`,
  assetFinancials: `${baseURL}/finance-summary`,
  salesReport: `${baseURL}/sales-report`,
  assetAttachments: `${baseURL}/assets/<int:assetid>/attachments/`,
  financeSummary: `${baseURL}/financial-summary/`,
  resetPassword: `${baseURL}/reset-password/`,
};
