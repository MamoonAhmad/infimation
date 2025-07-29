import { useState, useEffect } from "react";
import { Dialog as Modal, DialogContent, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { LoaderCircle, Save } from "lucide-react";
import useEnvironmentStore from "../stores/environmentStore";
import useUIStore from "../stores/uiStore";

export function EnvironmentModal() {
  const { envVars, setEnvVars, saveEnvironmentVariables } =
    useEnvironmentStore();
  const { envModalOpen, setEnvModalOpen } = useUIStore();

  // Local state for environment modal
  const [localEnvVarsJson, setLocalEnvVarsJson] = useState("");
  const [envVarsError, setEnvVarsError] = useState(null);
  const [savingEnvVars, setSavingEnvVars] = useState(false);

  // Sync local state with global state when modal opens
  useEffect(() => {
    if (envModalOpen) {
      setLocalEnvVarsJson(JSON.stringify(envVars, null, 2));
      setEnvVarsError(null);
    }
  }, [envModalOpen, envVars]);

  const handleSave = async () => {
    setSavingEnvVars(true);
    setEnvVarsError(null);
    
    try {
      // Parse JSON from textarea
      const parsedEnvVars = JSON.parse(localEnvVarsJson);
      
      // Validate that it's an object
      if (typeof parsedEnvVars !== 'object' || parsedEnvVars === null || Array.isArray(parsedEnvVars)) {
        throw new Error('Environment variables must be a JSON object');
      }
      
      await saveEnvironmentVariables(parsedEnvVars);
      setEnvModalOpen(false);
    } catch (error) {
      setEnvVarsError(error.message);
    } finally {
      setSavingEnvVars(false);
    }
  };

  return (
    <Modal open={envModalOpen} onOpenChange={setEnvModalOpen}>
      <DialogContent className="min-w-[500px] flex flex-col gap-4">
        <DialogHeader>
          <h2 className="text-lg font-bold">Environment Variables</h2>
        </DialogHeader>
        <Label htmlFor="env-json">Key-Value Pairs (JSON)</Label>
        <Textarea
          id="env-json"
          className="font-mono min-h-[200px]"
          value={localEnvVarsJson}
          onChange={(e) => setLocalEnvVarsJson(e.target.value)}
          placeholder='{"API_KEY": "your-api-key", "BASE_URL": "https://api.example.com"}'
        />
        {envVarsError && (
          <div className="text-red-600 text-xs">{envVarsError}</div>
        )}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setEnvModalOpen(false)}
            disabled={savingEnvVars}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={savingEnvVars}>
            {savingEnvVars ? (
              <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </DialogContent>
    </Modal>
  );
}
