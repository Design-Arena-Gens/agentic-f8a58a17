import CakeGrid from "./components/CakeGrid";

export default function Page() {
  return (
    <main className="container">
      <header className="header">
        <h1>Sweet Magnolia Bakery</h1>
        <p>Hover a cake to see its price ? spread frosting with your mouse!</p>
      </header>
      <CakeGrid />
      <footer className="footer">Made with love in our small town.</footer>
    </main>
  );
}
