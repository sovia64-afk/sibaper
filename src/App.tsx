/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Check if session exists or redirect
    const session = localStorage.getItem("sibaperSession");
    if (!session) {
      // Setup default or customized admin session so users can preview the app immediately
      let adminData = {
        username: "admin",
        email: "admin@sibaper.local",
        name: "Administrator SIBAPER",
        role: "admin"
      };
      try {
        const custom = localStorage.getItem("sibaperAdminAccount");
        if (custom) {
          const parsed = JSON.parse(custom);
          if (parsed && parsed.username) {
            adminData = {
              username: parsed.username,
              email: parsed.email || "admin@sibaper.local",
              name: parsed.name || "Administrator SIBAPER",
              role: "admin"
            };
          }
        }
      } catch (e) {}

      localStorage.setItem(
        "sibaperSession",
        JSON.stringify({
          ...adminData,
          loginTime: new Date().toISOString()
        })
      );
    }
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900">
      <iframe
        id="sibaper-main-frame"
        src="/website_instansi/pages/dashboard.html"
        title="SIBAPER - Sistem Informasi Bidang Pelayaran"
        className="w-full h-full border-0"
      />
    </div>
  );
}

