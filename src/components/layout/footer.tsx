export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Madrasah Gateway. Hak Cipta Dilindungi.</p>
        <p>Ganti Percobaan Vercel HAHAHAHAHA</p>
      </div>
    </footer>
  );
}
