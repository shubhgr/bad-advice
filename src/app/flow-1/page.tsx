import FinalTestPage from "@/components/FinalTestPage";
import { getProgramsForArea } from "@/lib/online-programs";

export default function Page() {
  const programs = getProgramsForArea("Healthcare & Medicine");

  return <FinalTestPage programs={programs} />;
}
