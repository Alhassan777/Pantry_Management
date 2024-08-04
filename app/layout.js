'use client';

import React from 'react';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You can include meta tags, title, and link to stylesheets here */}
        <title>Pantry Management</title>
      </head>
      <body>
        <header>
          {/* You can include a header component or content here */}
          <nav>
            {/* Navigation links */}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          {/* You can include a footer component or content here */}
        </footer>
      </body>
    </html>
  );
}
