import React from "react";

const Loading = ({ type = "card" }) => {
  if (type === "list") {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
<div key={i} className="bg-white rounded-lg border p-6" style={{borderColor: '#E8E8E8'}}>
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
<div key={i} className="bg-white rounded-lg border p-6" style={{borderColor: '#E8E8E8'}}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
<div className="bg-white rounded-lg border p-6 animate-pulse" style={{borderColor: '#E8E8E8'}}>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;