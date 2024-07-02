import { cn } from "@/lib/utils";
import React from "react";
import { Check } from "lucide-react";

const ChainedList = ({
  title,
  value,
  isLast,
  isAddress,
}: {
  title: string;
  value: string;
  isLast?: boolean;
  isAddress?: boolean;
}) => {
  return (
    <div className="relative overflow-hidden">
      <div
        className={cn(
          "w-8 h-8 rounded-full left-1 absolute top-0 bg-[#00bf63] z-10 flex items-center justify-center",
          value ? "bg-[#00bf63]" : "bg-gray-300"
        )}
      >
        {value && <Check color="#FFF" />}
      </div>
      {!isLast && (
        <div
          className={cn(
            "absolute border-1 border-l h-full left-[1.2rem] top-2"
          )}
        ></div>
      )}
      <div className="pl-12 mt-1 pb-8">
        <span className="block">{title}</span>
        <span className="block text-gray-500 text-sm break-words text-balance">
          {value
            ? isAddress
              ? value.slice(0, 7) + "..." + value.slice(-7)
              : value
            : ""}
        </span>
      </div>
    </div>
  );
};

export default ChainedList;
