import { JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';
import { MCPStdinSubprocess } from './MCPStdinSubprocess.js';

export function shellCommand(
  shellCommand: string,
  processOptions: JsonRpcSubprocessOptions = {}
): MCPStdinSubprocess {
  const subprocess = new MCPStdinSubprocess();
  subprocess.spawn(shellCommand, [], {
    ...processOptions,
    shell: true,
  });
  return subprocess;
}
