import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/global/Container';
import { Form } from '../components/ui/Form';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Authentication() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		email: 'testuser@gmail.com',
		password: '123456',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleChange = (field) => (e) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});

			if (!response.ok) {
				throw new Error('Login failed. Check your credentials.');
			}

			// Navigate to admin page on success
			navigate('/admin/users');
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container>
			<div className="max-w-sm mx-auto py-16">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-stone-800 mb-2">TreeShop Admin</h1>
					<p className="text-sm text-stone-500">Sign in to manage users</p>
				</div>

				<Form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Input
						label="Email"
						type="email"
						value={form.email}
						onChange={handleChange('email')}
						placeholder="testuser@gmail.com"
						required
					/>
					<Input
						label="Password"
						type="password"
						value={form.password}
						onChange={handleChange('password')}
						placeholder="••••••••"
						required
					/>

					{error && (
						<div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
							<p className="text-sm text-rose-700">{error}</p>
						</div>
					)}

					<Button type="submit" disabled={isLoading} className="w-full">
						{isLoading ? 'Signing in...' : 'Sign In'}
					</Button>
				</Form>

				<p className="text-xs text-stone-400 text-center mt-6">
					Test credentials: testuser@gmail.com / 123456
				</p>
			</div>
		</Container>
	);
}
