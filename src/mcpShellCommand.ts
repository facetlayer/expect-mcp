import { MCPStdinSubprocess, MCPStdinSubprocessOptions } from './MCPStdinSubprocess.js';

export function mcpShell(
  shellCommand: string,
  processOptions: MCPStdinSubprocessOptions = {}
): MCPStdinSubprocess {
  const subprocess = new MCPStdinSubprocess(processOptions);

  subprocess.spawn(shellCommand, [], {
    ...processOptions,
    shell: true,
  });
  return subprocess;
}
