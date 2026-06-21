import {Container} from './Container'

export function Footer() {
    return (
        <footer className="border-t border-border bg-bg">
            <Container className="flex flex-col gap-2 py-6 text-sm text-text sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-text-h">Tree Shop Managing System</span>
                <span>Temporary landing page + separated CRUD workspace.</span>
            </Container>
        </footer>
    )
}