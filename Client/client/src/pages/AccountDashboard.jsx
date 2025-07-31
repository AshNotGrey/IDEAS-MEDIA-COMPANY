import React from "react";

const AccountDashboard = () => (
  <div className='max-w-3xl mx-auto px-4 py-12'>
    <h1 className='text-3xl font-bold mb-8 text-mailchimp-ink dark:text-mailchimp-dark-ink'>
      Account Dashboard
    </h1>
    {/* TODO: Add account info, verification status, and widget links. Connect to server. */}
    <div className='bg-mailchimp-bgMuted dark:bg-mailchimp-dark-bgMuted rounded-lg p-8 text-center'>
      <p className='text-lg'>Account info and widgets coming soon.</p>
    </div>
  </div>
);

export default AccountDashboard;
