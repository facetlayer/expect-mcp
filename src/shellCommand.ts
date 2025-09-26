import { MCPStdinSubprocess } from "./MCPStdinSubprocess.js";

export function shellCommand(command: string, args: string[] = []): MCPStdinSubprocess {
    const subprocess = new MCPStdinSubprocess();
    subprocess.spawn(command, args);
    return subprocess;
  }