import { useState } from "react";

const Home = () => {
	const [count, setCount] = useState(0);
	return (
		<>
			<h1>If you're seeing this, the Homepage works.</h1>
			<button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
		</>
	);
};

export default Home;
