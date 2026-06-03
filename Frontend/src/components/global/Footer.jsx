import Container from './Container'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
      <Container className="flex flex-col gap-2 py-6 text-sm text-[var(--text)] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-[var(--text-h)]">Tree Shop Managing System</span>
        <span>Temporary landing page + separated CRUD workspace.</span>
      </Container>
    </footer>
  )
}
