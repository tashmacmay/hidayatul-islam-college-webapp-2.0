"use client";

export default function CreateBookingPage() {
  return (<>
    <div className="flex justify-center gap-2.5 bg-[#08155A]"> {/*Safety net if bookings page refuses to connect:*/}
      <p>Having trouble viewing the calendar?</p>
      <a href="https://bookings.cloud.microsoft/book/HidayatulIslamCollegeBookings@abcosystems365.onmicrosoft.com/?ismsaljsauthenabled"
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-book-external text-[#ECC33B] hover:text-[#BA8E00]">
          Open Booking Page in a New Tab {/*Link text*/}
      </a> {/*target blank - tells the href to open in separate tab, rel  noopener noreferrer - security standard so wepapp is not recognised as the referrer to new tab and destination may not spoof opener https://stackoverflow.com/questions/57628890/why-people-use-rel-noopener-noreferrer-instead-of-just-rel-noreferrer*/}
    </div>
    <iframe
      src="https://bookings.cloud.microsoft/book/HidayatulIslamCollegeBookings@abcosystems365.onmicrosoft.com/?ismsaljsauthenabled"
      className="w-full h-[800px] border-0"
      title="Hidayatul Islam College Bookings"
    />
  </>);
}