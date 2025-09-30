import { JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';
import { MCPStdinSubprocess, MCPStdinSubprocessOptions } from './MCPStdinSubprocess.js';

export function shellCommand(
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
