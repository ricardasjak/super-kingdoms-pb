import type React from "react";
import { Outlet } from "react-router-dom";
import { TopStatusBar } from "./top-status-bar";

export const Layout: React.FC = () => {
	return (
		<div
			style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
		>
			<TopStatusBar />
			<main
				className="container"
				style={{ flex: 1, paddingTop: "1.5rem", paddingBottom: "3rem" }}
			>
				<Outlet />
			</main>
			<footer
				style={{
					borderTop: "1px solid var(--sk-border-subtle)",
					padding: "1rem",
					textAlign: "center",
					fontSize: "0.8rem",
					color: "var(--pico-muted-color)",
				}}
			>
				<div className="container">
					Super Kingdoms &bull; Turn-Based Galactic Warfare Engine &bull;
					PocketBase &amp; React 19
				</div>
			</footer>
		</div>
	);
};
