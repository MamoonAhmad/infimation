import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoaderCircle, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import useWorkflowStore from "../stores/workflowStore";
import useTemplateStore from "../stores/templateStore";

export function NodeEditDialog() {
  const { nodeToEdit, resetNodeEdit, runNode } = useWorkflowStore();

  const { nodeTemplate, loadNodeTemplate } = useTemplateStore();

  // Local state for node editing
  const [nodeToEditCode, setNodeToEditCode] = useState("");
  const [nodeToEditName, setNodeToEditName] = useState("");

  // Local state for node execution
  const [runningNode, setRunningNode] = useState(false);
  const [runNodeOutput, setRunNodeOutput] = useState(null);
  const [runNodeError, setRunNodeError] = useState(null);

  // Local state for template loading
  const [loadingNodeTemplate, setLoadingNodeTemplate] = useState(false);

  // Update local state when nodeToEdit changes
  useEffect(() => {
    if (nodeToEdit) {
      setNodeToEditCode(nodeToEdit?.data?.code || "");
      setNodeToEditName(nodeToEdit?.data?.label || "");
      setRunNodeOutput(null);
      setRunNodeError(null);
    }
  }, [nodeToEdit]);

  // Load template when node has template_id
  useEffect(() => {
    if (nodeToEdit?.data?.template_id) {
      setLoadingNodeTemplate(true);
      loadNodeTemplate(nodeToEdit.data.template_id).finally(() =>
        setLoadingNodeTemplate(false)
      );
    }
  }, [nodeToEdit?.data?.template_id, loadNodeTemplate]);

  if (!nodeToEdit) return null;

  const handleRunNode = async () => {
    setRunningNode(true);
    setRunNodeOutput(null);
    setRunNodeError(null);

    try {
      const result = await runNode(nodeToEdit.id);
      setRunNodeOutput(result.output);
    } catch (error) {
      setRunNodeError(error.message);
    } finally {
      setRunningNode(false);
    }
  };

  const handleSave = () => {
    if (nodeToEdit) {
      nodeToEdit.data.label = nodeToEditName;
      nodeToEdit.data.code = nodeToEditCode;
    }
    resetNodeEdit();
  };

  return (
    <Dialog
      open={!!nodeToEdit}
      onOpenChange={(open) => {
        if (!open) {
          resetNodeEdit();
        }
      }}
    >
      <DialogContent
        className={"h-[80vh] min-w-[80vw] flex flex-col justify-start overflow-auto"}
      >
        <DialogHeader>
          <DialogTitle>{nodeToEdit?.data?.label}</DialogTitle>
          <DialogDescription>
            Node Configuration
          </DialogDescription>
        </DialogHeader>
        <Tabs className={"grow"}>
          <TabsList defaultValue="info" className={"w-full"}>
            <TabsTrigger value="info">Info</TabsTrigger>
            {nodeToEdit?.data?.template_id && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
            <TabsTrigger value="run">Run</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className={"gap-2 flex flex-col pt-5"}>
            <Label>Node Name</Label>
            <Input
              value={nodeToEditName || ""}
              onChange={(e) => setNodeToEditName(e.target.value)}
            />
            <Label>Code To Execute</Label>
            <Textarea
              value={nodeToEditCode || ""}
              onChange={(e) => setNodeToEditCode(e.target.value)}
              className={"grow"}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </TabsContent>
          {nodeToEdit?.data?.template_id && (
            <TabsContent
              value="settings"
              className={"gap-2 flex flex-col pt-5"}
            >
              {loadingNodeTemplate ? (
                <div className="text-center py-8">
                  <LoaderCircle className="animate-spin" />
                  <p>Loading template settings...</p>
                </div>
              ) : nodeTemplate ? (
                <div className="flex flex-col gap-4">
                  <Label>Template Settings</Label>
                  {Object.entries(nodeTemplate.setting_schema).map(
                    ([key, schema]) => (
                      <div key={key} className="flex flex-col gap-2">
                        <Label htmlFor={`setting-${key}`}>{schema.label}</Label>
                        <Input
                          id={`setting-${key}`}
                          type={schema.type === "number" ? "number" : "text"}
                          value={nodeToEdit?.data?.settings?.[key] || ""}
                          onChange={(e) => {
                            const newSettings = {
                              ...nodeToEdit.data.settings,
                              [key]: e.target.value,
                            };
                            nodeToEdit.data.settings = newSettings;
                          }}
                        />
                      </div>
                    )
                  )}
                  <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                  </DialogFooter>
                </div>
              ) : (
                <p>Failed to load template settings.</p>
              )}
            </TabsContent>
          )}
          <TabsContent value="run" className={"gap-2 flex flex-col pt-5 overflow-hidden"}>
            <div className="flex flex-col gap-2">
              <Button
                disabled={runningNode}
                onClick={handleRunNode}
                className={"self-start"}
              >
                {runningNode ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Play />
                )}{" "}
                Run Node
              </Button>
              {runningNode === false &&
                (runNodeOutput !== null || runNodeError !== null) && (
                  <div className="mt-2 flex flex-col gap-3 overflow-auto">
                    <Label>Node Output</Label>
                    {runNodeError ? (
                      <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                        {JSON.stringify(runNodeError, null, 2)}
                      </pre>
                    ) : runNodeOutput === null ? (
                      <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs">
                        Node did not return any output.
                      </pre>
                    ) : (
                      <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs whitespace-pre-wrap">
                        {JSON.stringify(runNodeOutput, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
