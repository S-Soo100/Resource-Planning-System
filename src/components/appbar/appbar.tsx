"use client";
import React from "react";

import { FaBox } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
export default function AppBar() {
  return (
    <div className="flex items-center justify-between bg-blue-500 text-white p-4">
      <div className="flex items-center space-x-2">
        <div className="bg-gray-200 rounded-full p-2">
          {/* User Icon */}
          <FaBox className="text-blue-500 text-2xl" />
        </div>
        <span className="font-medium">User</span>
      </div>
      <div className="bg-gray-800 rounded-full p-2">
        {/* User Icon */}{" "}
        <IoLogOutOutline
          className="text-white text-2xl"
          onClick={() => alert("Logged out")}
        />
      </div>
    </div>
  );
}
