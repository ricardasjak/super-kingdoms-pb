import React, { useEffect, useState, useCallback } from "react";
import { pb } from "../lib/pocketbase";
import { PlayButton } from "../components/play-button";

interface TargetKingdom {
  id: string;
  kdName: string;
  rulerName: string;
  planetType: string;
  raceType: string;
  land: number;
  nw: number;
  state?: string;
}

export const KingdomTargetsPage: React.FC = () => {
  const [targets, setTargets] = useState<TargetKingdom[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTargets = useCallback(async (pageNum: number, append = false) => {
    setIsLoading(true);
    try {
      const res = await pb.send<{
        page: number;
        perPage: number;
        items: TargetKingdom[];
      }>("/api/kingdoms/targets", {
        method: "GET",
        query: { page: pageNum, perPage: 50 },
      });

      if (append) {
        setTargets((prev) => [...prev, ...res.items]);
      } else {
        setTargets(res.items);
      }

      setHasMore(res.items.length === 50);
    } catch (err) {
      console.error("Failed to fetch targets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets(1);
    const onTick = () => fetchTargets(1);
    window.addEventListener("tick-advanced", onTick);
    return () => window.removeEventListener("tick-advanced", onTick);
  }, [fetchTargets]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTargets(nextPage, true);
  };

  const filtered = targets.filter(
    (t) =>
      t.kdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.rulerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.planetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.raceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="targets-page" style={{ marginTop: "1rem" }}>
      <div className="section-header-row" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="page-heading">Galaxy Radar & Target Scan</h1>
          <p className="page-subheading">
            Scan sovereign realms and autonomous protectorates across the charted sector.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <PlayButton showText={true} />
          <input
            type="text"
            placeholder="Search kingdom, ruler, planet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.4rem 0.8rem",
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              width: "260px",
            }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dense-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ textAlign: "left", padding: "0.6rem" }}>Kingdom Name</th>
                <th style={{ textAlign: "left", padding: "0.6rem" }}>Ruler</th>
                <th style={{ textAlign: "left", padding: "0.6rem" }}>Planet Biome</th>
                <th style={{ textAlign: "left", padding: "0.6rem" }}>Race</th>
                <th style={{ textAlign: "right", padding: "0.6rem" }}>Land</th>
                <th style={{ textAlign: "right", padding: "0.6rem" }}>Networth</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kd) => (
                <tr key={kd.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.6rem" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{kd.kdName}</strong>
                    {kd.state === "dead" && (
                      <span style={{ color: "var(--accent-rose)", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                        [DEAD]
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.6rem", color: "var(--text-secondary)" }}>
                    {kd.rulerName}
                  </td>
                  <td style={{ padding: "0.6rem" }}>{kd.planetType}</td>
                  <td style={{ padding: "0.6rem" }}>{kd.raceType}</td>
                  <td style={{ textAlign: "right", padding: "0.6rem", color: "var(--accent-secondary)" }}>
                    {kd.land.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", padding: "0.6rem", fontWeight: 600 }}>
                    {kd.nw.toLocaleString()}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No kingdoms located in this scan query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", padding: "1.5rem" }}>
            <div className="spinner-large" style={{ width: "28px", height: "28px", margin: "0 auto" }} />
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Scanning stellar coordinates...
            </p>
          </div>
        )}

        {!isLoading && hasMore && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={handleLoadMore}
              className="btn btn-secondary"
            >
              Scan Additional Sectors (+50)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
