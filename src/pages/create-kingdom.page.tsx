import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreateKingdomForm } from "../components/create-kingdom-form";
import { useAuth } from "../context/use-auth.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";

export const CreateKingdomPage: React.FC = () => {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { kingdom, isLoading: kdLoading, refetch } = useKingdom();
	const navigate = useNavigate();

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			navigate("/login");
		} else if (!kdLoading && kingdom) {
			navigate("/");
		}
	}, [isAuthenticated, authLoading, kingdom, kdLoading, navigate]);

	if (authLoading || kdLoading) {
		return (
			<div style={{ textAlign: "center", padding: "4rem 1rem" }}>
				<div className="spinner-large" style={{ margin: "0 auto 1.5rem" }} />
				<p className="text-secondary">Scanning galactic coordinates...</p>
			</div>
		);
	}

	return (
		<div className="create-kingdom-page-wrap">
			<div style={{ marginBottom: "1.5rem" }}>
				<Link
					to="/"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "0.4rem",
						color: "var(--text-secondary)",
						fontSize: "0.9rem",
					}}
				>
					<ArrowLeft size={16} />
					<span>Back to Command Overview</span>
				</Link>
			</div>

			<CreateKingdomForm
				onSuccess={() => {
					refetch();
					navigate("/");
				}}
				onCancel={() => navigate("/")}
			/>
		</div>
	);
};
