"use client"; 

import StaffSidebar from "@/components/staff/StaffSidebar"; 
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell"; 

export default function BookingsPage() { 
  return ( 
    <ResponsiveAppShell sidebar={(sidebarProps) => ( <StaffSidebar {...sidebarProps} /> 

    )} 
    >
      <main className="min-h-screen bg-[#f0f2f7] p-5 md:p-8 lg:p-10"> 
        <h1 className="text-2xl font-bold text-[#08155A]"> 
          Bookings 
          </h1> 
          
      <p className="mt-2 text-gray-600"> 
        Booking management will be provided through Microsoft Bookings. 
        </p> 
      </main> 
    </ResponsiveAppShell> 
    ); 
  }