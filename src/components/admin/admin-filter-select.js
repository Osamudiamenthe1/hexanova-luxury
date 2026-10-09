/**
 * src/components/admin/admin-filter-select.js
 * A tiny state holder so a CustomSelect can be used inside a server-rendered
 * form (like the products list filter bar).
 *
 * Why: CustomSelect is controlled - it needs a parent that holds its state
 * via useState. Server Components can't do that. This client component sits
 * in between: the server renders <AdminFilterSelect ... />, and this file
 * manages the state.
 */

"use client";

import { useState } from "react";
import CustomSelect from "@/components/ui/custom-select";

export default function AdminFilterSelect({ id, name, defaultValue, options }) {
  const [value, setValue] = useState(defaultValue || "");

  return (
    <CustomSelect
      id={id}
      name={name}
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}