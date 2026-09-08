import Flow2Page from "@/components/Flow2Page";
import { getProgramsForArea } from "@/lib/online-programs";

export default function Page() {
  const programs = getProgramsForArea("Healthcare & Medicine");

  return <Flow2Page programs={programs} />;
}
