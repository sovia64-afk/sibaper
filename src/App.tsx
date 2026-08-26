/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function App() {
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
