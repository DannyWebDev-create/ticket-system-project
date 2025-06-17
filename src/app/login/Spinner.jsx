"use client";
import { PuffLoader } from "react-spinners";

export default function Spinner({text}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <PuffLoader color="#2563eb" size={60} speedMultiplier={1.2} />
      {text && <span className="mt-4 text-blue-600 dark:text-blue-200 font-semibold text-lg animate-pulse">{text}</span>}
    </div>
  );
}
