import { JsonRpcSubprocessOptions } from '@facetlayer/json-rpc-subprocess';
import { MCPStdinSubprocess } from './MCPStdinSubprocess.js';

interface MCPSubprocessOptions extends JsonRpcSubprocessOptions {
  // TODO: strict mode
}

export function shellCommand(
  shellCommand: string,
  processOptions: MCPSubprocessOptions = {}
): MCPStdinSubprocess {
  const subprocess = new MCPStdinSubprocess(processOptions);
  subprocess.spawn(shellCommand, [], {
    ...processOptions,
    shell: true,
  });
  return subprocess;
}
