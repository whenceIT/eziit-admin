import type { Icon } from "@phosphor-icons/react";
import {
  ChartPie,
  GearSix,
  PlugsConnected,
  User,
  Users,
  Storefront,
  FileText,
  Briefcase,
  CurrencyDollar,
} from "@phosphor-icons/react";

export const navIcons = {
  "chart-pie": ChartPie,          // Statistics, Overview
  "gear-six": GearSix,            // Settings, Config
  "plugs-connected": PlugsConnected, // Integrations
  "user": User,                    // User Profile, Account
  "users": Users,                  // Clients, Merchants, Employers
  "stores": Storefront,            // Store management
  "reports": FileText,             // Reports
  "employers": Briefcase,          // Employers
  "finances": CurrencyDollar,      // Financial Transactions
} as Record<string, Icon>;
