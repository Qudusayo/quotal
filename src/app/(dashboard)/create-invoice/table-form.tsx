"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

const TableForm = () => {
  const [formEntries, setFormEntries] = useState(1);

  return (
    <div className="md:flex items-center">
      <div className="flex flex-col md:w-5/12">
        <Input type="text" tabIndex={0} placeholder="Company Name" />
      </div>
      <div className="flex flex-col md:w-2/12 md:ml-2">
        <Input type="text" tabIndex={0} placeholder="$500" />
      </div>
      <div className="flex flex-col md:w-2/12 md:ml-2">
        <Input type="text" tabIndex={0} placeholder="1" />
      </div>
      <div className="flex flex-col md:w-2/12 md:ml-2">
        <Input type="text" placeholder="$500" />
      </div>
    </div>
  );
};

export default TableForm;
