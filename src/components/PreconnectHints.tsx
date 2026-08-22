// Every artwork image goes through wsrv.nl (the resizing proxy — see
// src/lib/image-loader.ts). Without this hint, the browser only starts the
// DNS/TLS handshake to wsrv.nl once the *first* image request fires, adding
// real latency to every page that shows artwork — worse on mobile networks.
// A plain Server Component (not "use client") so Next.js hoists these
// <link> tags into the server-rendered <head>, taking effect while the HTML
// is still streaming in — a client-only version (via ReactDOM.preconnect)
// only applies after hydration, too late to help the first image requests.
export default function PreconnectHints() {
  return (
    <>
      <link rel="preconnect" href="https://wsrv.nl" />
      <link rel="dns-prefetch" href="https://wsrv.nl" />
    </>
  );
}
