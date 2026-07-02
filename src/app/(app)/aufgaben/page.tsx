import { PageHeader } from "@/components/layout/page-header";
import { TasksPage } from "@/components/tasks/tasks-page";

export default function AufgabenPage() {
  return (
    <>
      <PageHeader title="Aufgaben" description="Wiedervorlagen und offene Aufgaben" />
      <TasksPage />
    </>
  );
}
