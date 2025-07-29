import { Dialog as Modal, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { LoaderCircle, Play } from "lucide-react";
import useTemplateStore from "../stores/templateStore";
import useUIStore from "../stores/uiStore";
import useWorkflowStore from "../stores/workflowStore";

export function TemplatesModal() {
  const {
    templates,
    loadingTemplates,
    createNodeFromTemplate,
  } = useTemplateStore();

  const {
    templatesModalOpen,
    setTemplatesModalOpen,
  } = useUIStore();

  const { addNode } = useWorkflowStore();

  const handleCreateNode = (template) => {
    const newNode = createNodeFromTemplate(template);
    addNode(newNode);
    setTemplatesModalOpen(false);
  };

  return (
    <Modal open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
      <DialogContent className="min-w-[500px] flex flex-col gap-4">
        <DialogHeader>
          <h2 className="text-lg font-bold">Select Node Template</h2>
        </DialogHeader>
        {loadingTemplates ? (
          <div className="text-center py-8">
            <LoaderCircle className="animate-spin" />
            <p>Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <p>No node templates found. Please add one in the backend.</p>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <Button
                key={template.id}
                onClick={() => handleCreateNode(template)}
                className="flex items-center justify-start gap-2"
              >
                <Play />
                {template.name}
              </Button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setTemplatesModalOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Modal>
  );
} 