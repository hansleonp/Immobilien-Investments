import { Navigate, Route, Routes } from "react-router-dom";
import { useStore } from "./lib/store";
import { TabBar } from "./components/ui";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Inspections from "./pages/Inspections";
import InspectionDetail from "./pages/InspectionDetail";
import SectionPage from "./pages/SectionPage";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";

export default function App() {
  const { session, authReady } = useStore();

  if (!authReady) {
    return <div className="empty" style={{ paddingTop: "40dvh" }}>Lädt…</div>;
  }
  if (!session) return <Login />;

  return (
    <div className="shell">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/besichtigungen" element={<Inspections />} />
        <Route path="/besichtigung/:id" element={<InspectionDetail />} />
        <Route path="/besichtigung/:id/:section" element={<SectionPage />} />
        <Route path="/immobilien" element={<Properties />} />
        <Route path="/immobilien/:id" element={<PropertyDetail />} />
        <Route path="/vergleich" element={<Compare />} />
        <Route path="/einstellungen" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </div>
  );
}
